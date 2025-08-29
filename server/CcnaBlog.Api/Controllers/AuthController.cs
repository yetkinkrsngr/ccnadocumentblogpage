using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CcnaBlog.Api.Data;
using CcnaBlog.Api.DTOs;
using CcnaBlog.Api.Models;
using CcnaBlog.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;

namespace CcnaBlog.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        public AuthController(AppDbContext db, TokenService tokenService, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _db = db;
            _tokenService = tokenService;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }


        // Üyelik: e-posta ile kayıt
        [EnableRateLimiting("login")]
        [HttpPost("register")]
        public async Task<ActionResult<LoginResponseUserDto>> Register([FromBody] RegisterRequestDto req)
        {
            var email = req.Email.Trim().ToLowerInvariant();
            if (await _db.Users.AnyAsync(u => u.Email == email))
                return Conflict(new { message = "Bu e-posta ile zaten bir hesap mevcut." });
            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
                return BadRequest(new { message = "Şifre en az 6 karakter olmalı." });

            var user = new User
            {
                Email = email,
                DisplayName = string.IsNullOrWhiteSpace(req.DisplayName) ? email : req.DisplayName.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = false
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = _tokenService.GenerateUser(user);
            return Ok(new LoginResponseUserDto(token, user.Email, user.DisplayName, user.MustChangePassword));
        }

        // Üyelik: e-posta ile giriş
        [EnableRateLimiting("login")]
        [HttpPost("login-email")]
        public async Task<ActionResult<LoginResponseUserDto>> LoginEmail([FromBody] LoginEmailRequestDto req)
        {
            var email = req.Email.Trim().ToLowerInvariant();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "E-posta veya şifre hatalı." });
            }
            user.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            var token = _tokenService.GenerateUser(user);
            return Ok(new LoginResponseUserDto(token, user.Email, user.DisplayName, user.MustChangePassword));
        }

        // OAuth: Google ile giriş
        [HttpGet("oauth/google/login")]
        public IActionResult GoogleLogin([FromQuery] string redirectUri)
        {
            var clientId = _config["OAuth:Google:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
            var callback = (_config["OAuth:Google:Callback"] ?? "http://localhost:5153/api/auth/oauth/google/callback");
            if (string.IsNullOrWhiteSpace(clientId)) return BadRequest("Google ClientId yapılandırılmamış.");
            var scopes = Uri.EscapeDataString("openid profile email");
            var url = $"https://accounts.google.com/o/oauth2/v2/auth?client_id={Uri.EscapeDataString(clientId)}&redirect_uri={Uri.EscapeDataString(callback)}&response_type=code&scope={scopes}&access_type=online&prompt=consent&include_granted_scopes=true&state={Uri.EscapeDataString(redirectUri ?? "")}";
            return Redirect(url);
        }

        [HttpGet("oauth/google/callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string? state)
        {
            var clientId = _config["OAuth:Google:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
            var clientSecret = _config["OAuth:Google:ClientSecret"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");
            var callback = (_config["OAuth:Google:Callback"] ?? "http://localhost:5153/api/auth/oauth/google/callback");
            if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret)) return BadRequest("Google OAuth yapılandırması eksik.");

            var http = _httpClientFactory.CreateClient();
            var data = new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["redirect_uri"] = callback,
                ["grant_type"] = "authorization_code"
            };
            var res = await http.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(data));
            var payload = await res.Content.ReadAsStringAsync();
            if (!res.IsSuccessStatusCode) return BadRequest(new { message = "Google token alınamadı", error = payload });
            using var doc = JsonDocument.Parse(payload);
            var idToken = doc.RootElement.GetProperty("id_token").GetString();

            // id_token decode (temel) -> email & name
            var parts = idToken!.Split('.');
            var json = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));
            using var idDoc = JsonDocument.Parse(json);
            var email = idDoc.RootElement.TryGetProperty("email", out var e) ? e.GetString()! : string.Empty;
            var name = idDoc.RootElement.TryGetProperty("name", out var n) ? (n.GetString() ?? email) : email;
            var sub = idDoc.RootElement.TryGetProperty("sub", out var s) ? s.GetString()! : string.Empty;

            if (string.IsNullOrWhiteSpace(email)) return BadRequest("Google e-posta bilgisi alınamadı.");

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Provider == "Google" && u.ProviderId == sub);
            if (user == null)
            {
                user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email) ?? new User { Email = email };
                user.DisplayName = string.IsNullOrWhiteSpace(user.DisplayName) ? name : user.DisplayName;
                user.Provider = "Google";
                user.ProviderId = sub;
                user.LastLoginAt = DateTime.UtcNow;
                if (user.Id == 0) _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }
            var token = _tokenService.GenerateUser(user);
            var redirectUri = state ?? (Request.Scheme + "://" + Request.Host + "/");
            var sep = redirectUri.Contains('?') ? '&' : '?';
            return Redirect($"{redirectUri}{sep}token={Uri.EscapeDataString(token)}");
        }

        // OAuth: GitHub ile giriş
        [HttpGet("oauth/github/login")]
        public IActionResult GitHubLogin([FromQuery] string redirectUri)
        {
            var clientId = _config["OAuth:GitHub:ClientId"] ?? Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");
            var callback = (_config["OAuth:GitHub:Callback"] ?? "http://localhost:5153/api/auth/oauth/github/callback");
            if (string.IsNullOrWhiteSpace(clientId)) return BadRequest("GitHub ClientId yapılandırılmamış.");
            var url = $"https://github.com/login/oauth/authorize?client_id={Uri.EscapeDataString(clientId)}&redirect_uri={Uri.EscapeDataString(callback)}&scope=read:user user:email&state={Uri.EscapeDataString(redirectUri ?? "")}";
            return Redirect(url);
        }

        [HttpGet("oauth/github/callback")]
        public async Task<IActionResult> GitHubCallback([FromQuery] string code, [FromQuery] string? state)
        {
            var clientId = _config["OAuth:GitHub:ClientId"] ?? Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");
            var clientSecret = _config["OAuth:GitHub:ClientSecret"] ?? Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET");
            var callback = (_config["OAuth:GitHub:Callback"] ?? "http://localhost:5153/api/auth/oauth/github/callback");
            if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret)) return BadRequest("GitHub OAuth yapılandırması eksik.");

            var http = _httpClientFactory.CreateClient();
            var data = new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["code"] = code,
                ["redirect_uri"] = callback
            };
            var req = new HttpRequestMessage(HttpMethod.Post, "https://github.com/login/oauth/access_token")
            {
                Content = new FormUrlEncodedContent(data)
            };
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            var res = await http.SendAsync(req);
            var tokenPayload = await res.Content.ReadAsStringAsync();
            if (!res.IsSuccessStatusCode) return BadRequest(new { message = "GitHub token alınamadı", error = tokenPayload });
            using var doc = JsonDocument.Parse(tokenPayload);
            var accessToken = doc.RootElement.GetProperty("access_token").GetString();

            var userReq = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
            userReq.Headers.UserAgent.Add(new ProductInfoHeaderValue("EduPage", "1.0"));
            userReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var userRes = await http.SendAsync(userReq);
            var userJson = await userRes.Content.ReadAsStringAsync();
            if (!userRes.IsSuccessStatusCode) return BadRequest(new { message = "GitHub kullanıcı bilgisi alınamadı", error = userJson });
            using var uDoc = JsonDocument.Parse(userJson);
            var ghId = uDoc.RootElement.GetProperty("id").GetInt64().ToString();
            var name = uDoc.RootElement.TryGetProperty("name", out var n) ? (n.GetString() ?? "") : "";

            // email endpoint ayrı
            var emailReq = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user/emails");
            emailReq.Headers.UserAgent.Add(new ProductInfoHeaderValue("EduPage", "1.0"));
            emailReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var emailRes = await http.SendAsync(emailReq);
            var emailJson = await emailRes.Content.ReadAsStringAsync();
            string email = "";
            if (emailRes.IsSuccessStatusCode)
            {
                using var eDoc = JsonDocument.Parse(emailJson);
                var primary = eDoc.RootElement.EnumerateArray().FirstOrDefault(el => el.TryGetProperty("primary", out var p) && p.GetBoolean());
                if (primary.ValueKind != JsonValueKind.Undefined)
                {
                    email = primary.GetProperty("email").GetString() ?? "";
                }
                else if (eDoc.RootElement.GetArrayLength() > 0)
                {
                    email = eDoc.RootElement[0].GetProperty("email").GetString() ?? "";
                }
            }
            if (string.IsNullOrWhiteSpace(email)) email = $"user{ghId}@users.noreply.github.com";

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Provider == "GitHub" && u.ProviderId == ghId);
            if (user == null)
            {
                user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email) ?? new User { Email = email };
                user.DisplayName = string.IsNullOrWhiteSpace(user.DisplayName) ? (string.IsNullOrWhiteSpace(name) ? email : name) : user.DisplayName;
                user.Provider = "GitHub";
                user.ProviderId = ghId;
                user.LastLoginAt = DateTime.UtcNow;
                if (user.Id == 0) _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            var jwt = _tokenService.GenerateUser(user);
            var redirectUri = state ?? (Request.Scheme + "://" + Request.Host + "/");
            var sep = redirectUri.Contains('?') ? '&' : '?';
            return Redirect($"{redirectUri}{sep}token={Uri.EscapeDataString(jwt)}");
        }

        private static byte[] Base64UrlDecode(string input)
        {
            string padded = input.Length % 4 == 0 ? input : input + new string('=', 4 - input.Length % 4);
            string base64 = padded.Replace('-', '+').Replace('_', '/');
            return Convert.FromBase64String(base64);
        }


        // Development-only: set or reset password for a membership user (by email)
        [HttpPost("dev/set-admin-user-password")]
        public async Task<IActionResult> DevSetAdminUserPassword([FromBody] Dictionary<string, string> body)
        {
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (!string.Equals(env, "Development", StringComparison.OrdinalIgnoreCase))
                return NotFound();

            if (body == null || !body.TryGetValue("email", out var email) || !body.TryGetValue("password", out var pass) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(pass))
                return BadRequest(new { message = "email ve password gerekli" });
            email = email.Trim().ToLowerInvariant();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                user = new User { Email = email, DisplayName = email, CreatedAt = DateTime.UtcNow };
                _db.Users.Add(user);
            }
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(pass);
            user.MustChangePassword = true;
            await _db.SaveChangesAsync();
            return Ok(new { message = "ok" });
        }

        // Authenticated: change password
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPost("change-password")]
        public async Task<ActionResult<LoginResponseUserDto>> ChangePassword([FromBody] ChangePasswordRequestDto req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.CurrentPassword) || string.IsNullOrWhiteSpace(req.NewPassword))
                return BadRequest(new { message = "Mevcut ve yeni şifre gereklidir." });
            if (req.NewPassword.Length < 6) return BadRequest(new { message = "Yeni şifre en az 6 karakter olmalı." });

            var email = User?.Claims?.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized();
            if (string.IsNullOrWhiteSpace(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Mevcut şifre yanlış." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            user.MustChangePassword = false;
            await _db.SaveChangesAsync();

            var token = _tokenService.GenerateUser(user);
            return Ok(new LoginResponseUserDto(token, user.Email, user.DisplayName, user.MustChangePassword));
        }
    }
}

