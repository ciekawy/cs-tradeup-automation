# Component SPEC: Infrastructure

**Component Type**: Project Infrastructure  
**Created**: 2025-11-02  
**Status**: Initialized  
**Complexity**: 2/10

## Purpose

Project infrastructure setup for CS2 Trade-Up Educational Bot, including:
- Package management (pnpm workspace)
- TypeScript configuration
- Code quality tools (ESLint, Prettier)
- Testing framework (Vitest)
- Directory structure
- Docker containerization (Dockerfile, docker-compose.yml)
- Environment variable management (.env)

## API Contract

### Package Manager
- **Tool**: pnpm >=8.0.0
- **Node.js**: >=22.0.0
- **Workspace**: Single package (monorepo-ready structure)

### Build Scripts
```bash
pnpm test          # Run tests with Vitest
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Generate coverage report
pnpm build         # Compile TypeScript to dist/
pnpm lint          # Run ESLint
pnpm lint:fix      # Auto-fix linting issues
pnpm format        # Format code with Prettier
pnpm typecheck     # Type-check without emitting
```

## Data Model

### Directory Structure
```
cs-tradeup-automation/
├── src/                 # Source code (TypeScript)
├── tests/               # Test files
├── docs/                # Documentation
├── dist/                # Compiled JavaScript (gitignored)
├── node_modules/        # Dependencies (gitignored)
├── .holicode/           # HoliCode project state
├── Dockerfile           # Docker image definition
├── docker-compose.yml   # Docker orchestration
├── .dockerignore        # Docker build exclusions
├── .env.example         # Environment variables template
├── .env                 # Environment variables (gitignored)
├── package.json         # Package manifest
├── tsconfig.json        # TypeScript config (development)
├── tsconfig.build.json  # TypeScript config (production)
├── vitest.config.ts     # Vitest test configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc.json     # Prettier configuration
└── .gitignore           # Git ignore patterns
```

### TypeScript Configuration
- **Target**: ES2022
- **Module**: ES2022 (ES modules)
- **Strict Mode**: Enabled
- **Source Maps**: Enabled for development
- **Output Directory**: `./dist`
- **Path Aliases**: `@/*` maps to `src/*`

### Code Quality Tools
- **ESLint**: TypeScript-aware linting with recommended rules
- **Prettier**: Consistent code formatting (single quotes, 100 char width)
- **Integration**: ESLint + Prettier via `eslint-plugin-prettier`

### Testing Framework
- **Tool**: Vitest
- **Environment**: Node.js
- **Coverage**: V8 provider (text, JSON, HTML reports)
- **Globals**: Enabled for test functions

### Docker Configuration

#### Dockerfile
- **Base Image**: node:24-alpine (minimal footprint)
- **Package Manager**: pnpm installed globally
- **Security**: Non-root user (botuser:1001)
- **Working Directory**: /app
- **Build Process**: Install dependencies → Copy source → Build TypeScript
- **Persistent Storage**: /data volume for session/config/logs
- **Entrypoint**: node dist/index.js

#### docker-compose.yml
- **Service**: Single bot service
- **Restart Policy**: unless-stopped
- **Volumes**:
  - Named volume: bot-data → /data (persistent)
  - Bind mount: ./src → /app/src:ro (hot-reload)
  - Bind mount: ./tests → /app/tests:ro (hot-reload)
- **Environment**: Loaded from .env file
- **Health Check**: Node.js process check every 30s
- **Logging**: JSON file driver (max 10MB, 3 files)
- **Network**: Isolated bridge network

#### Environment Variables (.env.example)
**Required**:
- STEAM_USERNAME - Steam account username
- STEAM_PASSWORD - Steam account password
- STEAM_SHARED_SECRET - Steam Guard shared secret
- STEAM_API_KEY - Steam Web API key

**Optional**:
- NODE_ENV (default: development)
- LOG_LEVEL (default: info)
- MAX_DAILY_CRAFTS (default: 12)
- MAX_MONTHLY_CRAFTS (default: 100)
- CRAFT_DELAY_MIN (default: 300000ms = 5 min)
- CRAFT_DELAY_MAX (default: 900000ms = 15 min)

#### Docker Commands
```bash
# Build container
docker-compose build

# Start container (detached)
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop container
docker-compose down

# Restart container
docker-compose restart

# Access container shell
docker-compose exec bot sh
```

## Edge Cases & Error Handling

### Missing Dependencies
- **Issue**: Dependencies not installed
- **Resolution**: Run `pnpm install`
- **Validation**: Check for `node_modules/` directory

### TypeScript Compilation Errors
- **Issue**: Type errors prevent build
- **Resolution**: Fix type errors or use `typecheck` script
- **Validation**: `pnpm typecheck` exits with 0

### Linting Failures
- **Issue**: Code doesn't meet style guidelines
- **Resolution**: Run `pnpm lint:fix` for auto-fixes
- **Validation**: `pnpm lint` exits with 0

### Node.js Version Mismatch
- **Issue**: Unsupported Node.js version
- **Resolution**: Upgrade to Node.js 22 or 24
- **Validation**: `node -v` shows >=22.0.0

## Dependencies

### Production Dependencies
- None yet (to be added in future tasks)

### Development Dependencies
- `typescript` ^5.4.0 - TypeScript compiler
- `@types/node` ^22.0.0 - Node.js type definitions
- `vitest` ^1.0.0 - Testing framework
- `@vitest/coverage-v8` ^1.0.0 - Coverage reporting
- `eslint` ^8.57.0 - Linting tool
- `@typescript-eslint/eslint-plugin` ^7.0.0 - TypeScript ESLint rules
- `@typescript-eslint/parser` ^7.0.0 - TypeScript parser for ESLint
- `eslint-config-prettier` ^9.1.0 - Prettier integration
- `eslint-plugin-prettier` ^5.1.0 - Prettier as ESLint plugin
- `prettier` ^3.2.0 - Code formatter

## Testing Strategy

### Unit Tests
- Location: `tests/` directory
- Naming: `*.test.ts` or `*.spec.ts`
- Framework: Vitest with Node.js environment
- Coverage Target: >90% for critical paths

### Test Execution
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Validation Criteria
- All tests pass
- Coverage meets minimum threshold (>90%)
- No linting errors
- TypeScript compiles without errors

## Linked Specifications

**Task**: [TASK-001](../../.holicode/specs/tasks/TASK-001.md) - Initialize pnpm workspace with TypeScript configuration  
**Story**: [STORY-008](https://github.com/ciekawy/cs-tradeup-automation/issues/8) - Docker Infrastructure  
**Epic**: [EPIC-002](https://github.com/ciekawy/cs-tradeup-automation/issues/2) - Core Automation Loop

## Change Log

### 2025-11-02 - TASK-001 (Initial Setup)
**Changes**: 
- Created package.json with pnpm workspace configuration
- Configured TypeScript (tsconfig.json, tsconfig.build.json)
- Set up ESLint with TypeScript support and Prettier integration
- Configured Prettier with project style guidelines
- Set up Vitest testing framework
- Created directory structure (src/, tests/, docs/)
- All configuration files use ES2022 modules and Node.js 22+ target

**Author**: task-implement workflow  
**Validation**: Pending - dependencies not yet installed, tests not yet run  
**Status**: Configuration complete, awaiting `pnpm install` and validation

### 2025-11-02 - TASK-002 (Docker Infrastructure)
**Changes**:
- Created Dockerfile with Node.js 24 Alpine base image
- Configured docker-compose.yml with persistent volumes and hot-reload
- Added .env.example template with Steam authentication variables
- Created .dockerignore to optimize build context
- Configured non-root user (botuser) for container security
- Set up /data volume for persistent session/config/logs
- Configured health checks and logging rotation
- Added development hot-reload via volume mounts (src/, tests/)

**Author**: task-implement workflow  
**Validation**: Container builds successfully, awaiting integration tests  
**Status**: Docker infrastructure complete, ready for application code
