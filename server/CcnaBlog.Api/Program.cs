using System.Text;
using CcnaBlog.Api.Data;
using CcnaBlog.Api.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Threading.RateLimiting;
using Serilog;
using Serilog.Events;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "CcnaBlog")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/ccnablog-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting CCNA Blog API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging
    builder.Host.UseSerilog();

// Controllers + ProblemDetails
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});
builder.Services.AddProblemDetails();

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

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

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[]
{
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:8081",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    "http://127.0.0.1:8081"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientCors", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()); // Allow credentials for better security with cookies/auth headers if needed
});

// Rate Limiter
builder.Services.AddRateLimiter(options =>
{
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken: token);
    };

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 2,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("comments", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// HSTS (Production only)
if (!builder.Environment.IsDevelopment())
{
    builder.Services.AddHsts(options =>
    {
        options.Preload = true;
        options.IncludeSubDomains = true;
        options.MaxAge = TimeSpan.FromDays(60);
    });
}

// JWT Authentication
// Priority: Environment Variable > AppSettings > Default (Dev)
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? builder.Configuration["Jwt:Key"] ?? "supersecret_dev_key_please_change";
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
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.Zero // Remove delay of token expiration
    };
});

// Services
builder.Services.AddSingleton<ProfanityFilter>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddHttpClient();

// Response caching
builder.Services.AddResponseCaching();

// Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

var app = builder.Build();

// Production: JWT Key Guard
if (!app.Environment.IsDevelopment())
{
    if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey == "supersecret_dev_key_please_change" || jwtKey.Length < 32)
    {
        throw new InvalidOperationException("CRITICAL: Secure JWT Key is required in Production! Set 'JWT_KEY' environment variable.");
    }
    app.UseHsts();
}

// Security Headers Middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https:;");
    await next();
});

// Global exception handler -> ProblemDetails
app.UseExceptionHandler();

// Database migrate & seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.EnsureSeedAsync(db, builder.Configuration);
    await FullTextSetup.EnsureAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseResponseCompression(); // Place before static files
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("ClientCors");
app.UseResponseCaching();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// RSS & sitemap
app.MapGet("/rss.xml", async (AppDbContext db, HttpContext ctx) =>
{
    ctx.Response.ContentType = "application/rss+xml";
    var posts = await db.Posts.Include(p => p.Category).OrderByDescending(p => p.CreatedAt).Take(50).ToListAsync();
    var baseUrl = builder.Configuration["Site:BaseUrl"] ?? "http://localhost:5153";
    var items = string.Join("", posts.Select(p => $"<item><title>{System.Security.SecurityElement.Escape(p.Title)}</title><link>{baseUrl}/yazi/{p.Slug}</link><pubDate>{p.CreatedAt:R}</pubDate><description>{System.Security.SecurityElement.Escape(p.Summary)}</description></item>"));
    var xml = $"<?xml version=\"1.0\" encoding=\"UTF-8\" ?><rss version=\"2.0\"><channel><title>CCNA Blog</title><link>{baseUrl}</link><description>CCNA Türkçe Blog</description>{items}</channel></rss>";
    await ctx.Response.WriteAsync(xml);
});

app.MapGet("/robots.txt", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "text/plain";
    var baseUrl = builder.Configuration["Site:BaseUrl"] ?? "http://localhost:5153";
    var content = $"User-agent: *\nAllow: /\nSitemap: {baseUrl}/sitemap.xml";
    await ctx.Response.WriteAsync(content);
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

Log.Information("CCNA Blog API started successfully");
app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
