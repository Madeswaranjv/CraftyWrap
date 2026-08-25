export interface CatalogProduct {
  id: string;
  databaseId: string;
  slug: string;
  name: string;
  productType: string;
  designTheme: string;
  category: string;
  yarnType: string;
  size: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isNew: boolean;
  stockCount: number;
  prepTimeDays: number;
  description: string;
  highlights: string[];
  careInstructions?: string;
  images: string[];
  isActive: boolean;
  imageBg: string;
  imageIconName: string;
}

export interface CatalogTheme {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  itemCount: number;
  badgeColor: string;
  bgColor: string;
}

export interface CatalogProductType {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  displayOrder: number;
}

const productPresentation: Record<string, { imageBg: string; imageIconName: string }> = {
  'crafty-cat-whiskers': { imageBg: 'from-amber-200 via-orange-100 to-peach-100', imageIconName: 'Cat' },
  'carrot-carl': { imageBg: 'from-orange-200 via-amber-100 to-yellow-100', imageIconName: 'Carrot' },
  'sammy-strawberry': { imageBg: 'from-rose-200 via-pink-100 to-red-100', imageIconName: 'Strawberry' },
  'barnaby-bear': { imageBg: 'from-amber-300 via-orange-200 to-peach-100', imageIconName: 'Bear' },
  'sparkle-unicorn': { imageBg: 'from-purple-200 via-pink-100 to-indigo-100', imageIconName: 'Unicorn' },
  'sunny-sunflower': { imageBg: 'from-yellow-200 via-amber-100 to-orange-100', imageIconName: 'Flower' },
  'avocado-alex': { imageBg: 'from-emerald-200 via-lime-100 to-amber-100', imageIconName: 'Avocado' },
  'pocket-penguin': { imageBg: 'from-sky-200 via-blue-100 to-teal-100', imageIconName: 'Penguin' },
  'broccie-bob': { imageBg: 'from-green-200 via-emerald-100 to-teal-100', imageIconName: 'Broccoli' },
  'daisy-rose': { imageBg: 'from-red-200 via-rose-100 to-peach-100', imageIconName: 'Rose' },
  'puff-dragon': { imageBg: 'from-teal-200 via-emerald-100 to-purple-100', imageIconName: 'Dragon' },
  'bella-bunny': { imageBg: 'from-purple-200 via-pink-100 to-peach-100', imageIconName: 'Bunny' },
  'buzzy-bee-keychain': { imageBg: 'from-yellow-300 via-amber-200 to-amber-100', imageIconName: 'Bee' },
  'octopus-towel-hanger': { imageBg: 'from-sky-200 via-blue-100 to-indigo-100', imageIconName: 'Octopus' },
  'daisy-tote-bag': { imageBg: 'from-amber-100 via-peach-100 to-yellow-50', imageIconName: 'ToteBag' },
  'crochet-sunflower-handbag': { imageBg: 'from-amber-100 via-peach-100 to-yellow-50', imageIconName: 'ToteBag' },
  'sunflower-door-screen': { imageBg: 'from-yellow-200 via-amber-100 to-orange-100', imageIconName: 'DoorScreen' },
  'cherry-bag-charm': { imageBg: 'from-red-200 via-rose-100 to-pink-100', imageIconName: 'Cherry' },
  'frog-mug-mat': { imageBg: 'from-emerald-200 via-green-100 to-lime-100', imageIconName: 'Frog' },
  'cactus-pencil-stand': { imageBg: 'from-teal-200 via-emerald-100 to-green-100', imageIconName: 'Cactus' },
  'butterfly-wall-hanging': { imageBg: 'from-amber-200 via-orange-100 to-peach-100', imageIconName: 'Butterfly' },
  'bear-beanie-cap': { imageBg: 'from-amber-200 via-orange-100 to-peach-100', imageIconName: 'BearCap' },
  'pastel-rose-bouquet': { imageBg: 'from-pink-200 via-rose-100 to-purple-100', imageIconName: 'Bouquet' },
  'ladybug-head-clip': { imageBg: 'from-red-200 via-rose-100 to-amber-100', imageIconName: 'Ladybug' },
  'lemon-coasters-set': { imageBg: 'from-yellow-200 via-amber-100 to-lime-100', imageIconName: 'Lemon' },
  'tulip-hair-band': { imageBg: 'from-pink-100 via-purple-100 to-peach-100', imageIconName: 'Tulip' },
  'toadstool-pencil-toppers': { imageBg: 'from-red-100 via-rose-100 to-amber-100', imageIconName: 'Mushroom' },
};

const fallbackPresentation = { imageBg: 'from-peach-100 via-amber-100 to-rose-100', imageIconName: 'Yarn' };
const themeColors = ['bg-emerald-100 text-emerald-800', 'bg-rose-100 text-rose-800', 'bg-sky-100 text-sky-800', 'bg-amber-100 text-amber-800', 'bg-orange-100 text-orange-800', 'bg-yellow-100 text-yellow-800', 'bg-pink-100 text-pink-800', 'bg-indigo-100 text-indigo-800', 'bg-teal-100 text-teal-800'];

export function formatSizeToCm(size: string): string {
  if (!size) return '';
  return size.replace(/(\d+)\s*(?:"|'|in|inch|inches)/gi, (_, inches) => {
    const cm = Math.round(Number(inches) * 2.54);
    return `${cm} cm`;
  });
}

export function toCatalogProduct(data: Omit<CatalogProduct, 'category' | 'imageBg' | 'imageIconName'> & { _id?: string }): CatalogProduct {
  const presentation = productPresentation[data.slug] ?? fallbackPresentation;
  return {
    ...data,
    databaseId: data.databaseId ?? data._id ?? '',
    id: data.id ?? data.slug,
    category: data.designTheme,
    size: formatSizeToCm(data.size),
    imageBg: presentation.imageBg,
    imageIconName: presentation.imageIconName,
  };
}

export function toCatalogTheme(data: Omit<CatalogTheme, 'id' | 'badgeColor' | 'bgColor'>, index: number): CatalogTheme {
  return { ...data, id: data.slug, badgeColor: themeColors[index % themeColors.length], bgColor: 'from-peach-100/70 to-peach-50' };
}
