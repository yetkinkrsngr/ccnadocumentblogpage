using System.Text.RegularExpressions;

namespace CcnaBlog.Api.Services
{
    public class ProfanityFilter
    {
        private readonly HashSet<string> _words;
        public ProfanityFilter(IConfiguration config)
        {
            var words = config.GetSection("Profanity:Words").Get<string[]>() ?? Array.Empty<string>();
            _words = words.Select(w => w.ToLowerInvariant()).ToHashSet();
        }

        public bool Contains(string text)
        {
            text = text.ToLowerInvariant();
            foreach (var w in _words)
            {
                if (string.IsNullOrWhiteSpace(w)) continue;
                if (Regex.IsMatch(text, $"\\b{Regex.Escape(w)}\\b", RegexOptions.IgnoreCase))
                    return true;
            }
            return false;
        }

        public string Mask(string text)
        {
            if (_words.Count == 0) return text;
            return _words.Aggregate(text, (current, bad) =>
                Regex.Replace(current, $"\\b{Regex.Escape(bad)}\\b", new string('*', bad.Length), RegexOptions.IgnoreCase));
        }
    }
}
