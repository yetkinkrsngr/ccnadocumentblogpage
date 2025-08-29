using System.ComponentModel.DataAnnotations;

namespace CcnaBlog.Api.Models
{
    public class Post
    {
        public int Id { get; set; }
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [MaxLength(200)]
        public string Slug { get; set; } = string.Empty;
        [MaxLength(500)]
        public string Summary { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty; // Markdown içerik
        [MaxLength(100)]
        public string Author { get; set; } = "Admin";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public List<Comment> Comments { get; set; } = new();
    }
}

