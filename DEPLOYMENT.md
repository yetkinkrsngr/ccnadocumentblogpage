# 🚀 CCNA Blog - Deployment Guide

## Deployment Seçenekleri

### 1️⃣ **Azure (Önerilen)** - Microsoft ekosistemi

### 2️⃣ **Vercel + Railway** - Hızlı ve kolay

### 3️⃣ **DigitalOcean** - Tam kontrol

### 4️⃣ **Shared Hosting** - Ekonomik

---

## 🔵 SEÇENEK 1: AZURE (Microsoft Ekosistemi)

### Avantajları

- ✅ ASP.NET Core için optimize
- ✅ SQL Server entegrasyonu
- ✅ Ücretsiz tier (12 ay)
- ✅ Auto-scaling
- ✅ Application Insights

### Maliyet

- **Free Tier**: İlk 12 ay ücretsiz
- **Sonrası**: ~$50-100/ay (trafik bağlı)

### Adımlar

#### A. Backend (ASP.NET Core API)

**1. Azure hesabı oluştur**

```
https://azure.microsoft.com/free/
```

**2. Azure CLI yükle**

```powershell
winget install Microsoft.AzureCLI
```

**3. Azure'a login**

```powershell
az login
```

**4. Resource Group oluştur**

```powershell
az group create --name ccna-blog-rg --location westeurope
```

**5. SQL Server oluştur**

```powershell
az sql server create `
  --name ccnablog-sql-server `
  --resource-group ccna-blog-rg `
  --location westeurope `
  --admin-user sqladmin `
  --admin-password "YourStrongPassword123!"
```

**6. SQL Database oluştur**

```powershell
az sql db create `
  --resource-group ccna-blog-rg `
  --server ccnablog-sql-server `
  --name CcnaBlogDb `
  --service-objective S0
```

**7. Firewall kuralı ekle**

```powershell
az sql server firewall-rule create `
  --resource-group ccna-blog-rg `
  --server ccnablog-sql-server `
  --name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0
```

**8. App Service Plan oluştur**

```powershell
az appservice plan create `
  --name ccnablog-plan `
  --resource-group ccna-blog-rg `
  --sku B1 `
  --is-linux
```

**9. Web App oluştur**

```powershell
az webapp create `
  --resource-group ccna-blog-rg `
  --plan ccnablog-plan `
  --name ccnablog-api `
  --runtime "DOTNET|8.0"
```

**10. Connection String ayarla**

```powershell
az webapp config connection-string set `
  --resource-group ccna-blog-rg `
  --name ccnablog-api `
  --connection-string-type SQLAzure `
  --settings DefaultConnection="Server=tcp:ccnablog-sql-server.database.windows.net,1433;Database=CcnaBlogDb;User ID=sqladmin;Password=YourStrongPassword123!;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

**11. Environment variables ayarla**

```powershell
az webapp config appsettings set `
  --resource-group ccna-blog-rg `
  --name ccnablog-api `
  --settings `
    JWT_KEY="your-super-secret-jwt-key-min-32-characters-long" `
    ASPNETCORE_ENVIRONMENT="Production" `
    Site__BaseUrl="https://ccnablog-api.azurewebsites.net"
```

**12. Deploy et**

```powershell
cd server/CcnaBlog.Api
dotnet publish -c Release -o ./publish
cd publish
Compress-Archive -Path * -DestinationPath ../deploy.zip
az webapp deployment source config-zip `
  --resource-group ccna-blog-rg `
  --name ccnablog-api `
  --src ../deploy.zip
```

#### B. Frontend (React)

**1. Vercel hesabı oluştur**

```
https://vercel.com/signup
```

**2. Vercel CLI yükle**

```powershell
npm install -g vercel
```

**3. Login**

```powershell
vercel login
```

**4. Environment variables ayarla**

```powershell
cd client
# .env.production oluştur
echo "VITE_API_BASE_URL=https://ccnablog-api.azurewebsites.net" > .env.production
echo "VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env.production
```

**5. Deploy**

```powershell
vercel --prod
```

**6. Domain ayarla (opsiyonel)**

- Vercel dashboard'da custom domain ekle
- DNS kayıtlarını güncelle

---

## 🟢 SEÇENEK 2: VERCEL + RAILWAY (Hızlı)

### Avantajları

- ✅ Çok hızlı setup
- ✅ Otomatik HTTPS
- ✅ Git entegrasyonu
- ✅ Ücretsiz tier

### Maliyet

- **Frontend (Vercel)**: Ücretsiz
- **Backend (Railway)**: $5-20/ay

### Adımlar

#### A. Backend (Railway)

**1. Railway hesabı oluştur**

```
https://railway.app/
```

**2. GitHub'a push**

```powershell
cd server/CcnaBlog.Api
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ccnablog-api.git
git push -u origin main
```

**3. Railway'de yeni proje**

- "New Project" → "Deploy from GitHub repo"
- Repository seç
- Root directory: `server/CcnaBlog.Api`

**4. PostgreSQL ekle (veya SQL Server)**

- "New" → "Database" → "PostgreSQL"
- Connection string kopyala

**5. Environment variables**

```
ConnectionStrings__DefaultConnection=<railway-postgres-url>
JWT_KEY=your-super-secret-jwt-key-min-32-characters
ASPNETCORE_ENVIRONMENT=Production
Site__BaseUrl=https://your-app.railway.app
```

**6. Deploy**

- Otomatik deploy başlar
- URL: `https://your-app.railway.app`

#### B. Frontend (Vercel)

**1. GitHub'a push**

```powershell
cd client
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ccnablog-client.git
git push -u origin main
```

**2. Vercel'de import**

- "Add New" → "Project"
- GitHub repo seç
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**3. Environment variables**

```
VITE_API_BASE_URL=https://your-app.railway.app
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**4. Deploy**

- Otomatik deploy başlar
- URL: `https://your-app.vercel.app`

---

## 🔴 SEÇENEK 3: DIGITALOCEAN (Tam Kontrol)

### Avantajları

- ✅ Tam kontrol
- ✅ Sabit fiyat
- ✅ SSH erişimi
- ✅ Docker desteği

### Maliyet

- **Droplet**: $12-24/ay
- **Managed Database**: $15/ay

### Adımlar

**1. Droplet oluştur**

- Ubuntu 22.04 LTS
- 2 GB RAM / 1 CPU ($12/ay)

**2. SSH ile bağlan**

```powershell
ssh root@your-droplet-ip
```

**3. .NET 8 yükle**

```bash
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0
```

**4. Nginx yükle**

```bash
apt update
apt install nginx -y
```

**5. SQL Server yükle (veya PostgreSQL)**

```bash
# PostgreSQL önerilir (daha hafif)
apt install postgresql postgresql-contrib -y
```

**6. Projeyi deploy et**

```bash
cd /var/www
git clone https://github.com/yourusername/ccnablog-api.git
cd ccnablog-api/server/CcnaBlog.Api
dotnet publish -c Release -o /var/www/ccnablog
```

**7. Systemd service oluştur**

```bash
nano /etc/systemd/system/ccnablog.service
```

```ini
[Unit]
Description=CCNA Blog API

[Service]
WorkingDirectory=/var/www/ccnablog
ExecStart=/root/.dotnet/dotnet /var/www/ccnablog/CcnaBlog.Api.dll
Restart=always
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=JWT_KEY=your-secret-key

[Install]
WantedBy=multi-user.target
```

**8. Service başlat**

```bash
systemctl enable ccnablog
systemctl start ccnablog
```

**9. Nginx yapılandır**

```bash
nano /etc/nginx/sites-available/ccnablog
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5153;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**10. SSL (Let's Encrypt)**

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

**11. Frontend deploy**

```bash
cd /var/www
git clone https://github.com/yourusername/ccnablog-client.git
cd ccnablog-client/client
npm install
npm run build
cp -r dist/* /var/www/html/
```

---

## 📋 DEPLOYMENT CHECKLIST

### Öncesi

- [ ] Production build test edildi
- [ ] Environment variables hazırlandı
- [ ] Database backup alındı
- [ ] SSL sertifikası hazır
- [ ] Domain satın alındı

### Backend

- [ ] Connection string güncellendi
- [ ] JWT_KEY ayarlandı (min 32 karakter)
- [ ] CORS allowed origins güncellendi
- [ ] Logging yapılandırıldı
- [ ] Health check endpoint test edildi

### Frontend

- [ ] API URL güncellendi
- [ ] Google Analytics ID eklendi
- [ ] Production build alındı
- [ ] Asset'ler CDN'e yüklendi (opsiyonel)

### Sonrası

- [ ] SSL çalışıyor mu?
- [ ] Database migration çalıştı mı?
- [ ] Admin login çalışıyor mu?
- [ ] Analytics tracking çalışıyor mu?
- [ ] Log'lar yazılıyor mu?
- [ ] Lighthouse test yap

---

## 🔧 PRODUCTION CONFIGURATION

### appsettings.Production.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "https://your-domain.com",
      "https://www.your-domain.com"
    ]
  },
  "Jwt": {
    "ExpiresHours": 12
  }
}
```

### .env.production (Frontend)

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🎯 ÖNERİLEN DEPLOYMENT PLANI

### Yeni Başlayanlar için

**Vercel + Railway** (Seçenek 2)

- Kolay setup
- Otomatik deployment
- Ücretsiz başlangıç

### Profesyonel için

**Azure** (Seçenek 1)

- Enterprise-grade
- Scalable
- Microsoft desteği

### Tam Kontrol isteyenler için

**DigitalOcean** (Seçenek 3)

- SSH erişimi
- Docker kullanımı
- Sabit maliyet

---

## 📞 DESTEK

Deployment sırasında sorun yaşarsanız:

1. Railway/Vercel log'larını kontrol edin
2. Azure Application Insights'a bakın
3. Serilog dosyalarını inceleyin

---

**Hangi deployment seçeneğini tercih edersiniz?**
Ben size adım adım yardımcı olabilirim! 🚀
