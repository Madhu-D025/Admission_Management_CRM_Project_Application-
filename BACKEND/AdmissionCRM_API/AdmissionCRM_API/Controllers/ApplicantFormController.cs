using AdmissionCRM_API.DBContext;
using AdmissionCRM_API.Models;
using AuthApplication.Models;
using DMSAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WM.Services;

namespace AdmissionCRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicantFormController : Controller
    {
        private readonly AppDbContext _dbContext;
        private readonly DocumentService _docservice;
        public ApplicantFormController(AppDbContext dbContext, DocumentService documentService)
        {
            _dbContext = dbContext;
            _docservice = documentService;
        }

        #region Applicant Form Related API's
        [HttpPost("CreateApplicantFormDetails")]
        public async Task<IActionResult> CreateApplicantFormDetails(ApplicantFormDto data)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 🔥 DUPLICATE CHECK
                var duplicateApplicant = await _dbContext.ApplicantForm
                    .FirstOrDefaultAsync(x =>
                        x.FirstName == data.FirstName &&
                        x.LastName == data.LastName &&
                        x.DOB == data.DOB &&
                        x.ApplicantId != data.ApplicantId &&
                        x.IsActive == true);

                if (duplicateApplicant != null)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Applicant with same Name and PhoneNumber already exists."
                    });
                }

                // 🔹 EXISTING SEAT VALIDATION (UNCHANGED)
                var seatMatrix = await _dbContext.SeatMatrix
                    .FirstOrDefaultAsync(x =>
                        x.ProgramId == data.ProgramId &&
                        x.AcademicYearId == data.AcademicYearId &&
                        x.EntryTypeId == data.EntryTypeId &&
                        x.AdmissionModeId == data.AdmissionModeId &&
                        x.IsActive == true);

                if (seatMatrix == null || seatMatrix.RemainingSeats <= 0)
                {
                    return Ok(new { success = false, message = "No seats available for the selected criteria." });
                }

                var quota = await _dbContext.Quota
                    .FirstOrDefaultAsync(x =>
                        x.QuotaId == data.QuotaId &&
                        x.SeatMatrixId == seatMatrix.SeatMatrixId &&
                        x.IsActive == true);

                if (quota == null || quota.RemainingQuota <= 0)
                {
                    return Ok(new { success = false, message = "No seats available for the selected quota." });
                }

                // 🔹 CREATE APPLICANT
                var applicant = new ApplicantForm
                {
                    FirstName = data.FirstName,
                    LastName = data.LastName,
                    DOB = data.DOB,
                    Category = data.Category,
                    EntryTypeId = data.EntryTypeId,
                    AdmissionModeId = data.AdmissionModeId,
                    ProgramId = data.ProgramId,
                    AcademicYearId = data.AcademicYearId,
                    QuotaId = data.QuotaId,
                    Marks = data.Marks,
                    DocumentStatus = "Submitted",
                    FeeStatus = "Pending",
                    AdmissionNumber = null,
                    IsActive = true,
                    CreatedOn = DateTime.Now,
                    CreatedBy = data.UserId
                };

                await _dbContext.ApplicantForm.AddAsync(applicant);
                await _dbContext.SaveChangesAsync();

                int applicantId = applicant.ApplicantId;
                int uploadedDocCount = 0;

                // 🔥 DOCUMENT UPLOAD LOGIC
                if (data.Documents != null && data.Documents.Any())
                {
                    var documentDto = new Documentdto
                    {
                        Documents = data.Documents,
                        DocumentId = applicantId.ToString(),
                        documentType = "ApplicantDocuments",
                        FolderName = "ApplicantDocuments",
                        UserID = data.UserId
                    };

                    await _docservice.DocumentsUpload(documentDto);
                    await _dbContext.SaveChangesAsync();
                    uploadedDocCount = data.Documents.Count;
                }

                await transaction.CommitAsync();

                Log.DataLog($"{data.UserId}",
                    $"Applicant created (ID: {applicantId}) with {uploadedDocCount} documents uploaded",
                    "Applicant");

                return Ok(new
                {
                    success = true,
                    message = "Applicant created successfully.",
                    applicantId,
                    uploadedDocuments = uploadedDocCount
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllApplicantFormDetails")]
        public async Task<IActionResult> GetAllApplicantFormDetails()
        {
            try
            {
                var data = await (from a in _dbContext.ApplicantForm
                                  join p in _dbContext.ProgramBranch on a.ProgramId equals p.ProgramId
                                  join q in _dbContext.Quota on a.QuotaId equals q.QuotaId
                                  join e in _dbContext.EntryType on a.EntryTypeId equals e.EntryTypeId
                                  join am in _dbContext.AdmissionMode on a.AdmissionModeId equals am.AdmissionModeId
                                  join ay in _dbContext.AcademicYear on a.AcademicYearId equals ay.AcademicYearId
                                  where a.IsActive == true
                                  orderby a.CreatedOn descending
                                  select new
                                  {
                                      a.ApplicantId,
                                      a.FirstName,
                                      a.LastName,
                                      a.DOB,
                                      a.Category,

                                      e.EntryTypeId,
                                      EntryType = e.Name,

                                      am.AdmissionModeId,
                                      AdmissionMode = am.AdmissionType,

                                      p.ProgramId,
                                      ProgramName = $"{p.ProgramName}-{p.CourseType}",

                                      ay.AcademicYearId,
                                      AcademicYear = ay.YearLabel,

                                      q.QuotaId,
                                      QuotaName = q.Name,

                                      a.Marks,
                                      a.DocumentStatus,
                                      a.FeeStatus,
                                      a.AdmissionNumber,
                                      a.IsActive,

                                      a.CreatedOn,
                                      a.CreatedBy,
                                      a.ModifiedOn,
                                      a.ModifiedBy
                                  }).ToListAsync();   // ✅ Execute query

                return Ok(new { success = true, message = "Applicant data fetched successfully", data = data });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetApplicantFormDetailsByApplicantId")]
        public async Task<IActionResult> GetApplicantFormDetailsByApplicantId(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Applicant Id." });
                }

                var data = await (from a in _dbContext.ApplicantForm
                                  join p in _dbContext.ProgramBranch on a.ProgramId equals p.ProgramId
                                  join q in _dbContext.Quota on a.QuotaId equals q.QuotaId
                                  join e in _dbContext.EntryType on a.EntryTypeId equals e.EntryTypeId
                                  join am in _dbContext.AdmissionMode on a.AdmissionModeId equals am.AdmissionModeId
                                  join ay in _dbContext.AcademicYear on a.AcademicYearId equals ay.AcademicYearId
                                  where a.ApplicantId == id && a.IsActive == true
                                  select new
                                  {
                                      a.ApplicantId,
                                      a.FirstName,
                                      a.LastName,
                                      a.DOB,
                                      a.Category,

                                      e.EntryTypeId,
                                      EntryType = e.Name,

                                      am.AdmissionModeId,
                                      AdmissionMode = am.AdmissionType,

                                      p.ProgramId,
                                      ProgramName = $"{p.ProgramName}-{p.CourseType}",

                                      ay.AcademicYearId,
                                      AcademicYear = ay.YearLabel,

                                      q.QuotaId,
                                      QuotaName = q.Name,

                                      a.Marks,
                                      a.DocumentStatus,
                                      a.FeeStatus,
                                      a.AdmissionNumber,
                                      a.IsActive,

                                      a.CreatedOn,
                                      a.CreatedBy,
                                      a.ModifiedOn,
                                      a.ModifiedBy
                                  }).FirstOrDefaultAsync();   // ✅ Single record

                if (data == null)
                {
                    return Ok(new { success = false, message = $"Applicant with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Applicant data fetched successfully", data = data });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("UpdateApplicantFormDetails")]
        public async Task<IActionResult> UpdateApplicantFormDetails(ApplicantFormDto data)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var applicant = await _dbContext.ApplicantForm
                    .FirstOrDefaultAsync(x => x.ApplicantId == data.ApplicantId && x.IsActive == true);

                if (applicant == null)
                    return Ok(new { success = false, message = "Applicant not found." });

                // 🔥 DUPLICATE CHECK
                var duplicateApplicant = await _dbContext.ApplicantForm
                    .FirstOrDefaultAsync(x =>
                        x.FirstName == data.FirstName &&
                        x.LastName == data.LastName &&
                        x.DOB == data.DOB &&
                        x.ApplicantId != data.ApplicantId &&
                        x.IsActive == true);

                if (duplicateApplicant != null)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Applicant with same Name and PhoneNumber already exists."
                    });
                }

                // 🔥 SEAT RE-VALIDATION IF KEY FIELDS CHANGE
                bool seatCriteriaChanged =
                    applicant.ProgramId != data.ProgramId ||
                    applicant.AcademicYearId != data.AcademicYearId ||
                    applicant.EntryTypeId != data.EntryTypeId ||
                    applicant.AdmissionModeId != data.AdmissionModeId ||
                    applicant.QuotaId != data.QuotaId;

                if (seatCriteriaChanged)
                {
                    var seatMatrix = await _dbContext.SeatMatrix.FirstOrDefaultAsync(x =>
                        x.ProgramId == data.ProgramId &&
                        x.AcademicYearId == data.AcademicYearId &&
                        x.EntryTypeId == data.EntryTypeId &&
                        x.AdmissionModeId == data.AdmissionModeId &&
                        x.IsActive == true);

                    if (seatMatrix == null || seatMatrix.RemainingSeats <= 0)
                    {
                        return Ok(new { success = false, message = "No seats available for updated criteria." });
                    }

                    var quota = await _dbContext.Quota.FirstOrDefaultAsync(x =>
                        x.QuotaId == data.QuotaId &&
                        x.SeatMatrixId == seatMatrix.SeatMatrixId &&
                        x.IsActive == true);

                    if (quota == null || quota.RemainingQuota <= 0)
                    {
                        return Ok(new { success = false, message = "No quota seats available for updated criteria." });
                    }
                }

                // 🔹 UPDATE ALLOWED FIELDS ONLY
                applicant.FirstName = data.FirstName;
                applicant.LastName = data.LastName;
                applicant.DOB = data.DOB;
                applicant.Category = data.Category;
                applicant.EntryTypeId = data.EntryTypeId;
                applicant.AdmissionModeId = data.AdmissionModeId;
                applicant.ProgramId = data.ProgramId;
                applicant.AcademicYearId = data.AcademicYearId;
                applicant.QuotaId = data.QuotaId;
                applicant.Marks = data.Marks;
                applicant.IsActive = data.IsActive;
                applicant.ModifiedOn = DateTime.Now;
                applicant.ModifiedBy = data.UserId;

                _dbContext.ApplicantForm.Update(applicant);

                // 🔥 DOCUMENT REPLACEMENT
                if (data.Documents != null && data.Documents.Any())
                {
                    var oldAttachments = _dbContext.DocumentMaster
                        .Where(a => a.DocumentId == applicant.ApplicantId.ToString()
                        && a.DocumentType == "ApplicantDocuments");

                    _dbContext.DocumentMaster.RemoveRange(oldAttachments);

                    var documentDto = new Documentdto
                    {
                        Documents = data.Documents,
                        DocumentId = applicant.ApplicantId.ToString(),
                        documentType = "ApplicantDocuments",
                        FolderName = "ApplicantDocuments",
                        UserID = data.UserId
                    };

                    await _docservice.DocumentsUpload(documentDto);
                    //if (!uploadResult)
                    //{
                    //    await transaction.RollbackAsync();
                    //    return Ok(new { success = false, message = "Document replacement failed." });
                    //}
                }

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                Log.DataLog($"{data.UserId}",
                    $"Applicant {data.ApplicantId} updated successfully",
                    "Applicant");

                return Ok(new { success = true, message = "Applicant updated successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return Ok(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Document Status Update API
        [HttpPost("UpdateApplicantFormDocumentStatusByApplicantId")]
        public async Task<IActionResult> UpdateApplicantFormDocumentStatusByApplicantId(ApplicantDocumentStatusDto data)
        {
            try
            {
                var applicant = await _dbContext.ApplicantForm
                    .FirstOrDefaultAsync(x => x.ApplicantId == data.ApplicantId && x.IsActive == true);

                if (applicant == null)
                    return Ok(new { success = false, message = "Applicant not found." });

                applicant.DocumentStatus = "Verified";
                applicant.ModifiedOn = DateTime.UtcNow;
                applicant.ModifiedBy = data.UserId;

                _dbContext.ApplicantForm.Update(applicant);
                await _dbContext.SaveChangesAsync();

                Log.DataLog($"{data.UserId}",
                    $"Applicant {data.ApplicantId} document verified",
                    "Applicant");

                return Ok(new { success = true, message = "Documents verified successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }
        #endregion

        #region Fee Status Update API
        [HttpPost("UpdateApplicantFormFeeStatus")]
        public async Task<IActionResult> UpdateApplicantFormFeeStatus(ApplicantFeeStatusDto data)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var applicant = await _dbContext.ApplicantForm
                    .FirstOrDefaultAsync(x => x.ApplicantId == data.ApplicantId && x.IsActive == true);

                if (applicant == null)
                    return Ok(new { success = false, message = "Applicant not found." });

                if (applicant.FeeStatus == "Paid")
                    return Ok(new { success = false, message = "Fee already paid." });

                if (applicant.DocumentStatus != "Verified")
                    return Ok(new { success = false, message = "Documents must be verified before fee payment." });

                var seatMatrix = await _dbContext.SeatMatrix.FirstOrDefaultAsync(x =>
                    x.ProgramId == applicant.ProgramId &&
                    x.AcademicYearId == applicant.AcademicYearId &&
                    x.EntryTypeId == applicant.EntryTypeId &&
                    x.AdmissionModeId == applicant.AdmissionModeId &&
                    x.IsActive == true);

                var quota = await _dbContext.Quota.FirstOrDefaultAsync(x =>
                    x.QuotaId == applicant.QuotaId &&
                    x.SeatMatrixId == seatMatrix.SeatMatrixId &&
                    x.IsActive == true);

                if (seatMatrix.RemainingSeats <= 0 || quota.RemainingQuota <= 0)
                    return Ok(new { success = false, message = "Seats no longer available." });

                // Admission Number generation
                int count = await _dbContext.ApplicantForm
                    .CountAsync(x => x.AcademicYearId == applicant.AcademicYearId &&
                                     x.ProgramId == applicant.ProgramId &&
                                     x.AdmissionModeId == applicant.AdmissionModeId &&
                                     x.AdmissionNumber != null);

                applicant.AdmissionNumber = $"INST/{applicant.AcademicYearId}/CSE/KCET/{(count + 1).ToString("D4")}";

                seatMatrix.RemainingSeats -= 1;
                quota.RemainingQuota -= 1;

                _dbContext.SeatMatrix.Update(seatMatrix);
                _dbContext.Quota.Update(quota);

                var allocation = new AdmissionAllocation
                {
                    ApplicantId = applicant.ApplicantId,
                    SeatMatrixId = seatMatrix.SeatMatrixId,
                    QuotaId = quota.QuotaId,
                    AllocatedAt = DateTime.UtcNow,
                    Confirmed = true,
                    IsActive = true,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = data.UserId
                };

                await _dbContext.AdmissionAllocation.AddAsync(allocation);

                applicant.FeeStatus = "Paid";
                applicant.ModifiedOn = DateTime.UtcNow;
                applicant.ModifiedBy = data.UserId;

                _dbContext.ApplicantForm.Update(applicant);

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                Log.DataLog($"{data.UserId}",
                    $"Admission confirmed for Applicant {applicant.ApplicantId} with AdmissionNumber {applicant.AdmissionNumber}",
                    "Admission");

                return Ok(new { success = true, message = "Admission confirmed successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return Ok(new { success = false, message = ex.Message });
            }
        }
        #endregion
    }
}
