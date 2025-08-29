namespace CcnaBlog.Api.DTOs
{
    // Auth (Membership)
    public record RegisterRequestDto(string Email, string Password, string DisplayName);
    public record LoginEmailRequestDto(string Email, string Password);
    public record LoginResponseUserDto(string Token, string Email, string DisplayName, bool MustChangePassword);
    public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);

    // Category
    public record CategoryDto(int Id, string Name, string Slug);

    // Post
    public record PostListItemDto(int Id, string Title, string Summary, string Slug, string CategoryName, string CategorySlug, DateTime CreatedAt);
    public record PostDetailDto(int Id, string Title, string Content, string Slug, string Author, DateTime CreatedAt, string CategoryName, string CategorySlug, List<CommentViewDto> Comments);
    public record CreateUpdatePostDto(string Title, string Summary, string Content, int CategoryId, string Author);
    public record PostEditDto(int Id, string Title, string Summary, string Content, int CategoryId, string Author, string Slug);
    public record PostSearchResultDto(int Id, string Title, string Summary, string Slug, string CategoryName, string CategorySlug, DateTime CreatedAt, int Rank);

    // Comment
    public record CreateCommentDto(string AuthorName, string Content);
    public record CommentViewDto(int Id, string AuthorName, string Content, DateTime CreatedAt);
    public record CommentModerationDto(int Id, int PostId, string PostTitle, string AuthorName, string Content, DateTime CreatedAt, bool Approved);

    // Media
    public record UploadResponseDto(string Url, string SignedUrl, string Path);
    public record MediaItemDto(string Path, string Url, long Size, DateTime CreatedAt, string ContentType);
}
