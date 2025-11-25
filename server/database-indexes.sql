-- Database Performance Indexes
-- Run this script on your SQL Server database

USE [CcnaBlog];
GO

-- Posts table indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Posts_CategoryId' AND object_id = OBJECT_ID('Posts'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Posts_CategoryId ON Posts(CategoryId) INCLUDE (Title, Summary, Slug, CreatedAt, FeaturedImageUrl);
    PRINT 'Created index: IX_Posts_CategoryId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Posts_CreatedAt' AND object_id = OBJECT_ID('Posts'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Posts_CreatedAt ON Posts(CreatedAt DESC) INCLUDE (Title, Summary, Slug, CategoryId, FeaturedImageUrl);
    PRINT 'Created index: IX_Posts_CreatedAt';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Posts_Slug' AND object_id = OBJECT_ID('Posts'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_Posts_Slug ON Posts(Slug);
    PRINT 'Created index: IX_Posts_Slug';
END

-- Comments table indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Comments_PostId_Approved' AND object_id = OBJECT_ID('Comments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Comments_PostId_Approved ON Comments(PostId, Approved) INCLUDE (AuthorName, Content, CreatedAt);
    PRINT 'Created index: IX_Comments_PostId_Approved';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Comments_CreatedAt' AND object_id = OBJECT_ID('Comments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Comments_CreatedAt ON Comments(CreatedAt DESC) WHERE Approved = 0;
    PRINT 'Created index: IX_Comments_CreatedAt (filtered for moderation)';
END

-- Categories table index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_Slug' AND object_id = OBJECT_ID('Categories'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_Categories_Slug ON Categories(Slug);
    PRINT 'Created index: IX_Categories_Slug';
END

-- Newsletter subscribers index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsletterSubscribers_Email' AND object_id = OBJECT_ID('NewsletterSubscribers'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_NewsletterSubscribers_Email ON NewsletterSubscribers(Email);
    PRINT 'Created index: IX_NewsletterSubscribers_Email';
END

PRINT 'Database indexing completed successfully!';
GO
