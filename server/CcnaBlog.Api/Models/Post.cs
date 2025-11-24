using System.ComponentModel.DataAnnotations;

namespace CcnaBlog.Api.Models
{
    public class Post
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Slug { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string Summary { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty; // Markdown içerik

        public string? FeaturedImageUrl { get; set; }

        public string? Author { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public List<Comment> Comments { get; set; } = new();
    }
}
