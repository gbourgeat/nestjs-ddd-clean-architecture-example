import { join } from 'path';
import { existsSync } from 'fs';

// Disable console logs in tests BEFORE loading dotenv
// to prevent dotenv from displaying its own logs
if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
  const originalConsole = global.console;
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for real issues
    error: originalConsole.error,
  };
}

// Load environment variables from .env.e2e AFTER disabling console.log
import dotenv from 'dotenv';
const envFile = join(__dirname, '../../.env.e2e');
if (existsSync(envFile)) {
  dotenv.config({
    path: envFile,
    override: true,
  });
}
