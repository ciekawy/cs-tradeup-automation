# CS2 Trade-Up Educational Bot

An educational demonstration bot that automates Counter-Strike 2 (CS2) trade-up contracts via Steam Game Coordinator (GC) protocol. This project serves as a research tool to explore trade-up automation mechanics, expected value calculations, and Steam API integration patterns.

## ⚠️ Important Warnings

### Steam Terms of Service Violation

**This project explicitly violates Steam Subscriber Agreement Section 2C**, which prohibits the use of scripts or bots to interact with Steam Content. By using this bot, you accept the following risks:

- **Account Restrictions**: Your Steam account may be restricted, limited, or permanently banned
- **Trade Locks**: Steam may impose trade locks or market restrictions on your account
- **No Warranty**: This software is provided "as-is" with no guarantees or warranties
- **Educational Purpose Only**: This is a research and learning tool, not a commercial trading system

**Use a separate test account with minimal value**. Never use your primary Steam account.

### Not a "Get Rich Quick" Scheme

This bot does **NOT** guarantee profits. CS2 trade-ups involve:

- **High fees**: 15% Steam Community Market fees (plus payment processor fees)
- **Market competition**: Automated traders make manual trading increasingly unprofitable
- **Price volatility**: Market prices change rapidly during 7-day Trade Protection holds
- **Real losses**: Most trade-ups lose money due to fees and market dynamics

This project is designed for **education and research**, not financial gain.

## 🎯 Purpose & Scope

### What This Bot Does

- Demonstrates programmatic CS2 trade-up execution using Node.js libraries
- Explores expected value (EV) calculations and risk modeling
- Validates Steam GC protocol integration without game installation
- Provides learning insights into Steam authentication and inventory management

### What This Bot Does NOT Do

- **Not high-frequency trading**: Human-paced delays (30-300s) to minimize detection risk
- **Not multi-account**: Single account operation only
- **Not guaranteed profit**: Educational tool with no profit promises
- **Not a commercial service**: Self-hosted, personal use only

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22 or 24 (LTS recommended)
  - Check: `node -v` (should show v22.x.x or v24.x.x)
  - Download: https://nodejs.org/
- **pnpm**: Version 8 or higher
  - Check: `pnpm -v` (should show 8.x.x or higher)
  - Install: `npm install -g pnpm`
- **Docker**: Latest version with docker-compose
  - Check: `docker -v` and `docker-compose -v`
  - Download: https://www.docker.com/products/docker-desktop

### Steam Account Requirements

- Steam account with $5+ spent (to remove limited account restrictions)
- Steam Guard Mobile Authenticator enabled (15-day waiting period before trading)
- Steam API Key (obtain from https://steamcommunity.com/dev/apikey)
- **Recommendation**: Use a separate test account, not your primary Steam account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ciekawy/cs-tradeup-automation.git
cd cs-tradeup-automation
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your Steam credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Steam credentials:

```bash
# Steam Authentication (REQUIRED)
STEAM_USERNAME=your_steam_username
STEAM_PASSWORD=your_steam_password
STEAM_SHARED_SECRET=your_shared_secret
STEAM_API_KEY=your_api_key

# Optional Configuration
NODE_ENV=development
LOG_LEVEL=info
MAX_DAILY_CRAFTS=12
MAX_MONTHLY_CRAFTS=100
CRAFT_DELAY_MIN=300000  # 5 minutes
CRAFT_DELAY_MAX=900000  # 15 minutes
```

**Security Note**: Never commit `.env` to version control. It contains sensitive credentials.

### 4. Run Locally (Development)

```bash
# Run tests
pnpm test

# Build TypeScript
pnpm build

# Start the bot
pnpm start
```

### 5. Run with Docker (Recommended)

```bash
# Build the Docker image
pnpm docker:build
# OR
docker-compose build

# Start the bot in detached mode
pnpm docker:up
# OR
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop the bot
pnpm docker:down
# OR
docker-compose down
```

## 🐳 Docker Usage

### Development Mode with Hot-Reload

The docker-compose configuration includes hot-reload for development:

```bash
# Start with hot-reload enabled
docker-compose up

# Make changes to src/ or tests/ - container will reload automatically
```

### Container Management

```bash
# View running containers
docker-compose ps

# Access container shell
docker-compose exec bot sh

# View logs (last 100 lines)
docker-compose logs --tail=100 bot

# Restart container
docker-compose restart bot

# Rebuild after dependency changes
docker-compose build --no-cache
```

### Persistent Data

The bot stores session tokens and state in persistent storage. You can choose between two approaches:

#### Option 1: Docker Named Volume (Default)

- **Volume**: `bot-data` mounted at `/data` in container
- **Pros**: Better portability, managed by Docker
- **Cons**: Requires Docker commands for backup/access
- **Backup**: `docker run --rm -v bot-data:/data -v $(pwd):/backup alpine tar czf /backup/bot-data-backup.tar.gz /data`
- **Restore**: `docker run --rm -v bot-data:/data -v $(pwd):/backup alpine tar xzf /backup/bot-data-backup.tar.gz -C /`

#### Option 2: Bind Mount to Host (Simpler Backups)

To use a local directory instead of a Docker volume:

1. Update `docker-compose.yml` volumes section:

   ```yaml
   volumes:
     - ./data:/data # Bind mount to local directory
     - ./src:/app/src:ro
     - ./tests:/app/tests:ro
   ```

2. Create the data directory:

   ```bash
   mkdir -p data
   ```

3. Add to `.gitignore`:
   ```
   /data/
   ```

- **Pros**: Direct access to files, standard backup tools (rsync, cp, etc.)
- **Cons**: Potential permission issues, less portable
- **Backup**: Simply backup the `./data` directory with any standard tool
- **Contents**: `session.json`, `volume.json`, `trade_queue.json`, logs in `./data/`

**Recommendation**: Use bind mount for development/testing (easier access to logs and state). Use Docker volume for production deployments (better isolation).

## 🧪 Testing

Run the test suite to verify your setup:

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

## 📁 Project Structure

```
cs-tradeup-automation/
├── src/                    # Source code (TypeScript)
│   ├── index.ts           # Entry point
│   └── infrastructure/    # Infrastructure setup
├── tests/                  # Test files
│   ├── infrastructure.test.ts
│   └── docker.test.ts
├── docs/                   # Documentation
├── .holicode/             # HoliCode project state
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Docker orchestration
├── .dockerignore          # Docker build exclusions
├── .env.example           # Environment variables template
├── package.json           # Package manifest
├── tsconfig.json          # TypeScript config
├── vitest.config.ts       # Test configuration
├── .eslintrc.json         # ESLint configuration
└── .prettierrc.json       # Prettier configuration
```

## 🔧 Development

### Available Scripts

```bash
pnpm dev           # Start development mode with watch
pnpm build         # Compile TypeScript to dist/
pnpm start         # Run compiled code
pnpm test          # Run all tests
pnpm test:watch    # Run tests in watch mode
pnpm lint          # Run ESLint
pnpm lint:fix      # Run ESLint with auto-fix
pnpm format        # Run Prettier
pnpm typecheck     # Type-check without emitting

# Docker commands
pnpm docker:build  # Build Docker image
pnpm docker:up     # Start Docker containers
pnpm docker:down   # Stop Docker containers
```

### Code Quality

- **ESLint**: TypeScript-aware linting with recommended rules
- **Prettier**: Consistent code formatting (single quotes, 100 char width)
- **TypeScript**: Strict mode enabled for type safety
- **Vitest**: Fast unit testing with coverage reporting

## 📖 Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Development workflow and contribution guidelines
- [LICENSE](LICENSE) - MIT License
- [.holicode/](/.holicode/) - HoliCode project state and specifications

## 🛡️ Security & Compliance

### Credential Management

- Store Steam credentials in `.env` file (never commit to git)
- Session tokens stored in `/data` volume (file permissions restricted)
- Use Docker secrets or environment variables (not in images)

### Risk Mitigation Strategies

- **Low Volume**: Limit to 12-100 crafts per month
- **Human Pacing**: 30-300 second delays between actions
- **Separate Account**: Use dedicated test account, not primary account
- **Educational Purpose**: Clearly documented as research tool

### Compliance

- **Steam ToS**: Project explicitly violates automation clause (SSA Section 2C)
- **Risk Acceptance**: Users accept account restriction risks
- **No Commercial Use**: Educational and research purposes only

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, code style guidelines, and testing requirements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [DoctorMcKay](https://github.com/DoctorMcKay) for `steam-user` and `node-globaloffensive` libraries
- Steam community for documentation and support
- HoliCode framework for project organization and workflow management

## ⚖️ Disclaimer

This software is provided "as-is" for educational and research purposes only. The authors and contributors are not responsible for any account restrictions, bans, or financial losses resulting from the use of this bot. By using this software, you acknowledge that you understand and accept the risks associated with violating Steam's Terms of Service.

**Use at your own risk. Trade responsibly.**
