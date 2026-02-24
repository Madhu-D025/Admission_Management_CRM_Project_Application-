using AdmissionCRM_API.DBContext;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionCRM_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicantFormController : Controller
    {
        private readonly AppDbContext _dbContext;
        public ApplicantFormController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
