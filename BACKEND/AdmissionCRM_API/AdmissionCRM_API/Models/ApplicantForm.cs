using System.ComponentModel.DataAnnotations;

namespace AdmissionCRM_API.Models
{
    public class ApplicantForm
    {
        [Key]
        public int ApplicantId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DOB { get; set; }
        public string? Category { get; set; } // GM / SC / ST / OBC
        public int? EntryTypeId { get; set; }
        public int? AdmissionModeId { get; set; }
        public int? ProgramId { get; set; }
        public int? AcademicYearId { get; set; }
        public int? QuotaId { get; set; }
        public decimal? Marks { get; set; }
        public string? DocumentStatus { get; set; } // Submitted / Verified
        public string? FeeStatus { get; set; } // Pending / Paid
        public string? AdmissionNumber { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }
    public class ApplicantFormDto
    {
        [Key]
        public int ApplicantId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DOB { get; set; }
        public string? Category { get; set; }
        public int? EntryTypeId { get; set; }
        public int? AdmissionModeId { get; set; }
        public int? ProgramId { get; set; }
        public int? AcademicYearId { get; set; }
        public int? QuotaId { get; set; }
        public decimal? Marks { get; set; }
        public string? DocumentStatus { get; set; }
        public string? FeeStatus { get; set; }
        public string? AdmissionNumber { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
        public List<IFormFile>? Documents { get; set; } 
    }

    public class ApplicantDocumentStatusDto
    {
        public int ApplicantId { get; set; }
        public string? DocumentStatus { get; set; } = "Verified";
        public string? UserId { get; set; }
    }
       
    public class ApplicantFeeStatusDto
    {
        public int ApplicantId { get; set; }
        public string? FeeStatus { get; set; } = "Paid";
        public string? UserId { get; set; }
    }

}
