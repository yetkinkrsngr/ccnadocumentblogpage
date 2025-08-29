using Microsoft.EntityFrameworkCore;

namespace CcnaBlog.Api.Services
{
    public static class FullTextSetup
    {
        public static async Task EnsureAsync(Data.AppDbContext db)
        {
            var sql = @"IF (SELECT FULLTEXTSERVICEPROPERTY('IsFullTextInstalled')) = 1
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.fulltext_catalogs WHERE name = 'FTCatalog_CcnaBlog')
        CREATE FULLTEXT CATALOG FTCatalog_CcnaBlog;

    IF NOT EXISTS (SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('dbo.Posts'))
        CREATE FULLTEXT INDEX ON dbo.Posts
        (
            Title LANGUAGE 1055,
            Summary LANGUAGE 1055,
            [Content] LANGUAGE 1055
        )
        KEY INDEX PK_Posts
        ON FTCatalog_CcnaBlog;
END";
            try { await db.Database.ExecuteSqlRawAsync(sql); }
            catch { /* ignore if not supported */ }
        }
    }
}
