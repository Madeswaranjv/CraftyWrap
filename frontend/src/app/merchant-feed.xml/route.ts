import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Production base URL from env. */
function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://craftywrap.com';
  return url.replace(/\/+$/, '');
}

/** Escape XML special characters. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Strip markdown formatting, emojis, and trim to maxLen. */
function stripMarkdownAndEmojis(text: string, maxLen = 5000): string {
  const plain = text
    .replace(/\*\*(.+?)\*\*/g, '$1')       // **bold**
    .replace(/\*(.+?)\*/g, '$1')            // *italic*
    .replace(/__(.+?)__/g, '$1')            // __bold__
    .replace(/_(.+?)_/g, '$1')              // _italic_
    .replace(/~~(.+?)~~/g, '$1')            // ~~strike~~
    .replace(/`(.+?)`/g, '$1')              // `code`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url)
    .replace(/[#>|~`]/g, '')                // leftover markdown symbols
    // Strip emojis (surrogate pairs and common symbol blocks)
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF\uFE00-\uFE0F\u200D\u20E3]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, '');
}

/**
 * Map the product's `productType` field to a Google product category.
 * Falls back to the generic Toys category for dolls.
 */
function getGoogleProductCategory(productType: string): string {
  const lower = productType.toLowerCase();

  if (lower.includes('keychain') || lower.includes('charm') || lower.includes('clip')) {
    return 'Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases &gt; Keychains';
  }
  if (
    lower.includes('decor') ||
    lower.includes('hanger') ||
    lower.includes('coaster') ||
    lower.includes('wall') ||
    lower.includes('door') ||
    lower.includes('mat') ||
    lower.includes('stand') ||
    lower.includes('screen')
  ) {
    return 'Home &amp; Garden &gt; Decor';
  }
  if (lower.includes('bag') || lower.includes('tote') || lower.includes('handbag')) {
    return 'Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases';
  }
  if (lower.includes('cap') || lower.includes('beanie') || lower.includes('band') || lower.includes('hair')) {
    return 'Apparel &amp; Accessories &gt; Clothing Accessories &gt; Hair Accessories';
  }
  if (lower.includes('bouquet') || lower.includes('flower')) {
    return 'Home &amp; Garden &gt; Decor &gt; Artificial Flora';
  }

  // Default: dolls / plush / yarn toys
  return 'Toys &amp; Games &gt; Toys &gt; Dolls, Playsets &amp; Toy Figures';
}

/* ------------------------------------------------------------------ */
/*  Minimal product shape from the API                                 */
/* ------------------------------------------------------------------ */

interface FeedProduct {
  slug: string;
  name: string;
  productType: string;
  designTheme: string;
  price: number;
  originalPrice?: number;
  stockCount: number;
  description: string;
  images: string[];
}

/** Fetch all active products from the backend. */
async function fetchAllProducts(): Promise<FeedProduct[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data?.products)) return [];
    return json.data.products as FeedProduct[];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Route Handler – GET /merchant-feed.xml                             */
/* ------------------------------------------------------------------ */

export const revalidate = 3600; // ISR: regenerate at most every hour

export async function GET() {
  const siteUrl = getSiteUrl();
  const products = await fetchAllProducts();

  // Build <item> entries — skip products with no image or no price
  const items = products
    .filter((p) => p.images?.length > 0 && p.price > 0)
    .map((product) => {
      const title = escapeXml(product.name.slice(0, 150));
      const description = escapeXml(stripMarkdownAndEmojis(product.description));
      const link = `${siteUrl}/products/${encodeURIComponent(product.slug)}`;
      const imageLink = escapeXml(product.images[0]);
      const additionalImages = product.images
        .slice(1, 11) // up to 10 additional images
        .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join('\n');
      const price = `${product.price.toFixed(2)} INR`;
      const availability = product.stockCount > 0 ? 'in_stock' : 'out_of_stock';
      const productTypeLabel = product.productType || product.designTheme || 'Handmade';
      const googleCategory = getGoogleProductCategory(product.productType || product.designTheme || '');

      return `    <item>
      <g:id>${escapeXml(product.slug)}</g:id>
      <title>${title}</title>
      <description><![CDATA[${stripMarkdownAndEmojis(product.description)}]]></description>
      <link>${link}</link>
      <g:image_link>${imageLink}</g:image_link>
${additionalImages ? additionalImages + '\n' : ''}      <g:price>${price}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>CraftyWrap</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${escapeXml(productTypeLabel)}</g:product_type>
      <g:google_product_category>${googleCategory}</g:google_product_category>
    </item>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CraftyWrap</title>
    <link>${siteUrl}</link>
    <description>Handcrafted yarn dolls, accessories, and home décor — made with love by CraftyWrap.</description>
${items.join('\n')}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
