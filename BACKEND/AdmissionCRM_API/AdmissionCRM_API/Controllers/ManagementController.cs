using AdmissionCRM_API.DBContext;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionCRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManagementController : Controller
    {
        private readonly AppDbContext _dbContext;
        public ManagementController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        #region Dashboard related API's

        [HttpGet("GetTotalIntakeVsAdmitted")]
        public async Task<IActionResult> GetTotalIntakeVsAdmitted()
        {
            try
            {
                var totalIntake = await _dbContext.SeatMatrix
                    .Where(x => x.IsActive == true)
                    .SumAsync(x => x.TotalSeats ?? 0);

                var totalAdmitted = await _dbContext.ApplicantForm
                    .Where(x => x.IsActive == true && x.FeeStatus == "Paid")
                    .CountAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalIntake,
                        totalAdmitted,
                        remainingSeats = totalIntake - totalAdmitted
                    }
                });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetQuotaWiseSeatStatus")]
        public async Task<IActionResult> GetQuotaWiseSeatStatus()
        {
            try
            {
                var data = await _dbContext.Quota
                    .Where(q => q.IsActive == true)
                    .Select(q => new
                    {
                        q.QuotaId,
                        QuotaName = q.Name,
                        TotalQuota = q.TotalQuota ?? 0,
                        FilledSeats = (q.TotalQuota ?? 0) - (q.RemainingQuota ?? 0),
                        RemainingQuota = q.RemainingQuota ?? 0
                    })
                    .ToListAsync();

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }


        [HttpGet("GetRemainingSeats")]
        public async Task<IActionResult> GetRemainingSeats()
        {
            try
            {
                var data = await (from sm in _dbContext.SeatMatrix
                                  join p in _dbContext.ProgramBranch on sm.ProgramId equals p.ProgramId
                                  join ay in _dbContext.AcademicYear on sm.AcademicYearId equals ay.AcademicYearId
                                  where sm.IsActive == true
                                  select new
                                  {
                                      p.ProgramId,
                                      ProgramName = $"{p.ProgramName}-{p.CourseType}",
                                      ay.AcademicYearId,
                                      AcademicYear = ay.YearLabel,
                                      sm.RemainingSeats
                                  }).ToListAsync();

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetApplicantsWithPendingDocuments")]
        public async Task<IActionResult> GetApplicantsWithPendingDocuments()
        {
            try
            {
                var data = await (from a in _dbContext.ApplicantForm
                                  join p in _dbContext.ProgramBranch on a.ProgramId equals p.ProgramId
                                  where a.IsActive == true
                                        && a.DocumentStatus != "Verified"
                                  orderby a.CreatedOn descending
                                  select new
                                  {
                                      a.ApplicantId,
                                      ApplicantName = a.FirstName + " " + a.LastName,
                                      ProgramName = $"{p.ProgramName}-{p.CourseType}",
                                      a.DocumentStatus
                                  }).ToListAsync();

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetFeePendingApplicants")]
        public async Task<IActionResult> GetFeePendingApplicants()
        {
            try
            {
                var data = await (from a in _dbContext.ApplicantForm
                                  join p in _dbContext.ProgramBranch on a.ProgramId equals p.ProgramId
                                  join q in _dbContext.Quota on a.QuotaId equals q.QuotaId
                                  where a.IsActive == true
                                        && a.FeeStatus == "Pending"
                                  orderby a.CreatedOn descending
                                  select new
                                  {
                                      a.ApplicantId,
                                      ApplicantName = a.FirstName + " " + a.LastName,
                                      ProgramName = $"{p.ProgramName}-{p.CourseType}",
                                      QuotaName = q.Name,
                                      a.FeeStatus
                                  }).ToListAsync();

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        #endregion
    }
}
