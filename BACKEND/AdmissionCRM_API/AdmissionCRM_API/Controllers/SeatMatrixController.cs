using AdmissionCRM_API.DBContext;
using AdmissionCRM_API.Models;
using DMSAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionCRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeatMatrixController : Controller
    {
        private readonly AppDbContext _dbContext;
        public SeatMatrixController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        #region Seat Mateix Related API's

        [HttpPost("CreateOrUpdateSeatMatrix")]
        public async Task<IActionResult> CreateOrUpdateSeatMatrix(SeatMatrixDto data)
        {
            try
            {
                // Validate for duplication while creating or updating
                var existingSeatMatrix = await _dbContext.SeatMatrix
                    .FirstOrDefaultAsync(x => x.ProgramId == data.ProgramId
                                              && x.AcademicYearId == data.AcademicYearId
                                              && x.EntryTypeId == data.EntryTypeId
                                              && x.AdmissionModeId == data.AdmissionModeId
                                              && x.IsActive == true);

                // Check if the combination of Program, Academic Year, Entry Type, and Admission Mode already exists
                if (existingSeatMatrix != null && existingSeatMatrix.SeatMatrixId != data.SeatMatrixId)
                {
                    return Ok(new { success = false, message = "A Seat Matrix with the same Program, Academic Year, Entry Type, and Admission Mode already exists." });
                }

                // If SeatMatrixId is provided (for update operation)
                if (data.SeatMatrixId > 0)
                {
                    var seatMatrixToUpdate = await _dbContext.SeatMatrix
                        .FirstOrDefaultAsync(x => x.SeatMatrixId == data.SeatMatrixId);

                    if (seatMatrixToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Seat Matrix with Id {data.SeatMatrixId} not found." });
                    }

                    // Update fields if necessary
                    List<string> updatedFields = new List<string>();

                    void UpdateField<T>(string fieldName, T existingValue, T newValue, Action<T> applyChange)
                    {
                        if (!EqualityComparer<T>.Default.Equals(existingValue, newValue))
                        {
                            applyChange(newValue);
                            updatedFields.Add($"{fieldName}: Existing Data : \"{existingValue}\" Updated to \"{newValue}\"");
                        }
                    }

                    UpdateField("TotalSeats", seatMatrixToUpdate.TotalSeats, data.TotalSeats, val => seatMatrixToUpdate.TotalSeats = val);
                    UpdateField("RemainingSeats", seatMatrixToUpdate.RemainingSeats, data.RemainingSeats, val => seatMatrixToUpdate.RemainingSeats = val);
                    UpdateField("IsActive", seatMatrixToUpdate.IsActive, data.IsActive, val => seatMatrixToUpdate.IsActive = val);

                    seatMatrixToUpdate.ModifiedOn = DateTime.Now;
                    seatMatrixToUpdate.ModifiedBy = data.UserId;

                    _dbContext.SeatMatrix.Update(seatMatrixToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Seat Matrix Id {data.SeatMatrixId} updated fields: {string.Join(", ", updatedFields)}",
                            "SeatMatrix");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Seat Matrix updated successfully.", data = data });
                }
                else
                {
                    // If Seat Matrix does not exist → Create new
                    var newSeatMatrix = new SeatMatrix
                    {
                        ProgramId = data.ProgramId,
                        AcademicYearId = data.AcademicYearId,
                        EntryTypeId = data.EntryTypeId,
                        AdmissionModeId = data.AdmissionModeId,
                        TotalSeats = data.TotalSeats,
                        RemainingSeats = data.RemainingSeats,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.SeatMatrix.AddAsync(newSeatMatrix);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Seat Matrix created with ProgramId {data.ProgramId}, AcademicYearId {data.AcademicYearId}, EntryTypeId {data.EntryTypeId}, AdmissionModeId {data.AdmissionModeId}",
                        "SeatMatrix");

                    return Ok(new { success = true, message = "Seat Matrix created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllSeatMatrix")]
        public async Task<IActionResult> GetAllSeatMatrix()
        {
            try
            {
                var seatMatrices = await _dbContext.SeatMatrix
                    .Where(x => x.IsActive == true)
                    .OrderBy(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Seat Matrix data fetched successfully", data = seatMatrices });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetSeatMatrixById")]
        public async Task<IActionResult> GetSeatMatrixById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Seat Matrix Id." });
                }

                var seatMatrix = await _dbContext.SeatMatrix
                    .FirstOrDefaultAsync(x => x.SeatMatrixId == id && x.IsActive == true);

                if (seatMatrix == null)
                {
                    return Ok(new { success = false, message = $"Seat Matrix with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Seat Matrix data fetched successfully", data = seatMatrix });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteSeatMatrixById")]
        public async Task<IActionResult> DeleteSeatMatrixById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Seat Matrix Id is required" });
                }
                if (string.IsNullOrWhiteSpace(UserId))
                {
                    return Ok(new { success = false, message = "UserId is required" });
                }

                var userExists = await _dbContext.Users.AnyAsync(x => x.UserID.ToString().ToLower() == UserId.ToString() && x.IsActive == true);
                if (!userExists)
                {
                    return Ok(new { success = false, message = "UserId Not Found" });
                }

                var seatMatrix = await _dbContext.SeatMatrix.FirstOrDefaultAsync(x => x.SeatMatrixId == id);
                if (seatMatrix == null)
                {
                    return Ok(new { success = false, message = "Seat Matrix not found" });
                }

                _dbContext.SeatMatrix.Remove(seatMatrix);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Seat Matrix with Id {id} deleted. ProgramId: '{seatMatrix.ProgramId}', AcademicYearId: '{seatMatrix.AcademicYearId}'", "SeatMatrix");

                return Ok(new { success = true, message = "Seat Matrix deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        #endregion
    }
}
