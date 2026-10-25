import type { MetadataRoute } from 'next';

/** Production base URL for robots directives. */
function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://craftywrap.com';
  return url.replace(/\/+$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cart',
          '/checkout',
          '/login',
          '/signup',
          '/account',
          '/admin',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
