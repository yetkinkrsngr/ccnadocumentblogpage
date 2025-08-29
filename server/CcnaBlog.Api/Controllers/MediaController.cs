using System.Security.Cryptography;
using System.Text;
using CcnaBlog.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CcnaBlog.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        public MediaController(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
        }

        private string GetUploadsRoot()
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
            var up = Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(up);
            return up;
        }

        private static string Slugify(string input)
        {
            string text = input.ToLowerInvariant();
            text = text.Replace("ı", "i").Replace("ğ", "g").Replace("ü", "u").Replace("ş", "s").Replace("ö", "o").Replace("ç", "c");
            text = System.Text.RegularExpressions.Regex.Replace(text, @"[^a-z0-9]+", "-").Trim('-');
            return string.IsNullOrWhiteSpace(text) ? "file" : text;
        }

        private string Sign(string path, DateTimeOffset exp)
        {
            var key = _config["Media:SigningKey"] ?? "dev_media_signing_key_change";
            var data = Encoding.UTF8.GetBytes(path + "|" + exp.ToUnixTimeSeconds());
            using var h = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            var sig = Convert.ToBase64String(h.ComputeHash(data)).Replace('+','-').Replace('/','_').TrimEnd('=');
            return sig;
        }

        private bool Verify(string path, long expUnix, string sig)
        {
            var exp = DateTimeOffset.FromUnixTimeSeconds(expUnix);
            if (exp < DateTimeOffset.UtcNow) return false;
            var expected = Sign(path, exp);
            return string.Equals(expected, sig, StringComparison.Ordinal);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("upload")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<UploadResponseDto>> Upload([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Dosya alınamadı.");
            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "image/jpeg","image/png","image/gif","image/webp","image/svg+xml"
            };
            if (!allowed.Contains(file.ContentType)) return BadRequest("Bu dosya türü desteklenmiyor.");

            var uploads = GetUploadsRoot();
            var now = DateTime.UtcNow;
            var sub = Path.Combine(uploads, now.ToString("yyyy"), now.ToString("MM"));
            Directory.CreateDirectory(sub);
            var safeName = Slugify(Path.GetFileNameWithoutExtension(file.FileName)) + "-" + Guid.NewGuid().ToString("N").Substring(0,8) + Path.GetExtension(file.FileName).ToLowerInvariant();
            var fullPath = Path.Combine(sub, safeName);
            await using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var relPath = fullPath.Replace(_env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot"), "").Replace('\\','/');
            if (!relPath.StartsWith("/")) relPath = "/" + relPath;

            var baseUrl = _config["Site:BaseUrl"] ?? $"http://localhost:{Request.Host.Port ?? 5153}";
            var url = baseUrl.TrimEnd('/') + relPath;

            var exp = DateTimeOffset.UtcNow.AddHours(24);
            var sig = Sign(relPath, exp);
            var signedUrl = baseUrl.TrimEnd('/') + $"/api/media/get?path={Uri.EscapeDataString(relPath)}&exp={exp.ToUnixTimeSeconds()}&sig={sig}";

            return Ok(new UploadResponseDto(url, signedUrl, relPath));
        }

        [AllowAnonymous]
        [HttpGet("get")]
        public IActionResult Get([FromQuery] string path, [FromQuery] long exp, [FromQuery] string sig)
        {
            if (!Verify(path, exp, sig)) return Unauthorized();
            var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
            var full = Path.GetFullPath(Path.Combine(webRoot, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)));
            if (!full.StartsWith(Path.GetFullPath(webRoot))) return Unauthorized();
            if (!System.IO.File.Exists(full)) return NotFound();
            var contentType = "application/octet-stream";
            return PhysicalFile(full, contentType, enableRangeProcessing: true);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("list")]
        public IActionResult List([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var uploads = GetUploadsRoot();
            var files = Directory.EnumerateFiles(uploads, "*", SearchOption.AllDirectories)
                .Select(f => new FileInfo(f))
                .OrderByDescending(f => f.CreationTimeUtc)
                .Skip((page-1)*pageSize)
                .Take(pageSize)
                .ToList();
            var baseUrl = _config["Site:BaseUrl"] ?? $"http://localhost:{Request.Host.Port ?? 5153}";
            var items = files.Select(fi => {
                var rel = fi.FullName.Replace(_env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot"), "").Replace('\\','/');
                if (!rel.StartsWith("/")) rel = "/" + rel;
                return new MediaItemDto(rel, baseUrl.TrimEnd('/') + rel, fi.Length, fi.CreationTimeUtc, "");
            }).ToList();
            return Ok(new { page, pageSize, items });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete]
        public IActionResult Delete([FromQuery] string path)
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
            var full = Path.GetFullPath(Path.Combine(webRoot, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)));
            if (!full.StartsWith(Path.GetFullPath(webRoot))) return Unauthorized();
            if (System.IO.File.Exists(full)) System.IO.File.Delete(full);
            return NoContent();
        }
    }
}
