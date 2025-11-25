using CcnaBlog.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CcnaBlog.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AnalyticsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var totalPosts = await _db.Posts.CountAsync();
            var totalCategories = await _db.Categories.CountAsync();
            var totalComments = await _db.Comments.CountAsync();
            var approvedComments = await _db.Comments.CountAsync(c => c.Approved);
            var pendingComments = await _db.Comments.CountAsync(c => !c.Approved);
            var totalSubscribers = await _db.NewsletterSubscribers.CountAsync();

            // Recent activity (last 30 days)
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var recentPosts = await _db.Posts.CountAsync(p => p.CreatedAt >= thirtyDaysAgo);
            var recentComments = await _db.Comments.CountAsync(c => c.CreatedAt >= thirtyDaysAgo);
            var recentSubscribers = await _db.NewsletterSubscribers.CountAsync(s => s.SubscribedAt >= thirtyDaysAgo);

            Response.Headers["Cache-Control"] = "private, max-age=60";

            return Ok(new
            {
                totals = new
                {
                    posts = totalPosts,
                    categories = totalCategories,
                    comments = totalComments,
                    approvedComments,
                    pendingComments,
                    subscribers = totalSubscribers
                },
                recent = new
                {
                    posts = recentPosts,
                    comments = recentComments,
                    subscribers = recentSubscribers
                }
            });
        }

        [HttpGet("posts/popular")]
        public async Task<IActionResult> GetPopularPosts([FromQuery] int limit = 10)
        {
            limit = Math.Clamp(limit, 1, 50);

            // Most commented posts
            var popularPosts = await _db.Posts
                .Include(p => p.Category)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.Comments.Count(c => c.Approved))
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Slug,
                    CategoryName = p.Category!.Name,
                    CommentCount = p.Comments.Count(c => c.Approved),
                    p.CreatedAt
                })
                .ToListAsync();

            Response.Headers["Cache-Control"] = "private, max-age=300";

            return Ok(popularPosts);
        }

        [HttpGet("posts/recent")]
        public async Task<IActionResult> GetRecentPosts([FromQuery] int limit = 10)
        {
            limit = Math.Clamp(limit, 1, 50);

            var recentPosts = await _db.Posts
                .Include(p => p.Category)
                .OrderByDescending(p => p.CreatedAt)
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Slug,
                    CategoryName = p.Category!.Name,
                    p.CreatedAt
                })
                .ToListAsync();

            Response.Headers["Cache-Control"] = "private, max-age=60";

            return Ok(recentPosts);
        }

        [HttpGet("comments/recent")]
        public async Task<IActionResult> GetRecentComments([FromQuery] int limit = 10)
        {
            limit = Math.Clamp(limit, 1, 50);

            var recentComments = await _db.Comments
                .Include(c => c.Post)
                .OrderByDescending(c => c.CreatedAt)
                .Take(limit)
                .Select(c => new
                {
                    c.Id,
                    c.AuthorName,
                    c.Content,
                    c.Approved,
                    c.CreatedAt,
                    PostTitle = c.Post!.Title,
                    PostSlug = c.Post.Slug
                })
                .ToListAsync();

            Response.Headers["Cache-Control"] = "private, max-age=30";

            return Ok(recentComments);
        }

        [HttpGet("categories/stats")]
        public async Task<IActionResult> GetCategoryStats()
        {
            var categoryStats = await _db.Categories
                .Include(c => c.Posts)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Slug,
                    PostCount = c.Posts.Count
                })
                .OrderByDescending(c => c.PostCount)
                .ToListAsync();

            Response.Headers["Cache-Control"] = "private, max-age=300";

            return Ok(categoryStats);
        }

        [HttpGet("growth")]
        public async Task<IActionResult> GetGrowthStats([FromQuery] int days = 30)
        {
            days = Math.Clamp(days, 7, 365);

            var startDate = DateTime.UtcNow.AddDays(-days);

            // Daily post counts
            var postGrowth = await _db.Posts
                .Where(p => p.CreatedAt >= startDate)
                .GroupBy(p => p.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key,
                    count = g.Count()
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            // Daily comment counts
            var commentGrowth = await _db.Comments
                .Where(c => c.CreatedAt >= startDate)
                .GroupBy(c => c.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key,
                    count = g.Count()
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            // Daily subscriber counts
            var subscriberGrowth = await _db.NewsletterSubscribers
                .Where(s => s.SubscribedAt >= startDate)
                .GroupBy(s => s.SubscribedAt.Date)
                .Select(g => new
                {
                    date = g.Key,
                    count = g.Count()
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            Response.Headers["Cache-Control"] = "private, max-age=600";

            return Ok(new
            {
                posts = postGrowth,
                comments = commentGrowth,
                subscribers = subscriberGrowth
            });
        }
    }
}
