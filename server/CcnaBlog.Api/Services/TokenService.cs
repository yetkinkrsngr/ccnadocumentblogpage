using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CcnaBlog.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace CcnaBlog.Api.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;
        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateUser(CcnaBlog.Api.Models.User user)
        {
            var key = _config["Jwt:Key"] ?? "supersecret_dev_key_please_change";
            var issuer = _config["Jwt:Issuer"] ?? "CcnaBlogIssuer";
            var audience = _config["Jwt:Audience"] ?? "CcnaBlogAudience";
            var expiresHours = int.TryParse(_config["Jwt:ExpiresHours"], out var h) ? h : 12;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Admin e-postaları config'ten oku (Binder bağımsız)
            var adminEmails = _config.GetSection("Admin:Emails")
                                     .GetChildren()
                                     .Select(c => (c.Value ?? "").Trim())
                                     .Where(v => !string.IsNullOrEmpty(v))
                                     .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var isAdmin = adminEmails.Contains(user.Email);

            var role = isAdmin ? "Admin" : "User";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.DisplayName ?? user.Email),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, role),
                new Claim("role", role),
                new Claim("mcp", user.MustChangePassword ? "true" : "false")
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiresHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
