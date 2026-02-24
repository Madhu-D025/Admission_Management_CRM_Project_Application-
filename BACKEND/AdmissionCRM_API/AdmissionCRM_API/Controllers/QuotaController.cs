using AdmissionCRM_API.DBContext;
using AdmissionCRM_API.Models;
using DMSAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionCRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuotaController : Controller
    {
        private readonly AppDbContext _dbContext;
        public QuotaController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        #region Quota Related API's
        [HttpPost("CreateOrUpdateQuota")]
        public async Task<IActionResult> CreateOrUpdateQuota(QuotaDto data)
        {
            try
            {
                // Validate for duplication while creating or updating
                var existingQuota = await _dbContext.Quota
                    .FirstOrDefaultAsync(x => x.SeatMatrixId == data.SeatMatrixId
                                              && x.Name.Equals(data.Name, StringComparison.OrdinalIgnoreCase)
                                              && x.IsActive == true);

                // Check if the combination of SeatMatrixId and QuotaName already exists
                if (existingQuota != null && existingQuota.QuotaId != data.QuotaId)
                {
                    return Ok(new { success = false, message = $"Quota '{data.Name}' already exists for this Seat Matrix." });
                }

                // If QuotaId is provided (for update operation)
                if (data.QuotaId > 0)
                {
                    var quotaToUpdate = await _dbContext.Quota
                        .FirstOrDefaultAsync(x => x.QuotaId == data.QuotaId);

                    if (quotaToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Quota with Id {data.QuotaId} not found." });
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

                    UpdateField("Name", quotaToUpdate.Name, data.Name, val => quotaToUpdate.Name = val);
                    UpdateField("TotalQuota", quotaToUpdate.TotalQuota, data.TotalQuota, val => quotaToUpdate.TotalQuota = val);
                    UpdateField("RemainingQuota", quotaToUpdate.RemainingQuota, data.RemainingQuota, val => quotaToUpdate.RemainingQuota = val);
                    UpdateField("IsActive", quotaToUpdate.IsActive, data.IsActive, val => quotaToUpdate.IsActive = val);

                    quotaToUpdate.ModifiedOn = DateTime.Now;
                    quotaToUpdate.ModifiedBy = data.UserId;

                    _dbContext.Quota.Update(quotaToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Quota Id {data.QuotaId} updated fields: {string.Join(", ", updatedFields)}",
                            "Quota");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Quota updated successfully.", data = data });
                }
                else
                {
                    // If Quota does not exist → Create new
                    var newQuota = new Quota
                    {
                        SeatMatrixId = data.SeatMatrixId,
                        Name = data.Name,
                        TotalQuota = data.TotalQuota,
                        RemainingQuota = data.RemainingQuota,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.Quota.AddAsync(newQuota);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Quota created with SeatMatrixId {data.SeatMatrixId} and Name {data.Name}",
                        "Quota");

                    return Ok(new { success = true, message = "Quota created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllQuota")]
        public async Task<IActionResult> GetAllQuota()
        {
            try
            {
                var quotas = await _dbContext.Quota
                    .Where(x => x.IsActive == true)
                    .OrderBy(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Quota data fetched successfully", data = quotas });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetQuotaById")]
        public async Task<IActionResult> GetQuotaById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Quota Id." });
                }

                var quota = await _dbContext.Quota
                    .FirstOrDefaultAsync(x => x.QuotaId == id && x.IsActive == true);

                if (quota == null)
                {
                    return Ok(new { success = false, message = $"Quota with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Quota data fetched successfully", data = quota });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteQuotaById")]
        public async Task<IActionResult> DeleteQuotaById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Quota Id is required" });
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

                var quota = await _dbContext.Quota.FirstOrDefaultAsync(x => x.QuotaId == id);
                if (quota == null)
                {
                    return Ok(new { success = false, message = "Quota not found" });
                }

                _dbContext.Quota.Remove(quota);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Quota with Id {id} deleted. Name: '{quota.Name}', SeatMatrixId: '{quota.SeatMatrixId}'", "Quota");

                return Ok(new { success = true, message = "Quota deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        #endregion
    }
}
