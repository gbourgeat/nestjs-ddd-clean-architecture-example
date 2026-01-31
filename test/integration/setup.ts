// Setup file for integration tests
// This ensures the correct environment variables are set before tests run

process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '54322';
process.env.DATABASE_USER = 'postgres';
process.env.DATABASE_PASSWORD = 'postgres';
process.env.DATABASE_NAME = 'route_solver_integration_test';
process.env.NODE_ENV = 'test';

// Désactiver les logs de la console dans les tests pour réduire le bruit
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
