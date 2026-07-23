export interface Product {
  id: string;
  name: string;
  category: 'Animals' | 'Vegetables' | 'Fruits' | 'Flowers' | 'Fantasy' | 'Miniatures';
  yarnType: 'Velvet Chenille' | 'Milk Cotton' | 'Chunky Wool' | 'Organic Bamboo';
  size: 'Mini (4")' | 'Medium (9")' | 'Giant (15")';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  stockCount: number;
  prepTimeDays: number;
  description: string;
  highlights: string[];
  careInstructions: string;
  imageBg: string; // Tailwind color or gradient string
  imageIconName: string; // Friendly representation
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: 'Animals' | 'Vegetables' | 'Fruits' | 'Flowers' | 'Fantasy' | 'Miniatures';
  description: string;
  itemCount: number;
  badgeColor: string;
  bgColor: string;
  icon: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  avatarBg: string;
  userPhoto?: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'animals',
    name: 'Animals',
    description: 'Lovable crocheted critters with hand-embroidered details',
    itemCount: 14,
    badgeColor: 'bg-amber-100 text-amber-800',
    bgColor: 'from-amber-100/70 to-orange-50',
    icon: '🐱',
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Cute garden veggies with friendly smiles and leafy tops',
    itemCount: 9,
    badgeColor: 'bg-emerald-100 text-emerald-800',
    bgColor: 'from-emerald-100/70 to-teal-50',
    icon: '🥕',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    description: 'Sweet plush fruits crafted in bright pastel yarn tones',
    itemCount: 11,
    badgeColor: 'bg-rose-100 text-rose-800',
    bgColor: 'from-rose-100/70 to-peach-100',
    icon: '🍓',
  },
  {
    id: 'flowers',
    name: 'Flowers',
    description: 'Forever-blooming knitted floral plushies and pots',
    itemCount: 8,
    badgeColor: 'bg-pink-100 text-pink-800',
    bgColor: 'from-pink-100/70 to-purple-50',
    icon: '🌸',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Whimsical unicorns, dragons, and magical companions',
    itemCount: 10,
    badgeColor: 'bg-indigo-100 text-indigo-800',
    bgColor: 'from-purple-100/70 to-indigo-50',
    icon: '🦄',
  },
  {
    id: 'miniatures',
    name: 'Miniatures',
    description: 'Pocket-sized charm buddies perfect for keychains & gifts',
    itemCount: 16,
    badgeColor: 'bg-sky-100 text-sky-800',
    bgColor: 'from-sky-100/70 to-blue-50',
    icon: '🐥',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'crafty-cat-whiskers',
    name: 'Whiskers the Calico Kitten',
    category: 'Animals',
    yarnType: 'Velvet Chenille',
    size: 'Medium (9")',
    price: 34.99,
    originalPrice: 42.00,
    rating: 4.9,
    reviewCount: 128,
    isBestSeller: true,
    stockCount: 6,
    prepTimeDays: 2,
    description: 'Whiskers is a cuddly calico kitten handcrafted with plush velvet chenille yarn. Features tiny pink paw pads, embroidered whiskers, and a cozy hand-stitched bell collar.',
    highlights: [
      '100% Ultra-Soft Velvet Chenille Yarn',
      'Safety-locked glass eyes & soft hypoallergenic stuffing',
      'Hand-embroidered facial expression (no hard plastic edges)',
      'Includes custom birth tag & care pouch'
    ],
    careInstructions: 'Spot clean gently with cold water and mild soap. Air dry in natural shade.',
    imageBg: 'from-amber-200 via-orange-100 to-peach-100',
    imageIconName: 'Cat',
  },
  {
    id: 'carrot-carl',
    name: 'Carl the Cheerful Carrot',
    category: 'Vegetables',
    yarnType: 'Milk Cotton',
    size: 'Medium (9")',
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.8,
    reviewCount: 94,
    isBestSeller: true,
    stockCount: 12,
    prepTimeDays: 1,
    description: 'Carl is a vibrant orange carrot with a fluffy green leafy sprout hair. Crafted from durable milk cotton for crisp stitch definition and endless hugs.',
    highlights: [
      'Bright non-fading milk cotton yarn',
      'Flexible green stem leaves',
      'Stuffed with premium recycled polyester fiberfill',
      'Ideal nursery or desk decoration'
    ],
    careInstructions: 'Hand wash in cool water. Reshape while damp.',
    imageBg: 'from-orange-200 via-amber-100 to-yellow-100',
    imageIconName: 'Carrot',
  },
  {
    id: 'sammy-strawberry',
    name: 'Sammy the Sweet Strawberry',
    category: 'Fruits',
    yarnType: 'Velvet Chenille',
    size: 'Mini (4")',
    price: 18.50,
    rating: 5.0,
    reviewCount: 82,
    isBestSeller: true,
    isNew: true,
    stockCount: 3,
    prepTimeDays: 2,
    description: 'Sammy is a pocket-sized strawberry plush with hand-stitched seed speckles and a leafy green crown topper. Ultra plush and squishy!',
    highlights: [
      'Pocket miniature size — fits right in your palm',
      'Hand-embroidered white seeds',
      'Optional keychain loop included upon request',
      'Gift box included'
    ],
    careInstructions: 'Spot clean only.',
    imageBg: 'from-rose-200 via-pink-100 to-red-100',
    imageIconName: 'Strawberry',
  },
  {
    id: 'barnaby-bear',
    name: 'Barnaby Honey Bear',
    category: 'Animals',
    yarnType: 'Chunky Wool',
    size: 'Giant (15")',
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.9,
    reviewCount: 156,
    isBestSeller: true,
    stockCount: 4,
    prepTimeDays: 4,
    description: 'Barnaby is a big, huggable teddy bear crocheted with heavy chunky wool yarn. Dressed in a cute removable knitted scarf.',
    highlights: [
      'Heavy chunky yarn for substantial cuddly weight',
      'Removable knitted plaid scarf',
      'Safety jointed arms and legs',
      'Crafted with 100% natural wool blend'
    ],
    careInstructions: 'Gentle hand wash in wool detergent. Lay flat to dry.',
    imageBg: 'from-amber-300 via-orange-200 to-warmbrown-100',
    imageIconName: 'Bear',
  },
  {
    id: 'sparkle-unicorn',
    name: 'Sparkle Star Unicorn',
    category: 'Fantasy',
    yarnType: 'Velvet Chenille',
    size: 'Medium (9")',
    price: 38.00,
    rating: 4.9,
    reviewCount: 110,
    isNew: true,
    stockCount: 8,
    prepTimeDays: 3,
    description: 'Sparkle features a golden metallic yarn horn, pastel rainbow mane curls, and star embroidery on her hip. Magical dreams guaranteed!',
    highlights: [
      'Shimmering metallic gold horn detail',
      'Individual hand-curled rainbow mane strands',
      'Super soft plush velvet body',
      'Perfect magical keepsake'
    ],
    careInstructions: 'Spot clean gently with damp cloth.',
    imageBg: 'from-purple-200 via-pink-100 to-indigo-100',
    imageIconName: 'Unicorn',
  },
  {
    id: 'sunny-sunflower',
    name: 'Sunny the Pot Sunflower',
    category: 'Flowers',
    yarnType: 'Milk Cotton',
    size: 'Medium (9")',
    price: 29.50,
    originalPrice: 34.00,
    rating: 4.7,
    reviewCount: 64,
    stockCount: 10,
    prepTimeDays: 2,
    description: 'A potted crochet sunflower that never wilts! Sitting in a warm terra-cotta yarn pot with a bright happy smile.',
    highlights: [
      'Weighted base so it stands upright independently',
      '12 handcrafted golden petals',
      'No watering ever needed!',
      'Brightens any workspace or windowsill'
    ],
    careInstructions: 'Dust with soft dry brush.',
    imageBg: 'from-yellow-200 via-amber-100 to-orange-100',
    imageIconName: 'Flower',
  },
  {
    id: 'avocado-alex',
    name: 'Alex the Cozy Avocado',
    category: 'Fruits',
    yarnType: 'Organic Bamboo',
    size: 'Medium (9")',
    price: 27.99,
    rating: 4.8,
    reviewCount: 78,
    stockCount: 7,
    prepTimeDays: 2,
    description: 'Alex has a soft brown plush pit belly, fuzzy green outer skin, and rosy pink cheeks. A fan favorite for foodies and plant lovers.',
    highlights: [
      'Eco-friendly Organic Bamboo Cotton yarn',
      'Extremely smooth skin touch texture',
      'Blush cheek embroidery',
      'Stuffed with recycled hypoallergenic polyfill'
    ],
    careInstructions: 'Machine washable on cold gentle cycle in laundry bag.',
    imageBg: 'from-emerald-200 via-lime-100 to-amber-100',
    imageIconName: 'Avocado',
  },
  {
    id: 'pocket-penguin',
    name: 'Pippin the Pocket Penguin',
    category: 'Miniatures',
    yarnType: 'Milk Cotton',
    size: 'Mini (4")',
    price: 16.99,
    rating: 5.0,
    reviewCount: 91,
    isBestSeller: true,
    stockCount: 15,
    prepTimeDays: 1,
    description: 'Pippin is a tiny chubby penguin wearing a mini yellow winter beanie! Compact enough to accompany you on all your daily adventures.',
    highlights: [
      'Includes tiny removable beanie hat',
      'Keyring loop ready',
      'Extra sturdy tight-gauge crochet weave',
      'Instant mood booster'
    ],
    careInstructions: 'Spot clean only.',
    imageBg: 'from-sky-200 via-blue-100 to-teal-100',
    imageIconName: 'Penguin',
  },
  {
    id: 'broccie-bob',
    name: 'Broccie the Happy Broccoli',
    category: 'Vegetables',
    yarnType: 'Velvet Chenille',
    size: 'Medium (9")',
    price: 26.00,
    rating: 4.6,
    reviewCount: 45,
    stockCount: 9,
    prepTimeDays: 2,
    description: 'Broccie features textured french-knot florets that are delightfully tactile to touch. Makes eating greens fun!',
    highlights: [
      'Textured floret stitches for sensory delight',
      'Soft velvet stalk handle',
      'Embroidered friendly grin',
      'Great gift for chefs and kids'
    ],
    careInstructions: 'Spot clean gently.',
    imageBg: 'from-green-200 via-emerald-100 to-teal-100',
    imageIconName: 'Broccoli',
  },
  {
    id: 'daisy-rose',
    name: 'Rosie the Velvet Rose Pot',
    category: 'Flowers',
    yarnType: 'Velvet Chenille',
    size: 'Medium (9")',
    price: 32.50,
    rating: 4.9,
    reviewCount: 88,
    isNew: true,
    stockCount: 5,
    prepTimeDays: 3,
    description: 'An elegant romantic red velvet rose in a plush cream pot. The perfect anniversary, Valentine, or birthday gift that lasts forever.',
    highlights: [
      'Soft deep-crimson velvet petals',
      'Hand-stitched green stem leaves',
      'Weighted base stays upright',
      'Comes with customizable gift card tag'
    ],
    careInstructions: 'Dust with clean dry cloth.',
    imageBg: 'from-red-200 via-rose-100 to-peach-100',
    imageIconName: 'Rose',
  },
  {
    id: 'puff-dragon',
    name: 'Puff the Baby Mint Dragon',
    category: 'Fantasy',
    yarnType: 'Milk Cotton',
    size: 'Giant (15")',
    price: 54.99,
    originalPrice: 65.00,
    rating: 4.95,
    reviewCount: 142,
    isBestSeller: true,
    stockCount: 3,
    prepTimeDays: 5,
    description: 'Puff is a gentle mint green baby dragon with lilac felt wings, soft belly ridges, and tiny embroidered snout nostrils.',
    highlights: [
      'Intricate multi-part assembly with wings & tail',
      'Giant cuddle size',
      'Pastel color scheme',
      'Collector edition CraftyWrap certificate'
    ],
    careInstructions: 'Hand wash cold with wool wash. Air dry.',
    imageBg: 'from-teal-200 via-emerald-100 to-purple-100',
    imageIconName: 'Dragon',
  },
  {
    id: 'bella-bunny',
    name: 'Bella Lavender Bunny',
    category: 'Animals',
    yarnType: 'Organic Bamboo',
    size: 'Medium (9")',
    price: 31.99,
    rating: 4.85,
    reviewCount: 67,
    isNew: true,
    stockCount: 8,
    prepTimeDays: 2,
    description: 'Bella features extra-long floppy bunny ears lined with floral cotton fabric, and a fluffy pom-pom tail.',
    highlights: [
      'Floppy 7-inch long bunny ears',
      'Fabric ear lining accents',
      'Fluffy handmade yarn pom-pom tail',
      'All-natural organic bamboo yarn'
    ],
    careInstructions: 'Hand wash cool, dry flat.',
    imageBg: 'from-purple-200 via-lavender-100 to-pink-100',
    imageIconName: 'Bunny',
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Emily R.',
    rating: 5,
    date: '2 days ago',
    comment: 'The quality of Whiskers is unreal! The velvet yarn is unbelievably soft and the stitching is immaculate. Arrived beautifully wrapped with a personalized note.',
    verified: true,
    avatarBg: 'bg-peach-300 text-warmbrown-800',
  },
  {
    id: 'rev-2',
    author: 'David K.',
    rating: 5,
    date: '1 week ago',
    comment: 'Ordered Carl the Carrot as a desk buddy for my partner. She absolutely adores it! Very well packaged and shipped fast.',
    verified: true,
    avatarBg: 'bg-emerald-200 text-emerald-900',
  },
  {
    id: 'rev-3',
    author: 'Sophia M.',
    rating: 4.5,
    date: '2 weeks ago',
    comment: 'Custom requested a purple dragon for my daughter’s birthday. The team was so responsive on Instagram and brought the idea to life perfectly!',
    verified: true,
    avatarBg: 'bg-purple-200 text-purple-900',
  }
];

export const FAQS = [
  {
    question: 'How long does a handmade doll take to prepare?',
    answer: 'Standard dolls in stock ship within 1-2 business days. Custom or made-to-order dolls take between 3-5 business days to carefully crochet, stuff, and assemble before dispatch.'
  },
  {
    question: 'Can I request a custom color or design?',
    answer: 'Yes! We love custom requests. Use our "Custom Order" page to describe your dream doll or send us reference photos. You can also chat directly with us on Instagram or WhatsApp to finalize details.'
  },
  {
    question: 'Are the dolls safe for small children?',
    answer: 'All our dolls feature safety-locked washers for eyes and hand-embroidered details. For infants, we also offer 100% embroidered baby-safe versions with no plastic elements.'
  },
  {
    question: 'How should I clean and care for my yarn doll?',
    answer: 'We recommend gentle spot cleaning with cold water and mild soap. For full washes, place the doll in a mesh laundry bag, wash on gentle cold cycle, and lay flat in shade to dry.'
  }
];
