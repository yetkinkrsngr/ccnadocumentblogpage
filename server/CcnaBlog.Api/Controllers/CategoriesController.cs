using System.Text.RegularExpressions;
using CcnaBlog.Api.Data;
using CcnaBlog.Api.DTOs;
using CcnaBlog.Api.Models;
using CcnaBlog.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CcnaBlog.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoriesController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
        {
            var cats = await _db.Categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto(c.Id, c.Name, c.Slug))
                .ToListAsync();

            var latest = await _db.Posts.Select(p => p.UpdatedAt ?? p.CreatedAt)
                .OrderByDescending(d => d)
                .FirstOrDefaultAsync();
            if (latest == default) latest = DateTime.UtcNow;

            var lastStr = latest.ToUniversalTime().ToString("R");
            var etag = $"W/\"cats-{latest.Ticks}-{cats.Count}\"";

            var inm = Request.Headers["If-None-Match"].ToString();
            if (!string.IsNullOrEmpty(inm) && inm == etag)
            {
                Response.Headers["ETag"] = etag;
                Response.Headers["Last-Modified"] = lastStr;
                return StatusCode(304);
            }
            var ims = Request.Headers["If-Modified-Since"].ToString();
            if (DateTimeOffset.TryParse(ims, out var imsDate) && latest <= imsDate)
            {
                Response.Headers["ETag"] = etag;
                Response.Headers["Last-Modified"] = lastStr;
                return StatusCode(304);
            }

            Response.Headers["Cache-Control"] = "public, max-age=600";
            Response.Headers["Last-Modified"] = lastStr;
            Response.Headers["ETag"] = etag;
            return Ok(cats);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Kategori adı gerekli.");
            var slug = SeedData.Slugify(dto.Name);
            if (await _db.Categories.AnyAsync(c => c.Slug == slug)) return Conflict("Bu kategori zaten mevcut.");

            var cat = new Category { Name = dto.Name, Slug = slug };
            _db.Categories.Add(cat);
            await _db.SaveChangesAsync();
            return Ok(new CategoryDto(cat.Id, cat.Name, cat.Slug));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryDto dto)
        {
            var cat = await _db.Categories.FindAsync(id);
            if (cat == null) return NotFound();
            cat.Name = dto.Name;
            cat.Slug = SeedData.Slugify(dto.Name);
            await _db.SaveChangesAsync();
            return Ok(new CategoryDto(cat.Id, cat.Name, cat.Slug));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var cat = await _db.Categories.Include(c => c.Posts).FirstOrDefaultAsync(c => c.Id == id);
            if (cat == null) return NotFound();
            if (cat.Posts.Any()) return BadRequest("Bu kategoriye bağlı yazılar var. Önce yazıları silin veya taşıyın.");
            _db.Categories.Remove(cat);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}

