using AdmissionCRM_API.Models;
using AuthApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace AdmissionCRM_API.DBContext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Client> Clients { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRoleMap> UserRoleMaps { get; set; }
        public DbSet<App> Apps { get; set; }
        public DbSet<RoleAppMap> RoleAppMaps { get; set; }
        public DbSet<UserLoginHistory> UserLoginHistory { get; set; }
        public DbSet<AuthTokenHistory> AuthTokenHistories { get; set; }
        public DbSet<EmailConfiguration> EmailConfiguration { get; set; }
        public DbSet<otpConfiguration> otpConfiguration { get; set; }
        public DbSet<PasswordResetOtpHistory> PasswordResetOtpHistorys { get; set; }
        public DbSet<MailBodyConfiguration> MailBodyConfigurations { get; set; }
        public DbSet<NewsAndNotification> NewsAndNotifications { get; set; }
        public DbSet<DocumentMaster> DocumentMaster { get; set; }
        public DbSet<DocumentExtensions> DocumentExtensions { get; set; }
        // Masters
        public DbSet<Institution> Institution { get; set; }
        public DbSet<Campus> Campus { get; set; }
        public DbSet<Department> Department { get; set; }
        public DbSet<ProgramBranch> ProgramBranch { get; set; }
        public DbSet<AcademicYear> AcademicYear { get; set; }
        public DbSet<EntryType> EntryType { get; set; }
        public DbSet<AdmissionMode> AdmissionMode { get; set; }

        // 2️⃣ Seat Matrix & Quota Tables
        public DbSet<SeatMatrix> SeatMatrix { get; set; }
        public DbSet<Quota> Quota { get; set; }

        // 3️⃣ Applicant & Admission Tables
        public DbSet<ApplicantForm> ApplicantForm { get; set; }
        public DbSet<AdmissionAllocation> AdmissionAllocation { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RoleAppMap>(
           build =>
           {
               build.HasKey(t => new { t.RoleID, t.AppID });
           });
            modelBuilder.Entity<UserRoleMap>(
            build =>
            {
                build.HasKey(t => new { t.UserID, t.RoleID });
            });

        }
    }
}
