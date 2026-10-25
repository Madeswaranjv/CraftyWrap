import type { MetadataRoute } from 'next';
import { getApiBaseUrl } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Production base URL for all sitemap entries. */
function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://craftywrap.com';
  return url.replace(/\/+$/, '');
}

/** Minimal product shape returned by /products (only fields we need). */
interface SitemapProduct {
  slug: string;
  updatedAt?: string;
}

/** Minimal theme shape returned by /design-themes. */
interface SitemapTheme {
  slug: string;
}

/** Fetch all active products from the backend. */
async function fetchAllProducts(): Promise<SitemapProduct[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/products?limit=1000`, {
      next: { revalidate: 3600 }, // re-generate at most every hour
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data?.products)) return [];
    return json.data.products as SitemapProduct[];
  } catch {
    return [];
  }
}

/** Fetch all design themes from the backend. */
async function fetchAllThemes(): Promise<SitemapTheme[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/design-themes`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return [];
    return json.data as SitemapTheme[];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Sitemap                                                            */
/* ------------------------------------------------------------------ */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/collections`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/custom-order`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Theme / category pages  →  /collections?theme=<slug>
  const themes = await fetchAllThemes();
  const themeEntries: MetadataRoute.Sitemap = themes.map((theme) => ({
    url: `${siteUrl}/collections?theme=${encodeURIComponent(theme.slug)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Product pages  →  /products/<slug>
  const products = await fetchAllProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${encodeURIComponent(product.slug)}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...themeEntries, ...productEntries];
}
