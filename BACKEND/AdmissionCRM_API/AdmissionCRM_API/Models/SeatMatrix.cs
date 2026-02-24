using Microsoft.AspNetCore.Components.Web;
using System.ComponentModel.DataAnnotations;

namespace AdmissionCRM_API.Models
{
    public class SeatMatrix
    {
        [Key]
        public int SeatMatrixId { get; set; }
        public int? ProgramId { get; set; }
        public int? AcademicYearId { get; set; }
        public int? EntryTypeId { get; set; }
        public int? AdmissionModeId { get; set; }
        public int? TotalSeats { get; set; }
        public int? RemainingSeats { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class SeatMatrixDto
    {
        [Key]
        public int SeatMatrixId { get; set; }
        public int? ProgramId { get; set; }
        public int? AcademicYearId { get; set; }
        public int? EntryTypeId { get; set; }
        public int? AdmissionModeId { get; set; }
        public int? TotalSeats { get; set; }
        public int? RemainingSeats { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }

}
