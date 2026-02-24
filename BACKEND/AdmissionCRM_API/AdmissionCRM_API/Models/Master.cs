using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;

namespace AdmissionCRM_API.Models
{
    public class Master
    {
    }



    public class DocumentExtensions
    {
        [Key]
        public int Id { get; set; }
        public string? Extensions { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }


    public class DocumentExtensionsDto
    {
        [Key]
        public int Id { get; set; }
        public string? Extensions { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }

    #region Institution Master

    public class Institution
    {
        [Key]
        public int InstitutionId { get; set; }
        public string? InstitutionName { get; set; }
        public string? InstitutionCode { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class InstitutionDto
    {
        [Key]
        public int InstitutionId { get; set; }
        public string? InstitutionName { get; set; }
        public string? InstitutionCode { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
    #endregion

    #region Campus Master

    public class Campus
    {
        [Key]
        public int CampusId { get; set; }
        public int? InstitutionId { get; set; }
        public string? CampusName { get; set; }
        public string? City { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class CampusDto
    {
        [Key]
        public int CampusId { get; set; }
        public int? InstitutionId { get; set; }
        public string? CampusName { get; set; }
        public string? City { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
    #endregion

    #region Department Master
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }
        public int? CampusId { get; set; }
        public string? DepartmentName { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class DepartmentDto
    {
        [Key]
        public int DepartmentId { get; set; }
        public int? CampusId { get; set; }
        public string? DepartmentName { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
    #endregion

    #region Program Master
    public class ProgramBranch
    {
        [Key]
        public int ProgramId { get; set; }
        public int? DepartmentId { get; set; }
        public string? ProgramName { get; set; }
        public string? CourseType { get; set; } // UG / PG
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class ProgramBranchDto
    {
        [Key]
        public int ProgramId { get; set; }
        public int? DepartmentId { get; set; }
        public string? ProgramName { get; set; }
        public string? CourseType { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }

    #endregion

    #region AcademicYear Master
    public class AcademicYear
    {
        [Key]
        public int AcademicYearId { get; set; }
        public string? YearLabel { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class AcademicYearDto
    {
        [Key]
        public int AcademicYearId { get; set; }
        public string? YearLabel { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
    #endregion

    #region EntryType Master

    public class EntryType
    {
        [Key]
        public int EntryTypeId { get; set; }
        public string? Name { get; set; } // Regular / Lateral
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class EntryTypeDto
    {
        [Key]
        public int EntryTypeId { get; set; }
        public string? Name { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
    #endregion

    #region AdmissionMode Master
    public class AdmissionMode
    {
        [Key]
        public int AdmissionModeId { get; set; }
        public string? AdmissionType { get; set; } // Government / Management
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class AdmissionModeDto
    {
        [Key]
        public int AdmissionModeId { get; set; }
        public string? AdmissionType { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
    #endregion



}
