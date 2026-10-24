import type { Metadata } from 'next';
import { getApiBaseUrl } from '@/lib/api';
import { CatalogProduct, toCatalogProduct } from '@/lib/catalog';
import ProductDetailClient from './ProductDetailClient';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Base URL for canonical links (www / non-www controlled via env). */
function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://craftywrap.com';
  return url.replace(/\/+$/, '');
}

/** Strip markdown-style bold (**), italic (*_), links, etc. and trim to ~200 chars. */
function stripMarkdown(text: string, maxLen = 200): string {
  const plain = text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')        // *italic*
    .replace(/__(.+?)__/g, '$1')        // __bold__
    .replace(/_(.+?)_/g, '$1')          // _italic_
    .replace(/~~(.+?)~~/g, '$1')        // ~~strike~~
    .replace(/`(.+?)`/g, '$1')          // `code`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url)
    .replace(/[#>|~`]/g, '')            // leftover markdown symbols
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

/** Fetch a product by slug from the backend (server-side, no auth needed). */
async function fetchProduct(slug: string): Promise<CatalogProduct | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },           // ISR: re-fetch at most every 60 s
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json.data) return null;
    return toCatalogProduct(json.data);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  generateMetadata  –  OG + Pinterest Rich Pin (Product) tags        */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return { title: 'Product Not Found — CraftyWrap' };
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/products/${encodeURIComponent(product.slug)}`;
  const description = stripMarkdown(product.description);

  // First publicly-accessible image (Cloudflare URL)
  const ogImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : undefined;

  // Build the `other` bag for product:* and og:availability
  const other: Record<string, string> = {
    'p:domain_verify': 'f6536c48c264f75f8d9eed7a6840c400',
  };

  if (product.price != null && product.price > 0) {
    other['product:price:amount'] = product.price.toFixed(2);
    other['product:price:currency'] = 'INR';
  }

  other['og:availability'] =
    product.stockCount > 0 ? 'instock' : 'out of stock';

  return {
    title: `${product.name} — CraftyWrap`,
    description,
    openGraph: {
      type: 'website',                     // Next.js typing; the `other` field overrides og:type below
      title: product.name,
      description,
      url: productUrl,
      siteName: 'CraftyWrap',
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: product.name,
              },
            ],
          }
        : {}),
    },
    other: {
      ...other,
      'og:type': 'og:product',             // override the OG type to product for Pinterest
    },
  };
}

/* ------------------------------------------------------------------ */
/*  JSON-LD  –  schema.org/Product (for Google Rich Results)           */
/* ------------------------------------------------------------------ */

function buildJsonLd(product: CatalogProduct, siteUrl: string) {
  const productUrl = `${siteUrl}/products/${encodeURIComponent(product.slug)}`;
  const description = stripMarkdown(product.description);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'CraftyWrap',
    },
    url: productUrl,
  };

  // Image
  if (product.images && product.images.length > 0) {
    schema.image = product.images;
  }

  // Offers
  if (product.price != null && product.price > 0) {
    schema.offers = {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'INR',
      availability:
        product.stockCount > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: productUrl,
    };
  }

  return schema;
}

/* ------------------------------------------------------------------ */
/*  Page Component (Server)                                            */
/* ------------------------------------------------------------------ */

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const product = await fetchProduct(slug);
  const siteUrl = getSiteUrl();

  return (
    <>
      {/* JSON-LD structured data for Google */}
      {product && product.price > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(product, siteUrl)),
          }}
        />
      )}

      {/* Original client-side interactive UI (unchanged) */}
      <ProductDetailClient />
    </>
  );
}
