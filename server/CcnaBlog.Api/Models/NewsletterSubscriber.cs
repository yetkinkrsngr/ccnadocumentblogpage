using System.ComponentModel.DataAnnotations;

namespace CcnaBlog.Api.Models
{
    public class NewsletterSubscriber
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;

        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    }
}
