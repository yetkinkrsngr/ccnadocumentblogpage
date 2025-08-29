using System.ComponentModel.DataAnnotations;

namespace CcnaBlog.Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(150)]
        public string Slug { get; set; } = string.Empty;

        public List<Post> Posts { get; set; } = new();
    }
}

