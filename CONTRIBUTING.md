# Contributing to CS2 Trade-Up Educational Bot

Thank you for your interest in contributing to this educational project! This guide will help you understand our development workflow, code standards, and contribution process.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Component SPEC Guidelines](#component-spec-guidelines)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Steam Ban Mitigation Reminders](#steam-ban-mitigation-reminders)

## Code of Conduct

This project is an educational research tool exploring CS2 trade-up automation. Contributors should:

- **Maintain educational focus**: All contributions should serve learning and research purposes
- **Document risks clearly**: Always include Steam ToS violation warnings and risk disclosures
- **Prioritize safety**: Implement human-pacing delays and volume limits to minimize detection risk
- **Be respectful**: Collaborate professionally and support fellow contributors

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: Version 22 or 24
- **pnpm**: Version 8 or higher
- **Docker**: Latest version with docker-compose
- **Git**: Latest version

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/cs-tradeup-automation.git
cd cs-tradeup-automation

# Add upstream remote
git remote add upstream https://github.com/ciekawy/cs-tradeup-automation.git
```

### Install Dependencies

```bash
pnpm install
```

### Verify Setup

```bash
# Run tests to verify your environment
pnpm test

# Run linting
pnpm lint

# Build TypeScript
pnpm build
```

## Development Workflow

### Branch Strategy

We follow a feature branch workflow:

1. **main**: Stable production-ready code
2. **feat/***: New features (e.g., `feat/ev-calculator`)
3. **fix/***: Bug fixes (e.g., `fix/session-timeout`)
4. **docs/***: Documentation updates (e.g., `docs/api-reference`)
5. **refactor/***: Code refactoring (e.g., `refactor/auth-module`)
6. **test/***: Test improvements (e.g., `test/integration-suite`)

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feat/your-feature-name
```

### Making Changes

1. **Write code** following our style guidelines (see below)
2. **Write tests** for all new functionality (>80% coverage required)
3. **Run tests** to ensure nothing breaks: `pnpm test`
4. **Run linting** and fix issues: `pnpm lint:fix`
5. **Update documentation** if needed (README.md, Component SPECs)

### Running Development Server

```bash
# Start development mode with watch
pnpm dev

# Or run in Docker with hot-reload
docker-compose up
```

## Code Style Guidelines

### TypeScript Standards

- **Strict mode**: Always enabled
- **Type annotations**: Prefer explicit types over `any`
- **Interface over Type**: Use `interface` for object shapes, `type` for unions/intersections
- **Naming conventions**:
  - Classes: `PascalCase` (e.g., `TradeUpService`)
  - Functions: `camelCase` (e.g., `calculateEV`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_DAILY_CRAFTS`)
  - Private members: Prefix with `_` (e.g., `_sessionToken`)

### ESLint Configuration

We use `@typescript-eslint` with Prettier integration:

```bash
# Check for linting errors
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

### Prettier Configuration

Code formatting is enforced via Prettier:

- **Quotes**: Single quotes preferred
- **Line width**: 100 characters
- **Semicolons**: Required
- **Trailing commas**: ES5 standard

```bash
# Format all files
pnpm format

# Check formatting without modifying
pnpm format:check
```

### Code Organization

```typescript
// 1. Imports (external, then internal)
import { EventEmitter } from 'events';
import SteamUser from 'steam-user';

import { Config } from './config';
import { Logger } from './logger';

// 2. Type definitions
interface TradeUpInput {
  assetIds: string[];
  expectedValue: number;
}

// 3. Constants
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// 4. Class/function implementation
export class TradeUpService extends EventEmitter {
  private _client: SteamUser;
  private _logger: Logger;

  constructor(config: Config) {
    super();
    this._client = new SteamUser();
    this._logger = new Logger(config.logLevel);
  }

  // Public methods first
  public async executeCraft(input: TradeUpInput): Promise<void> {
    // Implementation
  }

  // Private methods last
  private async _validateInput(input: TradeUpInput): boolean {
    // Implementation
  }
}
```

## Testing Requirements

### Coverage Requirements

- **Minimum coverage**: 80% for all new code
- **Critical paths**: >90% coverage required (EV calculations, authentication, craft execution)

### Test Types

#### Unit Tests

```typescript
// tests/unit/ev-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateEV } from '../src/ev-calculator';

describe('EV Calculator', () => {
  it('should calculate expected value correctly', () => {
    const result = calculateEV({
      inputCost: 100,
      outputProbabilities: [0.8, 0.2],
      outputPrices: [90, 500],
      marketFee: 0.15,
    });
    expect(result).toBeCloseTo(2.8, 2);
  });
});
```

#### Integration Tests

```typescript
// tests/integration/steam-auth.test.ts
import { describe, it, expect } from 'vitest';
import { SteamAuthService } from '../src/auth/steam-auth';

describe('Steam Authentication', () => {
  it('should authenticate with valid credentials', async () => {
    const auth = new SteamAuthService(testConfig);
    const result = await auth.login();
    expect(result.success).toBe(true);
    expect(result.sessionToken).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test tests/unit/ev-calculator.test.ts
```

### Test Guidelines

- **Descriptive names**: Use clear, behavior-focused test names
- **AAA pattern**: Arrange, Act, Assert
- **Mock external dependencies**: Don't call real Steam APIs in tests
- **Test edge cases**: Cover error conditions, boundary values, invalid inputs

## Component SPEC Guidelines

Every component should have a co-located `SPEC.md` file documenting its contract:

### SPEC.md Structure

```markdown
# Component SPEC: [Component Name]

**Component Type**: [Service/Module/Utility]
**Created**: YYYY-MM-DD
**Status**: [Initialized/In Development/Complete]
**Complexity**: X/10

## Purpose
Brief description of component purpose and responsibilities.

## API Contract
Public interfaces, method signatures, input/output types.

## Data Model
Data structures, database schemas, state management.

## Edge Cases & Error Handling
Known edge cases and how they're handled.

## Dependencies
External libraries and internal modules required.

## Testing Strategy
Unit test approach, integration test scenarios, coverage targets.

## Linked Specifications
Links to related Feature/Story/Task specifications.

## Change Log
### YYYY-MM-DD - TASK-XXX
**Changes**: Description of changes
**Author**: task-implement workflow
**Validation**: Test results, acceptance criteria status
```

### HoliCode State File Updates

When making significant changes, update HoliCode state files:

#### Update activeContext.md
```markdown
### Recent Changes (YYYY-MM-DD)
- ✅ Implemented [feature name]
- ✅ Added [component/service]
- ✅ Fixed [bug description]
```

#### Update progress.md
```markdown
### Phase X - [Phase Name]
- [x] Task X: [Description] - COMPLETE
- [ ] Task Y: [Description] - IN PROGRESS (75%)
```

#### Document Learnings in retro-inbox.md
```markdown
### [Date] - [Topic]: [Brief Description]
**Issue**: [Problem encountered]
**Root Cause**: [Analysis]
**Resolution**: [Solution applied]
**Pattern**: [Reusable learning]
**Prevention**: [How to avoid in future]
```

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring (no feature changes)
- `test`: Test additions or modifications
- `chore`: Build process, tooling, dependencies

### Examples

```bash
# Feature
feat(auth): add Steam Guard 2FA support

Implement Steam Guard Mobile Authenticator integration using
shared secret from environment variables.

Closes #42

# Bug fix
fix(craft): prevent duplicate craft executions

Add mutex lock to prevent race condition when multiple
craft requests arrive simultaneously.

Fixes #58

# Documentation
docs(readme): update Docker setup instructions

Add troubleshooting section for common Docker issues
on macOS and Windows platforms.
```

### Commit Guidelines

- **Atomic commits**: One logical change per commit
- **Descriptive subjects**: Clear summary (50 chars or less)
- **Detailed bodies**: Explain why, not what (wrap at 72 chars)
- **Reference issues**: Link to GitHub issues when applicable

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feat/your-feature
   git rebase main
   ```

2. **Run full test suite**:
   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

3. **Update documentation** if needed

4. **Update CHANGELOG.md** (if applicable)

### Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feat/your-feature
   ```

2. **Open a Pull Request** on GitHub with:
   - **Title**: Clear, concise description
   - **Description**: 
     - What changes were made
     - Why these changes are needed
     - How to test the changes
     - Link to related issues
   - **Checklist**:
     ```markdown
     - [ ] Tests pass locally
     - [ ] Code follows style guidelines
     - [ ] Documentation updated
     - [ ] Component SPECs updated
     - [ ] Commit messages follow conventional format
     - [ ] No breaking changes (or clearly documented)
     ```

3. **Wait for review** and address feedback

4. **Update PR** based on review comments:
   ```bash
   # Make changes, then amend or add commits
   git add .
   git commit -m "fix: address review feedback"
   git push origin feat/your-feature
   ```

### PR Review Process

- **Automated checks**: CI will run tests, linting, and type checking
- **Code review**: At least one maintainer approval required
- **Testing**: Reviewers may test changes locally
- **Merge**: Maintainers will merge approved PRs

## Steam Ban Mitigation Reminders

When contributing features that interact with Steam, always consider:

### Human-Paced Delays

```typescript
// ✅ GOOD: Human-paced delays
const delayMs = Math.random() * (300000 - 30000) + 30000; // 30s-300s
await sleep(delayMs);

// ❌ BAD: Rapid-fire execution
for (const item of items) {
  await processItem(item); // No delay!
}
```

### Volume Limits

```typescript
// ✅ GOOD: Volume limits enforced
const MAX_DAILY_CRAFTS = 12;
const MAX_MONTHLY_CRAFTS = 100;

if (dailyCrafts >= MAX_DAILY_CRAFTS) {
  throw new Error('Daily craft limit reached');
}

// ❌ BAD: Unlimited execution
while (profitableTradeUps.length > 0) {
  await executeCraft(profitableTradeUps.pop());
}
```

### Educational Purpose Documentation

Always include clear warnings in user-facing features:

```typescript
// ✅ GOOD: Clear warnings
console.warn('⚠️ WARNING: This action violates Steam ToS. Use at your own risk.');
console.warn('⚠️ Recommended: Use a separate test account.');

// ❌ BAD: No warnings
console.log('Starting automated trading...');
```

## Questions or Issues?

- **GitHub Issues**: Open an issue for bugs, feature requests, or questions
- **Discussions**: Use GitHub Discussions for general questions and ideas
- **Security**: Report security vulnerabilities privately to maintainers

Thank you for contributing to this educational project! Your efforts help advance understanding of CS2 trade-up mechanics and Steam API integration patterns.

---

**Remember**: This is an educational research project. All contributions should prioritize learning value over profit optimization, and must include comprehensive risk disclosures.
