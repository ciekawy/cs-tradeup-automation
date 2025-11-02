# Technology Context: CS2 Trade-Up Educational Bot

**Last Updated**: 2025-11-02  
**Status**: Technical Stack Defined, Implementation Pending

## Runtime Environment

### Primary Runtime: Node.js
- **Version**: Node.js 22 or 24 (latest LTS)
- **Rationale**: 
  - Mature ecosystem for Steam API integration
  - DoctorMcKay's libraries require Node.js
  - Excellent async/event-driven support (critical for GC protocol)
  - Latest features and performance improvements
  - Large community and tooling
- **Base Image**: `node:22-alpine` or `node:24-alpine` (Docker)

### Operating Environment
- **Container**: Docker containerization for portability and isolation
- **Base OS**: Alpine Linux (minimal footprint, ~5MB base)
- **Orchestration**: docker-compose for local/single-host deployment

## Core Dependencies

### Steam Integration (Critical)
- **steam-user** (by DoctorMcKay)
  - Purpose: Steam authentication, session management, 2FA handling
  - License: MIT
  - Repository: https://github.com/DoctorMcKay/node-steam-user
  - Status: Actively maintained, production-ready
  
- **node-globaloffensive** (by DoctorMcKay)
  - Purpose: CS2 Game Coordinator protocol, `craft()` method, inventory access
  - License: MIT
  - Repository: https://github.com/DoctorMcKay/node-globaloffensive
  - Status: Actively maintained
  - Note: Provides event-driven API for trade-up execution

### Additional Dependencies (TBD)
The following dependencies will be selected during implementation based on specific requirements:

- **HTTP Client**: For Steam Market API and third-party marketplace integration
  - Options: `axios`, `node-fetch`, `got`
  - Selection criteria: promise support, retry logic, timeout handling

- **Configuration**: For YAML/JSON config management
  - Options: `js-yaml`, `dotenv`, `config`
  - Requirements: environment variable substitution, validation

- **Logging**: For structured logging and observability
  - Options: `winston`, `pino`, `bunyan`
  - Requirements: log levels, JSON output, file rotation

- **Data Persistence**: For session tokens, volume tracking, queues
  - Simple approach: JSON files in `/data` volume
  - Alternative: SQLite for more complex querying needs

- **Job Scheduling**: For trade protection scheduling, periodic tasks
  - Options: `node-cron`, `bull`, custom interval-based
  - Requirements: persistence, missed-job recovery

## Infrastructure

### Containerization
- **Docker**: 
  - Container runtime for portability
  - Persistent volume: `/data` for session, config, logs, state
  - Environment variables for secrets (Steam credentials)
  
- **docker-compose**:
  - Single-service orchestration
  - Volume management
  - Restart policies
  - Log management

### Deployment Targets

**Local Development/Testing**:
- Platform: macOS (Docker Desktop)
- Purpose: Educational use, development, testing
- Resources: Minimal (512MB RAM, 1 CPU core)

**Production/Long-Running** (Optional):
- Platform: Standard VPS (no GPU required)
- Options: DigitalOcean, Linode, AWS EC2 t2.micro, etc.
- Requirements: Docker support, 1GB RAM, 1 CPU core, 5-10GB storage
- Cost estimate: $5-10/month (vs. $108-216/month for GPU approach)

### Persistent Storage
- **Volume**: `/data` mounted in container
- **Contents**:
  - `session.json` - Steam session tokens
  - `volume.json` - Daily/monthly craft counters
  - `trade_queue.json` - Trade protection scheduler state
  - `config/` - User configuration (optional)
  - `logs/` - Application logs

## Development Tools

### Version Control
- **Git**: Source code version control
- **GitHub**: Remote repository (if project is open-sourced)
- **.gitignore**: Exclude sensitive data (session tokens, credentials, logs)

### Code Quality (Recommended)
- **ESLint**: JavaScript/TypeScript linting (recommended standard)
  - Configuration: Extend recommended rules, custom rules for Steam API patterns
  - Pre-commit hooks via husky
- **Prettier**: Code formatting (recommended standard)
  - Consistent code style across project
  - Integration with ESLint
- **Testing**: Framework TBD (Jest, Vitest, or similar)
  - Unit tests for core logic (EV calculations, float optimization)
  - Integration tests for Steam API interactions (mocked)

### Build & Package Management
- **pnpm**: Primary package manager (preferred)
  - Rationale: Faster installs, disk space efficiency, strict dependency management
  - Workspace support for potential monorepo structure
- **package.json**: Dependency management, scripts
- **Monorepo Tool** (Optional): **Nx** 
  - Consider if web dashboard or multiple applications needed
  - Benefits: Build caching, task orchestration, project graph visualization
  - Use case: Core bot + web dashboard + shared libraries

## Resource Requirements

### Minimum Resources
- **RAM**: 512MB
- **CPU**: 1 core (standard, no GPU)
- **Storage**: 5GB (application + persistent data)
- **Network**: Standard internet connection

### Recommended Resources
- **RAM**: 1GB (headroom for market data caching)
- **CPU**: 1-2 cores (for responsiveness)
- **Storage**: 10GB (logs, historical data)

### Resource Comparison
- **This approach**: 512MB RAM, 1 CPU core, 5-10GB storage
- **Game-client approach**: 4GB+ RAM, GPU required, 85GB+ storage
- **Savings**: ~98% storage, 95% cost reduction

## MCP Integration

### Available MCP Tools
- **searxng**: Web search via SearXNG API
  - Use case: Proactive research for trading strategies, market data sources, documentation
  - Commands: `searxng_web_search`, `web_url_read`
  - Note: Available for general research needs throughout project

## Technology Selection Criteria

### Library Selection Principles
1. **Actively Maintained**: Prefer libraries with recent commits and active maintainers
2. **MIT/Permissive License**: Ensure compatibility with educational/open-source goals
3. **TypeScript Support**: Optional, but beneficial for type safety
4. **Community Size**: Larger community = better support and documentation
5. **Production Ready**: Prefer stable releases over bleeding-edge

### Technology Constraints
- **No GPU Required**: Eliminates CUDA, graphics libraries, game engines
- **Headless Only**: No GUI frameworks, no display server (X11/Wayland)
- **Minimal Footprint**: Prefer Alpine-compatible packages
- **Node.js Ecosystem**: Stay within JavaScript/Node.js ecosystem for consistency

## Security Considerations

### Credential Management
- **Steam Credentials**: 
  - Stored as environment variables (never in code)
  - Session tokens persisted in `/data` volume (file permissions restricted)
  - Consideration: Encrypt session tokens at rest (implementation TBD)

### Container Security
- **Principle of Least Privilege**: Run as non-root user in container
- **Read-only Filesystem**: Mount code as read-only, only `/data` writable
- **Network Isolation**: No unnecessary port exposure
- **Secrets Management**: Use Docker secrets or environment variables (not in images)

### Compliance
- **Steam ToS**: Project explicitly violates automation clause (Section 2C)
- **Risk Acceptance**: Users accept account restriction risks
- **Educational Purpose**: Clearly documented as educational, not commercial

## Future Considerations

### Potential Technology Additions

**Near-Term Technology Additions**:
- **TypeScript**: Migration from JavaScript for type safety and better DX
- **Nx Workspace**: Monorepo tooling if multi-app structure needed
  - Use case: Core bot + web frontend + shared libraries
  - Benefits: Build caching, task orchestration, dependency graph
- **Frontend Framework**: **React** or **Angular** (TBD if web UI needed)
  - Selection criteria: Team expertise, ecosystem maturity, TypeScript support

**Post-PoC / Pre-MVP Technology Evaluation**:
- **LLM Provider Options**:
  - Cloud APIs: OpenAI GPT-4, Anthropic Claude, Google Gemini
  - Local models: Ollama (Llama 3, Mistral, etc.)
  - Selection criteria: Cost, latency, context window, reliability
- **LLM Agent Frameworks**: LangChain, LlamaIndex, AutoGPT, custom
- **API Architecture**: REST vs. GraphQL for backend-to-frontend communication
- **Real-time Communication**: WebSockets, Server-Sent Events for live updates

**Production/Scaling Technology**:
- **Database**: SQLite (simple), PostgreSQL (advanced querying)
- **Message Queue**: Redis, RabbitMQ, Bull (if async jobs needed)
- **Monitoring**: Prometheus + Grafana for metrics and alerting
- **CI/CD**: GitHub Actions for automated testing and deployment

### Scalability Considerations
- Current design: Single-account, single-instance (12-100 crafts/month)
- Not designed for: Multi-account, high-frequency, distributed execution
- Note: Scaling would increase Steam enforcement risk and violate educational purpose

---

**Technology Philosophy**: "Simple, proven, maintainable - optimize for educational clarity over production complexity."
