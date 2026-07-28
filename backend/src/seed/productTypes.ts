import { ProductType } from '../models/ProductType';

const productTypes = [
  { name: 'Keychains', slug: 'keychains', icon: '🔑', displayOrder: 1 },
  { name: 'Towel Hanging', slug: 'towel-hanging', icon: '🧺', displayOrder: 2 },
  { name: 'Hand Bags', slug: 'hand-bags', icon: '👜', displayOrder: 3 },
  { name: 'Door Screens', slug: 'door-screens', icon: '🚪', displayOrder: 4 },
  { name: 'Bag Charms', slug: 'bag-charms', icon: '🎒', displayOrder: 5 },
  { name: 'Dolls', slug: 'dolls', icon: '🧸', displayOrder: 6 },
  { name: 'Mats', slug: 'mats', icon: '🧶', displayOrder: 7 },
  { name: 'Pencil Stands', slug: 'pencil-stands', icon: '✏️', displayOrder: 8 },
  { name: 'Wall Hanging', slug: 'wall-hanging', icon: '🖼️', displayOrder: 9 },
  { name: 'Caps', slug: 'caps', icon: '🧢', displayOrder: 10 },
  { name: 'Bouquets', slug: 'bouquets', icon: '💐', displayOrder: 11 },
  { name: 'Head Clips', slug: 'head-clips', icon: '🎀', displayOrder: 12 },
  { name: 'Flower Pots', slug: 'flower-pots', icon: '🪴', displayOrder: 13 },
  { name: 'Coasters', slug: 'coasters', icon: '☕', displayOrder: 14 },
  { name: 'Hair Bands', slug: 'hair-bands', icon: '👑', displayOrder: 15 },
  { name: 'Pencil Toppers', slug: 'pencil-toppers', icon: '🎨', displayOrder: 16 },
] as const;

export async function seedProductTypes(): Promise<void> {
  await Promise.all(
    productTypes.map((productType) =>
      ProductType.findOneAndUpdate(
        { slug: productType.slug },
        { $set: productType },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      ),
    ),
  );
}
