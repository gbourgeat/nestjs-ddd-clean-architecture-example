import { join } from 'path';
import { existsSync } from 'fs';

// Désactiver les logs de la console dans les tests AVANT de charger dotenv
// pour éviter que dotenv n'affiche ses propres logs
if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
  const originalConsole = global.console;
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Conserver error pour les vrais problèmes
    error: originalConsole.error,
  };
}

// Charger les variables d'environnement depuis .env.e2e APRÈS avoir désactivé console.log
import dotenv from 'dotenv';
const envFile = join(__dirname, '../../.env.e2e');
if (existsSync(envFile)) {
  dotenv.config({
    path: envFile,
    override: true,
  });
}
