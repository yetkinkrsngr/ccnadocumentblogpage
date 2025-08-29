using System.ComponentModel.DataAnnotations;

namespace CcnaBlog.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(200)]
        public string DisplayName { get; set; } = string.Empty;

        // null olabilir: sadece harici sağlayıcıyla kayıtlı kullanıcılar için
        public string? PasswordHash { get; set; }

        // OAuth sağlayıcı bilgileri (opsiyonel)
        [MaxLength(50)]
        public string? Provider { get; set; }
        [MaxLength(200)]
        public string? ProviderId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
}
