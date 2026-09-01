import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/db';
import { ensureAdminUser } from './seed/adminUser';

const port = Number(process.env.PORT ?? 5000);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    await ensureAdminUser();
    app.listen(port, '0.0.0.0', () => {
      console.log(`CraftyWrap backend listening on port ${port} (0.0.0.0)`);
    });
  } catch (error) {
    console.error('Unable to start CraftyWrap backend:', error);
    process.exit(1);
  }
}

void startServer();
