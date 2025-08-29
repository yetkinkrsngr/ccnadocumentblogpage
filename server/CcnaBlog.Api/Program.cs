using System.Text;
using CcnaBlog.Api.Data;
using CcnaBlog.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Controllers + ProblemDetails
builder.Services.AddProblemDetails();

// Swagger + JWT Security
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CCNA Blog API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Bearer token"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            }, new string[] { }
        }
    });
});

// DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                      ?? "Server=(localdb)\\MSSQLLocalDB;Database=CcnaBlogDb;Trusted_Connection=True;MultipleActiveResultSets=true";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>(name: "db");

// CORS for Vite dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientCors", policy =>
        policy.WithOrigins(
                  "http://localhost:5173",
                  "http://localhost:5174",
                  "http://localhost:5175",
                  "http://localhost:5176",
                  "http://127.0.0.1:5173",
                  "http://127.0.0.1:5174",
                  "http://127.0.0.1:5175",
                  "http://127.0.0.1:5176"
              )
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Rate Limiter
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
    });
    options.AddFixedWindowLimiter("comments", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "supersecret_dev_key_please_change";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CcnaBlogIssuer";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CcnaBlogAudience";
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = signingKey
    };
});

// Services
builder.Services.AddSingleton<ProfanityFilter>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddHttpClient();

// JSON options
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Response caching
builder.Services.AddResponseCaching();

var app = builder.Build();

// Production: JWT anahtar guard
if (!app.Environment.IsDevelopment())
{
    if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey == "supersecret_dev_key_please_change" || jwtKey.Length < 32)
    {
        throw new InvalidOperationException("Güvenli JWT anahtarı gereklidir. Production ortamında 'Jwt:Key' güçlü ve en az 32 karakter olmalıdır.");
    }
}

// Global exception handler -> ProblemDetails
app.UseExceptionHandler();

// Database migrate & seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.EnsureSeedAsync(db);
    await FullTextSetup.EnsureAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("ClientCors");
app.UseResponseCaching();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// RSS & sitemap (basit)
app.MapGet("/rss.xml", async (AppDbContext db, HttpContext ctx) =>
{
    ctx.Response.ContentType = "application/rss+xml";
    var posts = await db.Posts.Include(p => p.Category).OrderByDescending(p => p.CreatedAt).Take(50).ToListAsync();
    var baseUrl = builder.Configuration["Site:BaseUrl"] ?? "http://localhost:5153";
    var items = string.Join("", posts.Select(p => $"<item><title>{System.Security.SecurityElement.Escape(p.Title)}</title><link>{baseUrl}/yazi/{p.Slug}</link><pubDate>{p.CreatedAt:R}</pubDate><description>{System.Security.SecurityElement.Escape(p.Summary)}</description></item>"));
    var xml = $"<?xml version=\"1.0\" encoding=\"UTF-8\" ?><rss version=\"2.0\"><channel><title>CCNA Blog</title><link>{baseUrl}</link><description>CCNA Türkçe Blog</description>{items}</channel></rss>";
    await ctx.Response.WriteAsync(xml);
});

app.MapGet("/sitemap.xml", async (AppDbContext db, HttpContext ctx) =>
{
    ctx.Response.ContentType = "application/xml";
    var baseUrl = builder.Configuration["Site:BaseUrl"] ?? "http://localhost:5153";
    var urls = new List<string>
    {
        $"<url><loc>{baseUrl}/</loc></url>",
        $"<url><loc>{baseUrl}/kategoriler</loc></url>",
        $"<url><loc>{baseUrl}/hakkinda</loc></url>",
        $"<url><loc>{baseUrl}/iletisim</loc></url>"
    };
    var posts = await db.Posts.OrderByDescending(p => p.CreatedAt).ToListAsync();
    urls.AddRange(posts.Select(p => $"<url><loc>{baseUrl}/yazi/{p.Slug}</loc><lastmod>{(p.UpdatedAt ?? p.CreatedAt):yyyy-MM-dd}</lastmod></url>"));
    var xml = $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">{string.Join("", urls)}</urlset>";
    await ctx.Response.WriteAsync(xml);
});

app.MapControllers();

app.MapHealthChecks("/health");

app.Run();
