# 🎓 CCNA Blog - Modern Full-Stack Blog Platform

A modern, production-ready blog platform built with React (Vite) and ASP.NET Core, specifically designed for CCNA networking content.

## ✨ Features

### 🎨 Frontend

- **Modern UI/UX** - Beautiful, responsive design with dark mode support
- **React 18** with Vite for lightning-fast development
- **React Router** for client-side routing
- **Tailwind CSS** equivalent custom design system
- **Toast Notifications** for user feedback
- **Modal System** for dialogs and confirmations
- **SEO Optimized** with dynamic meta tags, Open Graph, and Schema.org
- **Google Analytics** integration for tracking
- **Image Upload** with drag-and-drop support
- **Search** with filters and recent searches
- **Markdown Support** with syntax highlighting (Cisco commands)
- **Social Sharing** buttons
- **Reading Progress** indicator
- **Table of Contents** auto-generation

### 🔒 Backend

- **ASP.NET Core 8.0** with Entity Framework Core
- **SQL Server** with optimized indexes
- **JWT Authentication** with role-based authorization
- **Rate Limiting** to prevent abuse
- **Response Compression** (Gzip)
- **Response Caching** with ETag support
- **Serilog** for structured logging
- **FluentValidation** for input validation
- **Image Processing** with automatic WebP conversion
- **Full-Text Search** (SQL Server)
- **Health Checks** for monitoring
- **Swagger/OpenAPI** documentation

### 📊 Admin Panel

- **Dashboard** with analytics overview
- **Post Management** (CRUD operations)
- **Category Management**
- **Comment Moderation**
- **Media Library** with upload and management
- **Analytics Dashboard** with growth metrics
- **Newsletter Subscriber** management

### 🚀 Performance

- **Bundle Size**: ~183 KB (gzipped)
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Automatic WebP conversion + resize
- **Database Indexing**: Optimized queries
- **Caching**: Smart caching strategy (60s-300s)
- **Compression**: Gzip enabled
- **Lazy Loading**: Images and routes

### 🔐 Security

- **JWT** with secure key management
- **HTTPS** enforcement
- **CORS** policy
- **Rate Limiting** (100 req/min global, 5 req/min login)
- **Security Headers** (CSP, X-Frame-Options, etc.)
- **Input Validation** with FluentValidation
- **SQL Injection** protection (parameterized queries)
- **XSS** protection

## 🛠️ Tech Stack

### Frontend

- React 18
- Vite
- React Router v6
- Axios
- React Markdown
- Prism.js (syntax highlighting)
- PropTypes

### Backend

- ASP.NET Core 8.0
- Entity Framework Core 9
- SQL Server
- Serilog
- FluentValidation
- BCrypt.NET
- ImageSharp
- Swashbuckle (Swagger)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)

### Backend Setup

1. Navigate to server directory:

```bash
cd server/CcnaBlog.Api
```

2. Restore packages:

```bash
dotnet restore
```

3. Update connection string in `appsettings.json` if needed

4. Run migrations (automatic on startup):

```bash
dotnet run
```

Backend will start on `http://localhost:5153`

### Frontend Setup

1. Navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (optional):

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_BASE_URL=http://localhost:5153
```

4. Start development server:

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## 🗄️ Database

### Initial Setup

The database will be created automatically on first run with seed data:

- Admin user: `yetkinkrsngr@gmail.com` / `Admin123!`
- Sample categories and posts
- Full-text search catalog

### Performance Indexes

Run the SQL script for optimal performance:

```bash
sqlcmd -S (localdb)\MSSQLLocalDB -d CcnaBlogDb -i server/database-indexes.sql
```

## 📊 Analytics

### Google Analytics

1. Get your GA Measurement ID from Google Analytics
2. Add to `.env`:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Admin Analytics

Access at `/admin` after login:

- Overview stats
- Popular posts
- Recent activity
- Category performance
- Growth trends

## 🔑 Environment Variables

### Backend (`appsettings.json`)

```json
{
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "CcnaBlogIssuer",
    "Audience": "CcnaBlogAudience"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=CcnaBlogDb;..."
  }
}
```

### Frontend (`.env`)

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_BASE_URL=http://localhost:5153
```

## 📝 API Endpoints

### Public

- `GET /api/posts` - List posts (paginated)
- `GET /api/posts/{slug}` - Get post by slug
- `GET /api/posts/search` - Search posts
- `GET /api/categories` - List categories
- `POST /api/comments/post/{id}` - Submit comment
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Admin (Requires Auth)

- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/media/upload` - Upload image
- `GET /api/analytics/overview` - Get analytics
- `GET /api/comments/pending` - Get pending comments

## 🚀 Deployment

### Production Build

**Frontend:**

```bash
cd client
npm run build
```

Output: `client/dist/`

**Backend:**

```bash
cd server/CcnaBlog.Api
dotnet publish -c Release -o publish
```

### Environment Setup

1. Set `JWT_KEY` environment variable (min 32 chars)
2. Update connection string for production database
3. Configure CORS allowed origins
4. Set up HTTPS certificate
5. Configure logging (Serilog)

## 📖 Usage

### Creating a Post

1. Login as admin
2. Navigate to `/admin/yazilar`
3. Click "Yeni Yazı"
4. Fill in title, summary, content (Markdown)
5. Select category
6. Upload featured image (optional)
7. Save

### Markdown Features

- Headers (`#`, `##`, `###`)
- Lists (ordered, unordered)
- Code blocks with syntax highlighting
- Links and images
- Tables
- Blockquotes

### Cisco Code Blocks

\`\`\`cisco
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown
\`\`\`

## 🧪 Testing

### Run Backend Tests

```bash
cd server/CcnaBlog.Api.Tests
dotnet test
```

### Run Frontend Tests

```bash
cd client
npm test
```

## 📊 Performance Metrics

- **Lighthouse Score**: 90+ (Performance, SEO, Accessibility)
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 3s
- **Bundle Size**: 183 KB (gzipped)
- **SEO Score**: 95+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Yetkin Karasu**

- Email: <yetkinkrsngr@gmail.com>
- GitHub: [@yetkinkrsngr](https://github.com/yetkinkrsngr)

## 🙏 Acknowledgments

- React Team for React 18
- Microsoft for ASP.NET Core
- Vite Team for the amazing build tool
- All open-source contributors

---

**Built with ❤️ for the CCNA community**
