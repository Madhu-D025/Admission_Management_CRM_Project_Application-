using DMSAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdmissionCRM_API.Models;
using AdmissionCRM_API.DBContext;

namespace SOW.Controllers
{
    [ApiController]
    [Route("api/MasterController")]
    public class MasterController : Controller
    {
        private readonly AppDbContext _dbContext;

        public MasterController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        #region Institution Master Related API's

        [HttpPost("CreateOrUpdateInstitution")]
        public async Task<IActionResult> CreateOrUpdateInstitution(InstitutionDto data)
        {
            try
            {
                // Validation: If InstitutionName is provided, check for duplicates (case-insensitive) for active Institution
                var existingInstitution = await _dbContext.Institution
                    .FirstOrDefaultAsync(x => x.InstitutionName != null && x.InstitutionName.ToLower().Trim() == data.InstitutionName.ToLower().Trim() && x.InstitutionCode.ToLower().Trim() == data.InstitutionCode.ToLower().Trim() && x.IsActive == true);

                if (existingInstitution != null && existingInstitution.InstitutionId != data.InstitutionId)
                {
                    return Ok(new { success = false, message = $"Institution with name '{data.InstitutionName}' already exists." });
                }

                // If the Institution exists → Update
                if (data.InstitutionId > 0)
                {
                    var institutionToUpdate = await _dbContext.Institution
                        .FirstOrDefaultAsync(x => x.InstitutionId == data.InstitutionId);

                    if (institutionToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Institution with Id {data.InstitutionId} not found." });
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

                    UpdateField("InstitutionName", institutionToUpdate.InstitutionName, data.InstitutionName, val => institutionToUpdate.InstitutionName = val);
                    UpdateField("InstitutionCode", institutionToUpdate.InstitutionCode, data.InstitutionCode, val => institutionToUpdate.InstitutionCode = val);
                    UpdateField("IsActive", institutionToUpdate.IsActive, data.IsActive, val => institutionToUpdate.IsActive = val);

                    institutionToUpdate.ModifiedOn = DateTime.Now;
                    institutionToUpdate.ModifiedBy = data.UserId;

                    _dbContext.Institution.Update(institutionToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Institution Id {data.InstitutionId} updated fields: {string.Join(", ", updatedFields)}",
                            "Institution");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Institution updated successfully.", data = data });
                }
                else
                {
                    // If Institution does not exist → Create new
                    var newInstitution = new Institution
                    {
                        InstitutionName = data.InstitutionName,
                        InstitutionCode = data.InstitutionCode,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.Institution.AddAsync(newInstitution);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Institution created with Name {data.InstitutionName} and Code {data.InstitutionCode}",
                        "Institution");

                    return Ok(new { success = true, message = "Institution created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllInstitutions")]
        public async Task<IActionResult> GetAllInstitutions()
        {
            try
            {
                var institutions = await _dbContext.Institution
                    .Where(x => x.IsActive == true)
                    .OrderByDescending(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Institutions data fetched successfully", data = institutions });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetInstitutionById")]
        public async Task<IActionResult> GetInstitutionById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Institution Id." });
                }

                var institution = await _dbContext.Institution
                    .FirstOrDefaultAsync(x => x.InstitutionId == id && x.IsActive == true);

                if (institution == null)
                {
                    return Ok(new { success = false, message = $"Institution with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Institution data fetched successfully", data = institution });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteInstitutionById")]
        public async Task<IActionResult> DeleteInstitutionById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Institution Id is required" });
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

                var institution = await _dbContext.Institution.FirstOrDefaultAsync(x => x.InstitutionId == id);
                if (institution == null)
                {
                    return Ok(new { success = false, message = "Institution not found" });
                }

                _dbContext.Institution.Remove(institution);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Institution with Id {id} deleted. Name: '{institution.InstitutionName}', Code: '{institution.InstitutionCode}'", "Institution");

                return Ok(new { success = true, message = "Institution deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }


        #endregion

        #region Campus Master Related API's
        [HttpPost("CreateOrUpdateCampus")]
        public async Task<IActionResult> CreateOrUpdateCampus(CampusDto data)
        {
            try
            {
                // Validation: Check if the Campus Name already exists under the same Institution
                var existingCampus = await _dbContext.Campus
                    .FirstOrDefaultAsync(x => x.CampusName != null && x.CampusName.ToLower().Trim() == data.CampusName.ToLower().Trim()
                                              && x.InstitutionId == data.InstitutionId
                                              && x.IsActive == true);

                // If an existing campus is found with the same name under the same institution (for creation or update)
                if (existingCampus != null && existingCampus.CampusId != data.CampusId)
                {
                    return Ok(new { success = false, message = $"Campus with name '{data.CampusName}' already exists under the selected Institution." });
                }

                // If Campus exists → Update
                if (data.CampusId > 0)
                {
                    var campusToUpdate = await _dbContext.Campus
                        .FirstOrDefaultAsync(x => x.CampusId == data.CampusId);

                    if (campusToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Campus with Id {data.CampusId} not found." });
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

                    UpdateField("CampusName", campusToUpdate.CampusName, data.CampusName, val => campusToUpdate.CampusName = val);
                    UpdateField("City", campusToUpdate.City, data.City, val => campusToUpdate.City = val);
                    UpdateField("IsActive", campusToUpdate.IsActive, data.IsActive, val => campusToUpdate.IsActive = val);

                    campusToUpdate.ModifiedOn = DateTime.Now;
                    campusToUpdate.ModifiedBy = data.UserId;

                    _dbContext.Campus.Update(campusToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Campus Id {data.CampusId} updated fields: {string.Join(", ", updatedFields)}",
                            "Campus");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Campus updated successfully.", data = data });
                }
                else
                {
                    // If Campus does not exist → Create new
                    var newCampus = new Campus
                    {
                        InstitutionId = data.InstitutionId,
                        CampusName = data.CampusName,
                        City = data.City,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.Campus.AddAsync(newCampus);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Campus created with Name {data.CampusName} under Institution Id {data.InstitutionId}",
                        "Campus");

                    return Ok(new { success = true, message = "Campus created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllCampus")]
        public async Task<IActionResult> GetAllCampus()
        {
            try
            {
                var campuses = await _dbContext.Campus
                    .Where(x => x.IsActive == true)
                    .OrderByDescending(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Campus data fetched successfully", data = campuses });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetCampusById")]
        public async Task<IActionResult> GetCampusById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Campus Id." });
                }

                var campus = await _dbContext.Campus
                    .FirstOrDefaultAsync(x => x.CampusId == id && x.IsActive == true);

                if (campus == null)
                {
                    return Ok(new { success = false, message = $"Campus with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Campus data fetched successfully", data = campus });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteCampusById")]
        public async Task<IActionResult> DeleteCampusById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Campus Id is required" });
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

                var campus = await _dbContext.Campus.FirstOrDefaultAsync(x => x.CampusId == id);
                if (campus == null)
                {
                    return Ok(new { success = false, message = "Campus not found" });
                }

                _dbContext.Campus.Remove(campus);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Campus with Id {id} deleted. Name: '{campus.CampusName}', InstitutionId: '{campus.InstitutionId}'", "Campus");

                return Ok(new { success = true, message = "Campus deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }


        #endregion

        #region Department Master Related API's
        [HttpPost("CreateOrUpdateDepartment")]
        public async Task<IActionResult> CreateOrUpdateDepartment(DepartmentDto data)
        {
            try
            {
                // Validation: Check if the Department Name already exists under the same Campus
                var existingDepartment = await _dbContext.Department
                    .FirstOrDefaultAsync(x => x.DepartmentName != null && x.DepartmentName.ToLower().Trim() == data.DepartmentName.ToLower().Trim()
                                              && x.CampusId == data.CampusId
                                              && x.IsActive == true);

                // If an existing department is found with the same name under the same campus (for creation or update)
                if (existingDepartment != null && existingDepartment.DepartmentId != data.DepartmentId)
                {
                    return Ok(new { success = false, message = $"Department with name '{data.DepartmentName}' already exists under the selected Campus." });
                }

                // If Department exists → Update
                if (data.DepartmentId > 0)
                {
                    var departmentToUpdate = await _dbContext.Department
                        .FirstOrDefaultAsync(x => x.DepartmentId == data.DepartmentId);

                    if (departmentToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Department with Id {data.DepartmentId} not found." });
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

                    UpdateField("DepartmentName", departmentToUpdate.DepartmentName, data.DepartmentName, val => departmentToUpdate.DepartmentName = val);
                    UpdateField("IsActive", departmentToUpdate.IsActive, data.IsActive, val => departmentToUpdate.IsActive = val);

                    departmentToUpdate.ModifiedOn = DateTime.Now;
                    departmentToUpdate.ModifiedBy = data.UserId;

                    _dbContext.Department.Update(departmentToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Department Id {data.DepartmentId} updated fields: {string.Join(", ", updatedFields)}",
                            "Department");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Department updated successfully.", data = data });
                }
                else
                {
                    // If Department does not exist → Create new
                    var newDepartment = new Department
                    {
                        CampusId = data.CampusId,
                        DepartmentName = data.DepartmentName,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.Department.AddAsync(newDepartment);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Department created with Name {data.DepartmentName} under Campus Id {data.CampusId}",
                        "Department");

                    return Ok(new { success = true, message = "Department created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllDepartment")]
        public async Task<IActionResult> GetAllDepartment()
        {
            try
            {
                var departments = await _dbContext.Department
                    .Where(x => x.IsActive == true)
                    .OrderByDescending(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Department data fetched successfully", data = departments });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetDepartmentById")]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Department Id." });
                }

                var department = await _dbContext.Department
                    .FirstOrDefaultAsync(x => x.DepartmentId == id && x.IsActive == true);

                if (department == null)
                {
                    return Ok(new { success = false, message = $"Department with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Department data fetched successfully", data = department });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteDepartmentById")]
        public async Task<IActionResult> DeleteDepartmentById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Department Id is required" });
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

                var department = await _dbContext.Department.FirstOrDefaultAsync(x => x.DepartmentId == id);
                if (department == null)
                {
                    return Ok(new { success = false, message = "Department not found" });
                }

                _dbContext.Department.Remove(department);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Department with Id {id} deleted. Name: '{department.DepartmentName}', CampusId: '{department.CampusId}'", "Department");

                return Ok(new { success = true, message = "Department deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }


        #endregion

        #region Program Branch Master Related API's
        [HttpPost("CreateOrUpdateProgramBranch")]
        public async Task<IActionResult> CreateOrUpdateProgramBranch(ProgramBranchDto data)
        {
            try
            {
                // Validation: Check if a Program with the same Program Name and Course Type exists under the same Department
                var existingProgram = await _dbContext.ProgramBranch
                    .FirstOrDefaultAsync(x => x.ProgramName != null && x.ProgramName.ToLower().Trim() == data.ProgramName.ToLower().Trim()
                                              && x.CourseType != null && x.CourseType.ToLower().Trim() == data.CourseType.ToLower().Trim()
                                              && x.DepartmentId == data.DepartmentId
                                              && x.IsActive == true);

                // If an existing program with the same Program Name and Course Type under the same Department is found
                if (existingProgram != null && existingProgram.ProgramId != data.ProgramId)
                {
                    return Ok(new { success = false, message = $"Program '{data.ProgramName}' with Course Type '{data.CourseType}' already exists under the selected Department." });
                }

                // If Program exists → Update
                if (data.ProgramId > 0)
                {
                    var programToUpdate = await _dbContext.ProgramBranch
                        .FirstOrDefaultAsync(x => x.ProgramId == data.ProgramId);

                    if (programToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Program with Id {data.ProgramId} not found." });
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

                    UpdateField("ProgramName", programToUpdate.ProgramName, data.ProgramName, val => programToUpdate.ProgramName = val);
                    UpdateField("CourseType", programToUpdate.CourseType, data.CourseType, val => programToUpdate.CourseType = val);
                    UpdateField("IsActive", programToUpdate.IsActive, data.IsActive, val => programToUpdate.IsActive = val);

                    programToUpdate.ModifiedOn = DateTime.Now;
                    programToUpdate.ModifiedBy = data.UserId;

                    _dbContext.ProgramBranch.Update(programToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Program Branch Id {data.ProgramId} updated fields: {string.Join(", ", updatedFields)}",
                            "ProgramBranch");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Program Branch updated successfully.", data = data });
                }
                else
                {
                    // If Program does not exist → Create new
                    var newProgramBranch = new ProgramBranch
                    {
                        DepartmentId = data.DepartmentId,
                        ProgramName = data.ProgramName,
                        CourseType = data.CourseType,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.ProgramBranch.AddAsync(newProgramBranch);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Program Branch created with Name {data.ProgramName} and Course Type {data.CourseType} under Department Id {data.DepartmentId}",
                        "ProgramBranch");

                    return Ok(new { success = true, message = "Program Branch created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllProgramBranch")]
        public async Task<IActionResult> GetAllProgramBranch()
        {
            try
            {
                var programBranches = await _dbContext.ProgramBranch
                    .Where(x => x.IsActive == true)
                    .OrderByDescending(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Program Branch data fetched successfully", data = programBranches });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetProgramBranchById")]
        public async Task<IActionResult> GetProgramBranchById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Program Branch Id." });
                }

                var programBranch = await _dbContext.ProgramBranch
                    .FirstOrDefaultAsync(x => x.ProgramId == id && x.IsActive == true);

                if (programBranch == null)
                {
                    return Ok(new { success = false, message = $"Program Branch with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Program Branch data fetched successfully", data = programBranch });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteProgramBranchById")]
        public async Task<IActionResult> DeleteProgramBranchById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Program Id is required" });
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

                var programBranch = await _dbContext.ProgramBranch.FirstOrDefaultAsync(x => x.ProgramId == id);
                if (programBranch == null)
                {
                    return Ok(new { success = false, message = "Program Branch not found" });
                }

                _dbContext.ProgramBranch.Remove(programBranch);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Program Branch with Id {id} deleted. Name: '{programBranch.ProgramName}', DepartmentId: '{programBranch.DepartmentId}'", "ProgramBranch");

                return Ok(new { success = true, message = "Program Branch deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }


        #endregion

        #region Academic Year Master Related API's
        [HttpPost("CreateOrUpdateAcademicYear")]
        public async Task<IActionResult> CreateOrUpdateAcademicYear(AcademicYearDto data)
        {
            try
            {
                // Validation: Check if an Academic Year with the same YearLabel exists and is active
                var existingAcademicYear = await _dbContext.AcademicYear
                    .FirstOrDefaultAsync(x => x.YearLabel != null
                                              && x.YearLabel.ToLower().Trim() == data.YearLabel.ToLower().Trim()
                                              && x.IsActive == true);

                // If an existing active academic year with the same YearLabel is found
                if (existingAcademicYear != null && existingAcademicYear.AcademicYearId != data.AcademicYearId)
                {
                    return Ok(new { success = false, message = $"Academic Year with label '{data.YearLabel}' already exists and is active." });
                }

                // If Academic Year exists → Update
                if (data.AcademicYearId > 0)
                {
                    var academicYearToUpdate = await _dbContext.AcademicYear
                        .FirstOrDefaultAsync(x => x.AcademicYearId == data.AcademicYearId);

                    if (academicYearToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Academic Year with Id {data.AcademicYearId} not found." });
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

                    UpdateField("YearLabel", academicYearToUpdate.YearLabel, data.YearLabel, val => academicYearToUpdate.YearLabel = val);
                    UpdateField("IsActive", academicYearToUpdate.IsActive, data.IsActive, val => academicYearToUpdate.IsActive = val);

                    academicYearToUpdate.ModifiedOn = DateTime.Now;
                    academicYearToUpdate.ModifiedBy = data.UserId;

                    _dbContext.AcademicYear.Update(academicYearToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Academic Year Id {data.AcademicYearId} updated fields: {string.Join(", ", updatedFields)}",
                            "AcademicYear");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Academic Year updated successfully.", data = data });
                }
                else
                {
                    // If Academic Year does not exist → Create new
                    var newAcademicYear = new AcademicYear
                    {
                        YearLabel = data.YearLabel,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.AcademicYear.AddAsync(newAcademicYear);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Academic Year created with YearLabel {data.YearLabel}",
                        "AcademicYear");

                    return Ok(new { success = true, message = "Academic Year created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllAcademicYear")]
        public async Task<IActionResult> GetAllAcademicYear()
        {
            try
            {
                var academicYears = await _dbContext.AcademicYear
                    .Where(x => x.IsActive == true)
                    .OrderByDescending(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Academic Year data fetched successfully", data = academicYears });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAcademicYearById")]
        public async Task<IActionResult> GetAcademicYearById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Academic Year Id." });
                }

                var academicYear = await _dbContext.AcademicYear
                    .FirstOrDefaultAsync(x => x.AcademicYearId == id && x.IsActive == true);

                if (academicYear == null)
                {
                    return Ok(new { success = false, message = $"Academic Year with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Academic Year data fetched successfully", data = academicYear });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteAcademicYearById")]
        public async Task<IActionResult> DeleteAcademicYearById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Academic Year Id is required" });
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

                var academicYear = await _dbContext.AcademicYear.FirstOrDefaultAsync(x => x.AcademicYearId == id);
                if (academicYear == null)
                {
                    return Ok(new { success = false, message = "Academic Year not found" });
                }

                _dbContext.AcademicYear.Remove(academicYear);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Academic Year with Id {id} deleted. YearLabel: '{academicYear.YearLabel}'", "AcademicYear");

                return Ok(new { success = true, message = "Academic Year deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }


        #endregion

        #region Entry Type Master Related API's
        [HttpPost("CreateOrUpdateEntryType")]
        public async Task<IActionResult> CreateOrUpdateEntryType(EntryTypeDto data)
        {
            try
            {
                // Validate for duplication while creating or updating
                var existingEntryType = await _dbContext.EntryType
                    .FirstOrDefaultAsync(x => x.Name != null
                                              && x.Name.ToLower().Trim() == data.Name.ToLower().Trim()
                                              && x.IsActive == true);

                // Check if an entry type with the same name exists and it's not the current record
                if (existingEntryType != null && existingEntryType.EntryTypeId != data.EntryTypeId)
                {
                    return Ok(new { success = false, message = $"Entry Type with name '{data.Name}' already exists and is active." });
                }

                // If EntryTypeId is provided (for update operation)
                if (data.EntryTypeId > 0)
                {
                    var entryTypeToUpdate = await _dbContext.EntryType
                        .FirstOrDefaultAsync(x => x.EntryTypeId == data.EntryTypeId);

                    if (entryTypeToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Entry Type with Id {data.EntryTypeId} not found." });
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

                    UpdateField("Name", entryTypeToUpdate.Name, data.Name, val => entryTypeToUpdate.Name = val);
                    UpdateField("IsActive", entryTypeToUpdate.IsActive, data.IsActive, val => entryTypeToUpdate.IsActive = val);

                    entryTypeToUpdate.ModifiedOn = DateTime.Now;
                    entryTypeToUpdate.ModifiedBy = data.UserId;

                    _dbContext.EntryType.Update(entryTypeToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Entry Type Id {data.EntryTypeId} updated fields: {string.Join(", ", updatedFields)}",
                            "EntryType");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Entry Type updated successfully.", data = data });
                }
                else
                {
                    // If Entry Type does not exist → Create new
                    var newEntryType = new EntryType
                    {
                        Name = data.Name,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.EntryType.AddAsync(newEntryType);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Entry Type created with Name {data.Name}",
                        "EntryType");

                    return Ok(new { success = true, message = "Entry Type created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllEntryType")]
        public async Task<IActionResult> GetAllEntryType()
        {
            try
            {
                var entryTypes = await _dbContext.EntryType
                    .Where(x => x.IsActive == true)
                    .OrderByDescending(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Entry Type data fetched successfully", data = entryTypes });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetEntryTypeById")]
        public async Task<IActionResult> GetEntryTypeById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Entry Type Id." });
                }

                var entryType = await _dbContext.EntryType
                    .FirstOrDefaultAsync(x => x.EntryTypeId == id && x.IsActive == true);

                if (entryType == null)
                {
                    return Ok(new { success = false, message = $"Entry Type with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Entry Type data fetched successfully", data = entryType });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteEntryTypeById")]
        public async Task<IActionResult> DeleteEntryTypeById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Entry Type Id is required" });
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

                var entryType = await _dbContext.EntryType.FirstOrDefaultAsync(x => x.EntryTypeId == id);
                if (entryType == null)
                {
                    return Ok(new { success = false, message = "Entry Type not found" });
                }

                _dbContext.EntryType.Remove(entryType);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Entry Type with Id {id} deleted. Name: '{entryType.Name}'", "EntryType");

                return Ok(new { success = true, message = "Entry Type deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }


        #endregion

        #region Admission Mode Master Related API's

        [HttpPost("CreateOrUpdateAdmissionMode")]
        public async Task<IActionResult> CreateOrUpdateAdmissionMode(AdmissionModeDto data)
        {
            try
            {
                // Validate for duplication while creating or updating
                var existingAdmissionMode = await _dbContext.AdmissionMode
                    .FirstOrDefaultAsync(x => x.AdmissionType != null
                                              && x.AdmissionType.ToLower().Trim() == data.AdmissionType.ToLower().Trim()
                                              && x.IsActive == true);

                // Check if an AdmissionMode with the same AdmissionType exists and it's not the current record
                if (existingAdmissionMode != null && existingAdmissionMode.AdmissionModeId != data.AdmissionModeId)
                {
                    return Ok(new { success = false, message = $"Admission Mode with name '{data.AdmissionType}' already exists and is active." });
                }

                // If AdmissionModeId is provided (for update operation)
                if (data.AdmissionModeId > 0)
                {
                    var admissionModeToUpdate = await _dbContext.AdmissionMode
                        .FirstOrDefaultAsync(x => x.AdmissionModeId == data.AdmissionModeId);

                    if (admissionModeToUpdate == null)
                    {
                        return Ok(new { success = false, message = $"Admission Mode with Id {data.AdmissionModeId} not found." });
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

                    UpdateField("AdmissionType", admissionModeToUpdate.AdmissionType, data.AdmissionType, val => admissionModeToUpdate.AdmissionType = val);
                    UpdateField("IsActive", admissionModeToUpdate.IsActive, data.IsActive, val => admissionModeToUpdate.IsActive = val);

                    admissionModeToUpdate.ModifiedOn = DateTime.Now;
                    admissionModeToUpdate.ModifiedBy = data.UserId;

                    _dbContext.AdmissionMode.Update(admissionModeToUpdate);

                    if (updatedFields.Any())
                    {
                        Log.DataLog($"{data.UserId}",
                            $"Admission Mode Id {data.AdmissionModeId} updated fields: {string.Join(", ", updatedFields)}",
                            "AdmissionMode");
                    }

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { success = true, message = "Admission Mode updated successfully.", data = data });
                }
                else
                {
                    // If Admission Mode does not exist → Create new
                    var newAdmissionMode = new AdmissionMode
                    {
                        AdmissionType = data.AdmissionType,
                        IsActive = true,
                        CreatedBy = data.UserId,
                        CreatedOn = DateTime.Now,
                    };

                    await _dbContext.AdmissionMode.AddAsync(newAdmissionMode);
                    await _dbContext.SaveChangesAsync();

                    Log.DataLog($"{data.UserId}",
                        $"Admission Mode created with AdmissionType {data.AdmissionType}",
                        "AdmissionMode");

                    return Ok(new { success = true, message = "Admission Mode created successfully.", data = data });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAllAdmissionMode")]
        public async Task<IActionResult> GetAllAdmissionMode()
        {
            try
            {
                var admissionModes = await _dbContext.AdmissionMode
                    .Where(x => x.IsActive == true)
                    .OrderByDescending(x => x.CreatedOn)
                    .ToListAsync();

                return Ok(new { success = true, message = "Admission Mode data fetched successfully", data = admissionModes });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetAdmissionModeById")]
        public async Task<IActionResult> GetAdmissionModeById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Invalid Admission Mode Id." });
                }

                var admissionMode = await _dbContext.AdmissionMode
                    .FirstOrDefaultAsync(x => x.AdmissionModeId == id && x.IsActive == true);

                if (admissionMode == null)
                {
                    return Ok(new { success = false, message = $"Admission Mode with Id {id} not found." });
                }

                return Ok(new { success = true, message = "Admission Mode data fetched successfully", data = admissionMode });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("DeleteAdmissionModeById")]
        public async Task<IActionResult> DeleteAdmissionModeById(int id, string? UserId)
        {
            try
            {
                if (id <= 0)
                {
                    return Ok(new { success = false, message = "Valid Admission Mode Id is required" });
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

                var admissionMode = await _dbContext.AdmissionMode.FirstOrDefaultAsync(x => x.AdmissionModeId == id);
                if (admissionMode == null)
                {
                    return Ok(new { success = false, message = "Admission Mode not found" });
                }

                _dbContext.AdmissionMode.Remove(admissionMode);
                await _dbContext.SaveChangesAsync();

                Log.DataLog(UserId, $"Admission Mode with Id {id} deleted. AdmissionType: '{admissionMode.AdmissionType}'", "AdmissionMode");

                return Ok(new { success = true, message = "Admission Mode deleted successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        #endregion

    }
}

