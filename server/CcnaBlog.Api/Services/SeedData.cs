using System.Text.RegularExpressions;
using CcnaBlog.Api.Data;
using CcnaBlog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CcnaBlog.Api.Services
{
    public static class SeedData
    {
        public static async Task EnsureSeedAsync(AppDbContext db)
        {
            if (!await db.AdminUsers.AnyAsync(u => u.Username == "admin"))
            {
                db.AdminUsers.Add(new AdminUser
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (!await db.Categories.AnyAsync())
            {
                var categories = new[]
                {
                    new Category { Name = "IP Adresleme", Slug = Slugify("IP Adresleme") },
                    new Category { Name = "Subnetting", Slug = Slugify("Subnetting") },
                    new Category { Name = "Routing", Slug = Slugify("Routing") },
                    new Category { Name = "Switching", Slug = Slugify("Switching") },
                    new Category { Name = "Güvenlik", Slug = Slugify("Güvenlik") }
                };
                db.Categories.AddRange(categories);
            }

            await db.SaveChangesAsync();

            if (!await db.Posts.AnyAsync())
            {
                var routingCat = await db.Categories.FirstAsync(c => c.Slug == Slugify("Routing"));
                var switchingCat = await db.Categories.FirstAsync(c => c.Slug == Slugify("Switching"));

                db.Posts.AddRange(
                    new Post
                    {
                        Title = "CCNA: Statik Yönlendirme Temelleri",
                        Slug = Slugify("CCNA: Statik Yönlendirme Temelleri"),
                        Summary = "Statik route yapılandırması ve temel komutlar.",
                        Author = "Admin",
                        CategoryId = routingCat.Id,
                        Content = "# Statik Route\n\nAşağıdaki örnekte R1 üzerinde bir statik rota tanımlıyoruz:\n\n```cisco\nip route 10.10.20.0 255.255.255.0 192.168.1.2\nshow ip route\n```\n\nBu komutla 10.10.20.0/24 ağına 192.168.1.2 üzerinden erişim sağlanır.",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Post
                    {
                        Title = "CCNA: VLAN ve Trunk Temelleri",
                        Slug = Slugify("CCNA: VLAN ve Trunk Temelleri"),
                        Summary = "VLAN oluşturma ve trunk port yapılandırma.",
                        Author = "Admin",
                        CategoryId = switchingCat.Id,
                        Content = "# VLAN Oluşturma\n\nÖrnek bir VLAN oluşturma ve trunk ayarı:\n\n```cisco\nconfigure terminal\nvlan 10\nname KURUM_ICI\ninterface GigabitEthernet0/1\nswitchport mode trunk\nswitchport trunk allowed vlan 10,20\nend\nwrite memory\n```\n",
                        CreatedAt = DateTime.UtcNow
                    }
                );
            }

            await db.SaveChangesAsync();

            // Optional admin password override via environment variable (no plaintext stored)
            var newPass = Environment.GetEnvironmentVariable("ADMIN_NEW_PASSWORD");
            if (!string.IsNullOrWhiteSpace(newPass))
            {
                var admin = await db.AdminUsers.FirstOrDefaultAsync(u => u.Username == "admin");
                if (admin != null)
                {
                    admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPass);
                    await db.SaveChangesAsync();
                }
            }
        }

        public static string Slugify(string input)
        {
            string text = input.ToLowerInvariant();
            text = text.Replace("ı", "i").Replace("ğ", "g").Replace("ü", "u").Replace("ş", "s").Replace("ö", "o").Replace("ç", "c");
            text = Regex.Replace(text, @"[^a-z0-9]+", "-");
            text = text.Trim('-');
            return text;
        }
    }
}
