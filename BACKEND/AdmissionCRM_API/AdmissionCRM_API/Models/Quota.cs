using System.ComponentModel.DataAnnotations;

namespace AdmissionCRM_API.Models
{
    public class Quota
    {
        [Key]
        public int QuotaId { get; set; }
        public int? SeatMatrixId { get; set; }
        public string? Name { get; set; } // KCET / COMEDK / Management / Supernumerary
        public int? TotalQuota { get; set; }
        public int? RemainingQuota { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class QuotaDto
    {
        [Key]
        public int QuotaId { get; set; }
        public int? SeatMatrixId { get; set; }
        public string? Name { get; set; }
        public int? TotalQuota { get; set; }
        public int? RemainingQuota { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
}
