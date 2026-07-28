import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db';
import { seedDesignThemes } from './designThemes';
import { seedProductTypes } from './productTypes';
import { seedProducts } from './products';
import { Product } from '../models/Product';
import { PromoCode } from '../models/PromoCode';

export async function seedAllData(): Promise<void> {
  await seedProductTypes();
  console.log('✓ Product Types Seeded');

  await seedDesignThemes();
  console.log('✓ Design Themes Seeded');

  await seedProducts();
  console.log('✓ Products Seeded');

  const existingPromo = await PromoCode.findOne({ code: 'CRAFTY10' });
  if (!existingPromo) {
    await PromoCode.create({
      code: 'CRAFTY10',
      discountType: 'percentage',
      discountValue: 10,
      minSubtotal: 0,
      isActive: true,
    });
    console.log('✓ Default Promo Code CRAFTY10 Seeded');
  }
}

export async function autoSeedIfNeeded(): Promise<void> {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('No products found in database. Starting initial seed...');
      await seedAllData();
      console.log('✓ Initial database seeding complete.');
    }
  } catch (error) {
    console.error('Auto seed error:', error);
  }
}

async function initializeDatabase(): Promise<void> {
  try {
    await connectDatabase();
    console.log('✓ Connected');
    await seedAllData();
    console.log('✓ Database Initialization Complete');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  void initializeDatabase().catch((error: unknown) => {
    console.error('Database initialization failed:', error);
    process.exitCode = 1;
  });
}

