# 🚀 Vercel + Railway Deployment Rehberi

## ✅ Hazırlık Tamamlandı

Deployment için gerekli tüm dosyalar oluşturuldu:

- ✅ `client/.env.production` - Frontend environment variables
- ✅ `client/vercel.json` - Vercel konfigürasyonu
- ✅ `server/CcnaBlog.Api/appsettings.Production.json` - Backend production ayarları
- ✅ `nixpacks.toml` - Railway build konfigürasyonu

---

## 📋 Deployment Adımları

### ADIM 1: GitHub'a Push

```powershell
# Değişiklikleri commit et
git add .
git commit -m "Add deployment configuration files"
git push origin main
```

---

### ADIM 2: Railway - Backend Deployment

#### 2.1. Railway Hesabı Oluştur

1. <https://railway.app/> adresine git
2. "Start a New Project" tıkla
3. GitHub ile giriş yap

#### 2.2. PostgreSQL Database Oluştur

1. "New Project" → "Provision PostgreSQL"
2. Database oluşturulduktan sonra "Variables" sekmesine git
3. `DATABASE_URL` değerini kopyala (şuna benzer):

   ```
   postgresql://user:pass@host:port/dbname
   ```

#### 2.3. Backend Deploy Et

1. "New" → "GitHub Repo" → `ccnadocumentblogpage` seç
2. "Variables" sekmesine git ve şu değişkenleri ekle:

```env
# Database (Railway PostgreSQL'den kopyaladığın)
ConnectionStrings__DefaultConnection=postgresql://user:pass@host:port/dbname

# JWT Secret (32+ karakter, güçlü bir key oluştur)
Jwt__Key=your-super-secret-jwt-key-minimum-32-characters-long-please-change-this

# Environment
ASPNETCORE_ENVIRONMENT=Production

# Port (Railway otomatik atar)
PORT=5000

# CORS (Vercel URL'ini deployment sonrası güncelleyeceğiz)
Cors__AllowedOrigins__0=https://your-app.vercel.app
```

#### 2.4. Domain Kopyala

1. Deployment tamamlandığında Railway size bir URL verecek:

   ```
   https://your-app.railway.app
   ```

2. Bu URL'i kopyala (Frontend'de kullanacağız)

---

### ADIM 3: Vercel - Frontend Deployment

#### 3.1. Vercel Hesabı Oluştur

1. <https://vercel.com/signup> adresine git
2. GitHub ile giriş yap

#### 3.2. Proje Import Et

1. "Add New" → "Project"
2. `ccnadocumentblogpage` repository'sini seç
3. "Root Directory" olarak `client` seç
4. Framework: **Vite** (otomatik algılanmalı)

#### 3.3. Environment Variables Ekle

"Environment Variables" bölümüne şunları ekle:

```env
VITE_API_BASE_URL=https://your-app.railway.app
VITE_GA_MEASUREMENT_ID=
```

> **ÖNEMLİ**: `VITE_API_BASE_URL` değerine Railway'den aldığın URL'i yapıştır!

#### 3.4. Deploy

1. "Deploy" butonuna tıkla
2. Deployment tamamlanınca Vercel size bir URL verecek:

   ```
   https://your-app.vercel.app
   ```

---

### ADIM 4: CORS Güncelleme

Railway backend'inde CORS ayarını güncelle:

1. Railway dashboard → Backend project → "Variables"
2. `Cors__AllowedOrigins__0` değerini Vercel URL'inle güncelle:

   ```
   Cors__AllowedOrigins__0=https://your-app.vercel.app
   ```

3. Redeploy tetiklenecek (otomatik)

---

### ADIM 5: Database Migration

Backend ilk kez çalıştığında otomatik migration yapacak ve seed data ekleyecek.

**Admin Kullanıcı:**

- Email: `yetkinkrsngr@gmail.com`
- Password: `Admin123!`

---

## ✅ Deployment Kontrolü

### Backend Kontrol

Railway URL'ine git:

```
https://your-app.railway.app/health
```

Şunu görmelisin: `{"status":"Healthy"}`

### Frontend Kontrol

Vercel URL'ine git:

```
https://your-app.vercel.app
```

Blog sayfası açılmalı!

### Admin Panel Kontrol

```
https://your-app.vercel.app/admin
```

Admin email ve şifre ile giriş yap.

---

## 🔧 Sorun Giderme

### Backend Hataları

1. Railway dashboard → Logs sekmesi
2. Hata mesajlarını kontrol et
3. Environment variables doğru mu?

### Frontend Hataları

1. Vercel dashboard → Deployment → Logs
2. Browser console'u kontrol et (F12)
3. API URL doğru mu?

### Database Bağlantı Hatası

1. Railway PostgreSQL çalışıyor mu?
2. Connection string doğru mu?
3. Firewall kuralları?

---

## 🎯 Sonraki Adımlar

### 1. Custom Domain (Opsiyonel)

**Vercel:**

- Settings → Domains → Add Domain
- DNS kayıtlarını güncelle

**Railway:**

- Settings → Domains → Generate Domain

### 2. Google Analytics

1. Google Analytics hesabı oluştur
2. Measurement ID al (G-XXXXXXXXXX)
3. Vercel environment variables'a ekle:

   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 3. SSL Sertifikası

✅ Hem Vercel hem Railway otomatik SSL sağlar!

---

## 💰 Maliyet Tahmini

- **Vercel (Frontend)**: Ücretsiz
- **Railway (Backend + DB)**: ~$5-10/ay
- **Toplam**: ~$5-10/ay

---

## 📞 Destek

Sorun yaşarsan:

1. Railway/Vercel loglarını kontrol et
2. GitHub Issues'da sor
3. Discord/Slack topluluklarına katıl

---

**Başarılar! 🎉**

Deployment tamamlandığında blog'un canlıya alınmış olacak!
