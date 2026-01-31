import dotenv from 'dotenv';
import { join } from 'path';

// Charger les variables d'environnement depuis .env.e2e
dotenv.config({
  path: join(__dirname, '../../.env.e2e'),
  override: true,
});
