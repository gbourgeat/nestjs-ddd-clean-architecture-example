import dotenv from 'dotenv';
import { join } from 'path';

// Charger les variables d'environnement depuis .env.e2e
dotenv.config({
  path: join(__dirname, '../../.env.e2e'),
  override: true,
  silent: true, // Éviter les warnings dans les logs de la CI
});

// Désactiver les logs de la console dans les tests pour réduire le bruit
if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Conserver error pour les vrais problèmes
  };
}
