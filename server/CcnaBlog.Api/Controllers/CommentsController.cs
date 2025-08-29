using CcnaBlog.Api.Data;
using CcnaBlog.Api.DTOs;
using CcnaBlog.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;

namespace CcnaBlog.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ProfanityFilter _filter;
        public CommentsController(AppDbContext db, ProfanityFilter filter)
        {
            _db = db;
            _filter = filter;
        }

        [EnableRateLimiting("comments")]
        [HttpPost("post/{postId}")]
        public async Task<IActionResult> Create(int postId, [FromBody] CreateCommentDto dto, [FromQuery] string? website = null)
        {
            // Honeypot: bot doldurursa reddet
            if (!string.IsNullOrEmpty(website)) return BadRequest("Geçersiz istek.");

            var post = await _db.Posts.FindAsync(postId);
            if (post == null) return NotFound("Yazı bulunamadı.");

            // HTML sanitizasyon (basit): HTML encode + küfür maskesi
            var safe = System.Net.WebUtility.HtmlEncode(dto.Content ?? string.Empty);
            var masked = _filter.Mask(safe);

            var comment = new CcnaBlog.Api.Models.Comment
            {
                PostId = postId,
                AuthorName = string.IsNullOrWhiteSpace(dto.AuthorName) ? "Ziyaretçi" : dto.AuthorName.Trim(),
                Content = masked,
                Approved = false,
                CreatedAt = DateTime.UtcNow
            };
            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Yorumunuz alındı ve onay bekliyor." });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> List([FromQuery] bool onlyPending = false)
        {
            var query = _db.Comments.Include(c => c.Post).AsQueryable();
            if (onlyPending) query = query.Where(c => !c.Approved);
            var list = await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentModerationDto(c.Id, c.PostId, c.Post!.Title, c.AuthorName, c.Content, c.CreatedAt, c.Approved))
                .ToListAsync();
            return Ok(list);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var c = await _db.Comments.FindAsync(id);
            if (c == null) return NotFound();
            c.Approved = true;
            await _db.SaveChangesAsync();
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _db.Comments.FindAsync(id);
            if (c == null) return NotFound();
            _db.Comments.Remove(c);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}

