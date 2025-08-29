# CCNA Blog (Türkçe)

Modern, responsive ve SEO dostu CCNA eğitim blogu.

Teknikler:
- Frontend: React + Vite + TailwindCSS
- Backend: ASP.NET Core (.NET 8) Web API
- Veritabanı: Microsoft SQL Server (LocalDB varsayılan)
- Kimlik Doğrulama: JWT (admin)

Özellikler:
- Ana sayfada kart grid yapısı
- Kategoriler: IP Adresleme, Subnetting, Routing, Switching, Güvenlik
- Yazı detay sayfası, tarih/yazar/kategori bilgisi
- Cisco CLI kod vurgulama (Prism + custom cisco dili)
- Yorum sistemi: basit küfür filtresi + admin onayı
- Admin paneli: yazı/kategori/yorum yönetimi
- 2025 stili: yuvarlatılmış köşeler, yumuşak gölgeler, hover animasyonları, Inter/Roboto fontları

## Gerekli araçlar
- .NET 8 SDK
- Node.js 18+
- (Windows) SQL Server / LocalDB (varsayılan: (localdb)\\MSSQLLocalDB)

## Çalıştırma

1) Backend (API)

```bash
# restore + build
 dotnet build server/CcnaBlog.Api/CcnaBlog.Api.csproj

# geliştirme profili (http:5153)
 dotnet run --project server/CcnaBlog.Api/CcnaBlog.Api.csproj --launch-profile http
```

- İlk çalıştırmada veritabanı şeması otomatik oluşturulur ve örnek veriler seed edilir.
- Swagger: http://localhost:5153/swagger

2) Frontend (React)

```bash
# bağımlılıklar
 cd client
 npm install

# geliştirme
 npm run dev
```

- Varsayılan API adresi: http://localhost:5153/api
- İsterseniz client dizininde `.env` oluşturup `VITE_API_URL=http://localhost:5153/api` tanımlayabilirsiniz.

## Admin Bilgileri
- Kullanıcı adı: `admin`
- Şifre: `Admin123!`

JWT anahtarı (geliştirme): server/CcnaBlog.Api/appsettings.json içinde `Jwt:Key`. Üretimde ortam değişkeni veya gizli yönetimi kullanın.

## Proje Yapısı

```
EduPage/
 ├─ server/
 │   └─ CcnaBlog.Api/
 │       ├─ Controllers/ (Auth, Posts, Categories, Comments)
 │       ├─ Data/ (AppDbContext)
 │       ├─ DTOs/
 │       ├─ Models/ (Post, Category, Comment, AdminUser)
 │       ├─ Services/ (TokenService, ProfanityFilter, SeedData)
 │       ├─ Program.cs, appsettings.json
 │
 └─ client/
     ├─ src/
     │  ├─ admin/ (Login, Dashboard, Posts, EditPost, Categories, Comments)
     │  ├─ components/ (Navbar, Footer, PostCard, ProtectedRoute)
     │  ├─ pages/ (Home, Categories, About, Contact, Post)
     │  ├─ api.js, prism-cisco.js, index.css, main.jsx, App.jsx
     ├─ index.html, package.json, vite.config.js, tailwind.config.js, postcss.config.js
```

## Notlar
- Küfür filtresi basit maskleme uygular ve tüm yorumlar admin onayına tabidir.
- Cisco kod blokları için markdown içinde: 

```md
```cisco
interface GigabitEthernet0/1
switchport mode trunk
```
```

- Üretimde:
  - Gerçek MSSQL sunucusu bağlantı dizesini `appsettings.json` veya ortam değişkeninde `ConnectionStrings__DefaultConnection` olarak tanımlayın.
  - `Jwt:Key` için güvenli bir anahtar belirleyin ve ortam değişkeni kullanın.
  - EF Core migration kullanmak isterseniz `EnsureCreated` yerine migration akışı ekleyin.

