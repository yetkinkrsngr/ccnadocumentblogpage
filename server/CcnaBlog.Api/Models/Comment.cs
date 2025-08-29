using System.ComponentModel.DataAnnotations;

namespace CcnaBlog.Api.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public Post? Post { get; set; }
        [MaxLength(100)]
        public string AuthorName { get; set; } = "Ziyaretçi";
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool Approved { get; set; } = false;
    }
}

