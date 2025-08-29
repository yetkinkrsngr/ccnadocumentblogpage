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
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public PostsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? categorySlug, [FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 9)
        {
            var query = _db.Posts.Include(p => p.Category).AsQueryable();
            if (!string.IsNullOrWhiteSpace(categorySlug))
                query = query.Where(p => p.Category!.Slug == categorySlug);
            if (!string.IsNullOrWhiteSpace(q))
            {
                q = q.Trim();
                query = query.Where(p => p.Title.Contains(q) || p.Summary.Contains(q));
            }

            var total = await query.CountAsync();
            var latest = await query.Select(p => p.UpdatedAt ?? p.CreatedAt)
                                    .OrderByDescending(d => d)
                                    .FirstOrDefaultAsync();
            if (latest == default) latest = DateTime.UtcNow;

            var lastStr = latest.ToUniversalTime().ToString("R");
            var etag = $"W/\"posts-{latest.Ticks}-{total}-{page}-{pageSize}-{categorySlug}-{q}\"";

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

            // Cache headers
            Response.Headers["Cache-Control"] = "public, max-age=60";
            Response.Headers["Last-Modified"] = lastStr;
            Response.Headers["ETag"] = etag;

            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListItemDto(p.Id, p.Title, p.Summary, p.Slug, p.Category!.Name, p.Category.Slug, p.CreatedAt))
                .ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var post = await _db.Posts.Include(p => p.Category)
                                       .Include(p => p.Comments)
                                       .FirstOrDefaultAsync(p => p.Slug == slug);
            if (post == null) return NotFound();

            // Cache headers for single post
            var last = (post.UpdatedAt ?? post.CreatedAt).ToUniversalTime();
            var etag = $"W/\"post-{post.Id}-{last.Ticks}\"";

            var inm = Request.Headers["If-None-Match"].ToString();
            if (!string.IsNullOrEmpty(inm) && inm == etag)
            {
                Response.Headers["ETag"] = etag;
                Response.Headers["Last-Modified"] = last.ToString("R");
                return StatusCode(304);
            }
            var ims = Request.Headers["If-Modified-Since"].ToString();
            if (DateTimeOffset.TryParse(ims, out var imsDate) && last <= imsDate)
            {
                Response.Headers["ETag"] = etag;
                Response.Headers["Last-Modified"] = last.ToString("R");
                return StatusCode(304);
            }

            Response.Headers["Cache-Control"] = "public, max-age=300";
            Response.Headers["Last-Modified"] = last.ToString("R");
            Response.Headers["ETag"] = etag;

            var dto = new PostDetailDto(
                post.Id,
                post.Title,
                post.Content,
                post.Slug,
                post.Author,
                post.CreatedAt,
                post.Category!.Name,
                post.Category!.Slug,
                post.Comments.Where(c => c.Approved)
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new CommentViewDto(c.Id, c.AuthorName, c.Content, c.CreatedAt)).ToList()
            );
            return Ok(dto);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] string? categorySlug, [FromQuery] string sort = "rank", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrWhiteSpace(q)) return BadRequest("Sorgu boş olamaz.");
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            // Toplam kayıt
            int total;
            if (string.IsNullOrWhiteSpace(categorySlug))
            {
                total = await _db.CountResults
                    .FromSqlInterpolated($"SELECT COUNT(*) AS Value FROM CONTAINSTABLE(Posts, (Title, Summary, [Content]), {q}) ft")
                    .AsNoTracking()
                    .Select(x => x.Value)
                    .FirstOrDefaultAsync();
            }
            else
            {
                total = await _db.CountResults
                    .FromSqlInterpolated($@"SELECT COUNT(*) AS Value
                                              FROM CONTAINSTABLE(Posts, (Title, Summary, [Content]), {q}) ft
                                              JOIN Posts p ON p.Id = ft.[KEY]
                                              JOIN Categories c ON c.Id = p.CategoryId
                                              WHERE c.Slug = {categorySlug}")
                    .AsNoTracking()
                    .Select(x => x.Value)
                    .FirstOrDefaultAsync();
            }

            // Sayfa verisi (rank + alanlar)
            var offset = (page - 1) * pageSize;
            var orderBy = sort == "date" ? "p.CreatedAt DESC" : "ft.[RANK] DESC";

            List<PostSearchRow> rows;
            if (string.IsNullOrWhiteSpace(categorySlug))
            {
                rows = await _db.PostSearchRows
                    .FromSqlInterpolated($@"SELECT p.Id, p.Title, p.Summary, p.Slug, p.CreatedAt, c.Name AS CategoryName, c.Slug AS CategorySlug, ft.[RANK] AS Rank
                                             FROM CONTAINSTABLE(Posts, (Title, Summary, [Content]), {q}) ft
                                             JOIN Posts p ON p.Id = ft.[KEY]
                                             JOIN Categories c ON c.Id = p.CategoryId
                                             ORDER BY RAWSQL({orderBy})
                                             OFFSET {offset} ROWS FETCH NEXT {pageSize} ROWS ONLY")
                    .AsNoTracking()
                    .ToListAsync();
            }
            else
            {
                rows = await _db.PostSearchRows
                    .FromSqlInterpolated($@"SELECT p.Id, p.Title, p.Summary, p.Slug, p.CreatedAt, c.Name AS CategoryName, c.Slug AS CategorySlug, ft.[RANK] AS Rank
                                             FROM CONTAINSTABLE(Posts, (Title, Summary, [Content]), {q}) ft
                                             JOIN Posts p ON p.Id = ft.[KEY]
                                             JOIN Categories c ON c.Id = p.CategoryId
                                             WHERE c.Slug = {categorySlug}
                                             ORDER BY RAWSQL({orderBy})
                                             OFFSET {offset} ROWS FETCH NEXT {pageSize} ROWS ONLY")
                    .AsNoTracking()
                    .ToListAsync();
            }

            var items = rows.Select(r => new PostSearchResultDto(r.Id, r.Title, r.Summary, r.Slug, r.CategoryName, r.CategorySlug, r.CreatedAt, r.Rank)).ToList();

            Response.Headers["Cache-Control"] = "no-store";
            return Ok(new { total, page, pageSize, items });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUpdatePostDto dto)
        {
            var category = await _db.Categories.FindAsync(dto.CategoryId);
            if (category == null) return BadRequest("Geçersiz kategori.");
            var slug = SeedData.Slugify(dto.Title);
            if (await _db.Posts.AnyAsync(p => p.Slug == slug)) slug += "-" + Guid.NewGuid().ToString("N")[..6];

            var post = new Post
            {
                Title = dto.Title,
                Slug = slug,
                Summary = dto.Summary,
                Content = dto.Content,
                Author = dto.Author,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.UtcNow
            };
            _db.Posts.Add(post);
            await _db.SaveChangesAsync();
            return Ok(new { id = post.Id, slug = post.Slug });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdatePostDto dto)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound();
            if (post.Title != dto.Title)
            {
                var slug = SeedData.Slugify(dto.Title);
                if (await _db.Posts.AnyAsync(p => p.Slug == slug && p.Id != id)) slug += "-" + Guid.NewGuid().ToString("N")[..6];
                post.Slug = slug;
            }
            post.Title = dto.Title;
            post.Summary = dto.Summary;
            post.Content = dto.Content;
            post.Author = dto.Author;
            post.CategoryId = dto.CategoryId;
            post.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(new { id = post.Id, slug = post.Slug });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound();
            _db.Posts.Remove(post);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Admin edit için ID ile detay (kategoriId dahil)
        [Authorize(Roles = "Admin")]
        [HttpGet("by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var post = await _db.Posts.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return NotFound();
            var dto = new CcnaBlog.Api.DTOs.PostEditDto(
                post.Id,
                post.Title,
                post.Summary,
                post.Content,
                post.CategoryId,
                post.Author,
                post.Slug
            );
            return Ok(dto);
        }
    }
}

