import { DesignTheme } from '../models/DesignTheme';

const designThemes = [
  {
    name: 'Vegetables',
    slug: 'vegetables',
    description: 'Cute garden veggies with friendly smiles and leafy tops',
    icon: '🥕',
    displayOrder: 1,
  },
  {
    name: 'Fruits',
    slug: 'fruits',
    description: 'Sweet plush fruits crafted in bright pastel yarn tones',
    icon: '🍓',
    displayOrder: 2,
  },
  {
    name: 'Aquatic Animals',
    slug: 'aquatic-animals',
    description: 'Ocean critters, sea turtles, penguins, and whales',
    icon: '🐙',
    displayOrder: 3,
  },
  {
    name: 'Wild Animals',
    slug: 'wild-animals',
    description: 'Forest bears, foxes, lions, and woodland creatures',
    icon: '🦊',
    displayOrder: 4,
  },
  {
    name: 'Domestic Animals',
    slug: 'domestic-animals',
    description: 'Playful kittens, puppies, bunnies, and home pets',
    icon: '🐱',
    displayOrder: 5,
  },
  {
    name: 'Insects',
    slug: 'insects',
    description: 'Busy honeybees, butterflies, and cute ladybugs',
    icon: '🐝',
    displayOrder: 6,
  },
  {
    name: 'Flowers',
    slug: 'flowers',
    description: 'Forever-blooming knitted floral plushies, pots, and bouquets',
    icon: '🌸',
    displayOrder: 7,
  },
  {
    name: 'Fantasy',
    slug: 'fantasy',
    description: 'Whimsical unicorns, dragons, and magical companions',
    icon: '🦄',
    displayOrder: 8,
  },
  {
    name: 'Miniatures',
    slug: 'miniatures',
    description: 'Pocket-sized charm buddies perfect for keychains & gifts',
    icon: '🐥',
    displayOrder: 9,
  },
] as const;

export async function seedDesignThemes(): Promise<void> {
  await Promise.all(
    designThemes.map((designTheme) =>
      DesignTheme.findOneAndUpdate(
        { slug: designTheme.slug },
        { $set: designTheme },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      ),
    ),
  );
}
