import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/db';
import { ensureAdminUser } from './seed/adminUser';

const port = Number(process.env.PORT ?? 5000);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    await ensureAdminUser();
    app.listen(port, () => {
      console.log(`CraftyWrap backend listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start CraftyWrap backend:', error);
    process.exit(1);
  }
}

void startServer();
