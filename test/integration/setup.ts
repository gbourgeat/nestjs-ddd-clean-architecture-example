// Setup file for integration tests
// This ensures the correct environment variables are set before tests run

process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '54322';
process.env.DATABASE_USER = 'postgres';
process.env.DATABASE_PASSWORD = 'postgres';
process.env.DATABASE_NAME = 'route_solver_integration_test';
process.env.NODE_ENV = 'test';
