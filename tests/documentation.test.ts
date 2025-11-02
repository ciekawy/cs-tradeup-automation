/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Documentation Files', () => {
  const rootDir = join(__dirname, '..');

  describe('README.md', () => {
    it('should exist', () => {
      const readmePath = join(rootDir, 'README.md');
      expect(existsSync(readmePath)).toBe(true);
    });

    it('should contain project title', () => {
      const readmePath = join(rootDir, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('CS2 Trade-Up Educational Bot');
    });

    it('should contain Steam ToS warning', () => {
      const readmePath = join(rootDir, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('Steam Terms of Service');
      expect(content).toContain('violates');
    });

    it('should contain prerequisites section', () => {
      const readmePath = join(rootDir, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('Prerequisites');
      expect(content).toContain('Node.js');
      expect(content).toContain('pnpm');
      expect(content).toContain('Docker');
    });

    it('should contain quick start section', () => {
      const readmePath = join(rootDir, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('Quick Start');
      expect(content).toContain('pnpm install');
    });

    it('should contain Docker usage instructions', () => {
      const readmePath = join(rootDir, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('Docker Usage');
      expect(content).toContain('docker-compose');
    });

    it('should contain testing instructions', () => {
      const readmePath = join(rootDir, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('Testing');
      expect(content).toContain('pnpm test');
    });

    it('should contain project structure', () => {
      const readmePath = join(rootDir, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('Project Structure');
    });
  });

  describe('CONTRIBUTING.md', () => {
    it('should exist', () => {
      const contributingPath = join(rootDir, 'CONTRIBUTING.md');
      expect(existsSync(contributingPath)).toBe(true);
    });

    it('should contain development workflow', () => {
      const contributingPath = join(rootDir, 'CONTRIBUTING.md');
      const content = readFileSync(contributingPath, 'utf-8');
      expect(content).toContain('Development Workflow');
    });

    it('should contain code style guidelines', () => {
      const contributingPath = join(rootDir, 'CONTRIBUTING.md');
      const content = readFileSync(contributingPath, 'utf-8');
      expect(content).toContain('Code Style Guidelines');
      expect(content).toContain('TypeScript');
      expect(content).toContain('ESLint');
      expect(content).toContain('Prettier');
    });

    it('should contain testing requirements', () => {
      const contributingPath = join(rootDir, 'CONTRIBUTING.md');
      const content = readFileSync(contributingPath, 'utf-8');
      expect(content).toContain('Testing Requirements');
      expect(content).toContain('coverage');
    });

    it('should contain commit message format', () => {
      const contributingPath = join(rootDir, 'CONTRIBUTING.md');
      const content = readFileSync(contributingPath, 'utf-8');
      expect(content).toContain('Commit Message Format');
      expect(content).toContain('Conventional Commits');
    });

    it('should contain PR process', () => {
      const contributingPath = join(rootDir, 'CONTRIBUTING.md');
      const content = readFileSync(contributingPath, 'utf-8');
      expect(content).toContain('Pull Request Process');
    });

    it('should contain Steam ban mitigation reminders', () => {
      const contributingPath = join(rootDir, 'CONTRIBUTING.md');
      const content = readFileSync(contributingPath, 'utf-8');
      expect(content).toContain('Steam Ban Mitigation');
      expect(content).toContain('Human-Paced');
      expect(content).toContain('Volume Limits');
    });
  });

  describe('.vscode/settings.json', () => {
    it('should exist', () => {
      const settingsPath = join(rootDir, '.vscode', 'settings.json');
      expect(existsSync(settingsPath)).toBe(true);
    });

    it('should enable format on save', () => {
      const settingsPath = join(rootDir, '.vscode', 'settings.json');
      const content = readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);
      expect(settings['editor.formatOnSave']).toBe(true);
    });

    it('should configure ESLint auto-fix', () => {
      const settingsPath = join(rootDir, '.vscode', 'settings.json');
      const content = readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);
      expect(settings['editor.codeActionsOnSave']).toBeDefined();
      expect(settings['editor.codeActionsOnSave']['source.fixAll.eslint']).toBe('explicit');
    });

    it('should set Prettier as default formatter', () => {
      const settingsPath = join(rootDir, '.vscode', 'settings.json');
      const content = readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);
      expect(settings['editor.defaultFormatter']).toBe('esbenp.prettier-vscode');
    });

    it('should configure TypeScript', () => {
      const settingsPath = join(rootDir, '.vscode', 'settings.json');
      const content = readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);
      expect(settings['typescript.tsdk']).toBe('node_modules/typescript/lib');
    });
  });

  describe('Git Hooks', () => {
    it('should have .husky directory', () => {
      const huskyPath = join(rootDir, '.husky');
      expect(existsSync(huskyPath)).toBe(true);
    });

    it('should have pre-commit hook', () => {
      const preCommitPath = join(rootDir, '.husky', 'pre-commit');
      expect(existsSync(preCommitPath)).toBe(true);
    });

    it('pre-commit hook should run lint and test', () => {
      const preCommitPath = join(rootDir, '.husky', 'pre-commit');
      const content = readFileSync(preCommitPath, 'utf-8');
      expect(content).toContain('pnpm lint');
      expect(content).toContain('pnpm test');
    });
  });

  describe('package.json scripts', () => {
    it('should have dev script', () => {
      const packagePath = join(rootDir, 'package.json');
      const content = readFileSync(packagePath, 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.scripts.dev).toBeDefined();
    });

    it('should have start script', () => {
      const packagePath = join(rootDir, 'package.json');
      const content = readFileSync(packagePath, 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.scripts.start).toBeDefined();
      expect(pkg.scripts.start).toContain('node dist/index.js');
    });

    it('should have docker scripts', () => {
      const packagePath = join(rootDir, 'package.json');
      const content = readFileSync(packagePath, 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.scripts['docker:build']).toBeDefined();
      expect(pkg.scripts['docker:up']).toBeDefined();
      expect(pkg.scripts['docker:down']).toBeDefined();
    });

    it('should have husky prepare script', () => {
      const packagePath = join(rootDir, 'package.json');
      const content = readFileSync(packagePath, 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.scripts.prepare).toBeDefined();
      expect(pkg.scripts.prepare).toContain('husky');
    });
  });

  describe('Component SPEC', () => {
    it('src/infrastructure/SPEC.md should exist', () => {
      const specPath = join(rootDir, 'src', 'infrastructure', 'SPEC.md');
      expect(existsSync(specPath)).toBe(true);
    });

    it('should have change log entry for TASK-003', () => {
      const specPath = join(rootDir, 'src', 'infrastructure', 'SPEC.md');
      const content = readFileSync(specPath, 'utf-8');
      expect(content).toContain('TASK-003');
      expect(content).toContain('Development Tooling');
    });

    it('should document development tooling', () => {
      const specPath = join(rootDir, 'src', 'infrastructure', 'SPEC.md');
      const content = readFileSync(specPath, 'utf-8');
      expect(content).toContain('Git Hooks (Husky)');
      expect(content).toContain('VS Code Configuration');
      expect(content).toContain('Documentation');
    });
  });
});
