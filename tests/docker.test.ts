import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

describe('Docker Infrastructure', () => {
  const rootDir = resolve(__dirname, '..');

  describe('Docker Configuration Files', () => {
    it('should have Dockerfile', () => {
      const dockerfilePath = resolve(rootDir, 'Dockerfile');
      expect(existsSync(dockerfilePath)).toBe(true);

      const content = readFileSync(dockerfilePath, 'utf-8');
      expect(content).toContain('FROM node:24-alpine');
      expect(content).toContain('pnpm');
      expect(content).toContain('botuser');
      expect(content).toContain('/data');
    });

    it('should have docker-compose.yml', () => {
      const composePath = resolve(rootDir, 'docker-compose.yml');
      expect(existsSync(composePath)).toBe(true);

      const content = readFileSync(composePath, 'utf-8');
      expect(content).toContain('version:');
      expect(content).toContain('services:');
      expect(content).toContain('bot:');
      expect(content).toContain('volumes:');
      expect(content).toContain('bot-data');
    });

    it('should have .dockerignore', () => {
      const dockerignorePath = resolve(rootDir, '.dockerignore');
      expect(existsSync(dockerignorePath)).toBe(true);

      const content = readFileSync(dockerignorePath, 'utf-8');
      expect(content).toContain('node_modules');
      expect(content).toContain('.git');
      expect(content).toContain('dist');
    });

    it('should have .env.example', () => {
      const envExamplePath = resolve(rootDir, '.env.example');
      expect(existsSync(envExamplePath)).toBe(true);

      const content = readFileSync(envExamplePath, 'utf-8');
      expect(content).toContain('STEAM_USERNAME');
      expect(content).toContain('STEAM_PASSWORD');
      expect(content).toContain('STEAM_SHARED_SECRET');
      expect(content).toContain('STEAM_API_KEY');
      expect(content).toContain('NODE_ENV');
      expect(content).toContain('LOG_LEVEL');
    });
  });

  describe('Docker Configuration Validation', () => {
    it('Dockerfile should use Node.js 24 Alpine', () => {
      const dockerfilePath = resolve(rootDir, 'Dockerfile');
      const content = readFileSync(dockerfilePath, 'utf-8');
      expect(content).toMatch(/FROM node:24-alpine/);
    });

    it('Dockerfile should configure non-root user', () => {
      const dockerfilePath = resolve(rootDir, 'Dockerfile');
      const content = readFileSync(dockerfilePath, 'utf-8');
      expect(content).toContain('addgroup');
      expect(content).toContain('adduser');
      expect(content).toContain('USER botuser');
    });

    it('docker-compose.yml should configure persistent volume', () => {
      const composePath = resolve(rootDir, 'docker-compose.yml');
      const content = readFileSync(composePath, 'utf-8');
      expect(content).toContain('bot-data:/data');
      expect(content).toContain('volumes:');
    });

    it('docker-compose.yml should configure hot-reload mounts', () => {
      const composePath = resolve(rootDir, 'docker-compose.yml');
      const content = readFileSync(composePath, 'utf-8');
      expect(content).toContain('./src:/app/src');
      expect(content).toContain('./tests:/app/tests');
    });

    it('docker-compose.yml should load environment from .env', () => {
      const composePath = resolve(rootDir, 'docker-compose.yml');
      const content = readFileSync(composePath, 'utf-8');
      expect(content).toContain('env_file:');
      expect(content).toContain('.env');
    });

    it('.env.example should have all required Steam variables', () => {
      const envExamplePath = resolve(rootDir, '.env.example');
      const content = readFileSync(envExamplePath, 'utf-8');

      const requiredVars = [
        'STEAM_USERNAME',
        'STEAM_PASSWORD',
        'STEAM_SHARED_SECRET',
        'STEAM_API_KEY',
      ];

      requiredVars.forEach((varName) => {
        expect(content).toContain(varName);
      });
    });
  });

  describe('Security Configuration', () => {
    it('should exclude .env from Docker build context', () => {
      const dockerignorePath = resolve(rootDir, '.dockerignore');
      const content = readFileSync(dockerignorePath, 'utf-8');
      expect(content).toContain('.env');
    });

    it('should not commit .env to git', () => {
      const gitignorePath = resolve(rootDir, '.gitignore');
      const content = readFileSync(gitignorePath, 'utf-8');
      expect(content).toContain('.env');
    });
  });
});
