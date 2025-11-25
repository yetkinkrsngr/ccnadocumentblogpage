import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

export default function SEO({
    title,
    description,
    canonical,
    type = 'website',
    image,
    publishedAt,
    updatedAt,
    author,
    schema
}) {
    const siteName = 'CCNA Blog';
    const baseUrl = window.location.origin;
    const fullUrl = canonical ? (canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`) : window.location.href;
    const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-default.jpg`;

    const baseTitle = title ? `${title} | ${siteName}` : siteName;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{baseTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title || siteName} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:image" content={fullImage} />

            {/* Article Specific OG */}
            {type === 'article' && publishedAt && <meta property="article:published_time" content={publishedAt} />}
            {type === 'article' && updatedAt && <meta property="article:modified_time" content={updatedAt} />}
            {type === 'article' && author && <meta property="article:author" content={author} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteName} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Structured Data */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
}

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    canonical: PropTypes.string,
    type: PropTypes.string,
    image: PropTypes.string,
    publishedAt: PropTypes.string,
    updatedAt: PropTypes.string,
    author: PropTypes.string,
    schema: PropTypes.object
};
