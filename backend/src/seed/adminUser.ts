import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export async function ensureAdminUser(): Promise<void> {
  try {
    const email = 'madeswaranjv@gmail.com';
    const password = 'Mades@2006';
    const passwordHash = await bcrypt.hash(password, 12);

    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          name: 'Admin Madeswaran',
          email: email.toLowerCase(),
          passwordHash,
          role: 'admin',
        },
      },
      { upsert: true, new: true }
    );
    console.log('✓ Admin user madeswaranjv@gmail.com initialized/updated successfully');
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}
