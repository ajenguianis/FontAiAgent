// Configuration globale pour les tests
import '@types/jest';

// Mock global pour les tests
global.console = {
  ...console,
  // Supprimer les logs pendant les tests
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configuration des timeouts
jest.setTimeout(10000);

// Mock des variables d'environnement
process.env.NODE_ENV = 'test';