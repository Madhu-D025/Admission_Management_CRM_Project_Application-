using System.ComponentModel.DataAnnotations;

namespace AdmissionCRM_API.Models
{
    public class AdmissionAllocation
    {
        [Key]
        public int AllocationId { get; set; }
        public int? ApplicantId { get; set; }
        public int? SeatMatrixId { get; set; }
        public int? QuotaId { get; set; }
        public DateTime? AllocatedAt { get; set; }
        public bool? Confirmed { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }
    public class AdmissionAllocationDto
    {
        [Key]
        public int AllocationId { get; set; }
        public int? ApplicantId { get; set; }
        public int? SeatMatrixId { get; set; }
        public int? QuotaId { get; set; }
        public DateTime? AllocatedAt { get; set; }
        public bool? Confirmed { get; set; }
        public bool? IsActive { get; set; }
        public string? UserId { get; set; }
    }
}
