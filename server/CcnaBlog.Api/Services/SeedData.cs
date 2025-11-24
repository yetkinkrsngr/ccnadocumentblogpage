using System.Text.RegularExpressions;
using CcnaBlog.Api.Data;
using CcnaBlog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CcnaBlog.Api.Services
{
    public static class SeedData
    {
        public static async Task EnsureSeedAsync(AppDbContext db, IConfiguration config)
        {
            // Admin e-postaları için üyelik tablosunda başlangıç kaydı (zorunlu şifre değişimi ile)
            var adminEmails = config.GetSection("Admin:Emails").GetChildren().Select(c => (c.Value ?? "").Trim()).Where(s => !string.IsNullOrWhiteSpace(s)).ToList();
            foreach (var email in adminEmails)
            {
                var lower = email.ToLowerInvariant();
                if (!await db.Users.AnyAsync(u => u.Email == lower))
                {
                    db.Users.Add(new User
                    {
                        Email = lower,
                        DisplayName = lower,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                        MustChangePassword = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
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

            // Yazıları tek tek kontrol edip ekle
            var routingCat = await db.Categories.FirstOrDefaultAsync(c => c.Slug == Slugify("Routing"));
            var switchingCat = await db.Categories.FirstOrDefaultAsync(c => c.Slug == Slugify("Switching"));

            if (routingCat != null && switchingCat != null)
            {
                var newPosts = new[]
                {
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
                    },
                    new Post
                    {
                        Title = "Cisco IOS Temel Komutlar",
                        Slug = Slugify("Cisco IOS Temel Komutlar"),
                        Summary = "Cisco cihazlarını yönetmek için kullanılan temel IOS komutları.",
                        Author = "Admin",
                        CategoryId = routingCat.Id,
                        Content = "# Cisco IOS Temel Komutlar\n\nCisco cihazlarında (Router/Switch) sık kullanılan bazı temel komutlar şunlardır:\n\n## Modlar\n* **User Exec Mode:** `Router>`\n* **Privileged Exec Mode:** `Router#` (Geçiş için `enable`)\n* **Global Configuration Mode:** `Router(config)#` (Geçiş için `configure terminal`)\n\n## Temel Ayarlar\n```cisco\nhostname R1\nno ip domain-lookup\nline console 0\n logging synchronous\n login local\n```\n\nBu komutlar cihaz adını belirler ve konsol erişimini yapılandırır.",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Post
                    {
                        Title = "Ağ Temelleri: OSI Modeli",
                        Slug = Slugify("Ağ Temelleri: OSI Modeli"),
                        Summary = "OSI referans modeli ve 7 katmanının detaylı incelemesi.",
                        Author = "Admin",
                        CategoryId = switchingCat.Id,
                        Content = "# OSI Modeli\n\nAğ iletişimini standartlaştıran OSI modeli 7 katmandan oluşur:\n\n1. **Fiziksel (Physical):** Kablolar, sinyaller (Bitler).\n2. **Veri Bağı (Data Link):** MAC adresleri, Switch'ler (Frame).\n3. **Ağ (Network):** IP adresleri, Router'lar (Paket).\n4. **Taşıma (Transport):** TCP/UDP, Portlar (Segment).\n5. **Oturum (Session):** Bağlantı yönetimi.\n6. **Sunum (Presentation):** Veri formatı, şifreleme.\n7. **Uygulama (Application):** HTTP, FTP, SMTP gibi protokoller.\n\nHer katman bir üsttekine hizmet verir.",
                        CreatedAt = DateTime.UtcNow
                    }
                };

                foreach (var p in newPosts)
                {
                    if (!await db.Posts.AnyAsync(x => x.Slug == p.Slug))
                    {
                        db.Posts.Add(p);
                    }
                }
            }

            await db.SaveChangesAsync();

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
