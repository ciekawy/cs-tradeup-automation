# Project Brief: CS2 Trade-Up Educational Bot

**Last Updated**: 2025-11-02  
**Status**: Technical Design Complete, Implementation Planning Phase

## Project Overview

An educational demonstration bot that automates Counter-Strike 2 (CS2) trade-up contracts via Steam Game Coordinator (GC) protocol. The project serves as a research tool to explore trade-up automation mechanics, expected value calculations, and Steam API integration patterns.

## Core Purpose

### Primary Goal
Create a lightweight, educational bot that:
- Demonstrates programmatic CS2 trade-up execution using Node.js libraries
- Explores expected value (EV) calculations and risk modeling for trade-up contracts
- Validates Steam GC protocol integration without requiring game installation or GPU resources
- Provides learning insights into Steam authentication, inventory management, and trade-up mechanics

### Educational Focus
This is **not** a commercial trading system. It is designed for comprehensive education in CS2 skin trading:

#### Technical Education
- **Steam GC Protocol**: Understanding Game Coordinator integration, session management, craft() API mechanics
- **Automation Architecture**: Demonstrating Node.js-based automation vs. traditional game-client approaches
- **Session Persistence**: Token management, password-less reconnection patterns

#### Trading Education
- **Trade-Up Mechanics**: How trade-up contracts work (10-for-1 rarity upgrades, collection mixing, float calculations)
- **Expected Value (EV) Models**: Probability calculations, fee impacts, variance considerations
- **Manual vs. Automated Trading**: Comparative analysis of workflows, risks, and economics
- **Market Dynamics**: Steam fees (15%), third-party marketplaces (2-12%), 7-day Trade Protection impacts
- **Risk Modeling**: Price volatility during holds, float miscalculations, market competition
- **Complete Trading Loop**: From deposit → buy inputs → execute trade-up → sell output → cash-out to fiat

#### Compliance & Ethics Education
- **Steam ToS Violations**: Clear documentation of SSA Section 2C violations and consequences
- **Risk Mitigation Strategies**: Low volume, human pacing, separate test accounts
- **Gray-Area Practices**: Understanding how automation affects legitimate traders

#### Research Purposes
- Low-volume experimentation (12-40 crafts/month) with human-paced execution
- Comparative workflow analysis (manual vs. automated)
- Real-world validation of EV calculations and risk models

**Note**: Additional SPIKE research may be needed to comprehensively document general trading strategies, marketplace dynamics, and educational resources for both manual and automated trading approaches.

## Business Context

### Value Proposition

#### Technical Value
- **Architecture Validation**: Proves simple Node.js approach (vs. complex GPU/streaming solutions) is viable
- **Cost Optimization**: Shows 98% size reduction and 95% cost savings compared to game-client-based approaches
- **Protocol Documentation**: Demonstrates CS2 trade-ups can be executed programmatically via GC protocol without game client

#### Educational Value
- **Trading Fundamentals**: Documents complete trade-up process from acquisition to cash-out
- **Comparative Analysis**: Shows differences between manual and automated trading workflows
- **"Easy Profit" Reality Check**: Debunks misleading profit promises by documenting:
  - Real fee structures (15%+ transaction costs)
  - Market competition from automated traders
  - Why publicly-known profitable trade-ups disappear quickly
  - Time vs. money analysis showing manual trading often yields below minimum wage
- **Youth Protection**: Age-appropriate education on trading risks, scams, and responsible decision-making
- **Risk Education**: Comprehensive disclosure of fees, holds, volatility, and ToS violations
- **Economic Models**: Real-world validation of EV calculations, margin analysis, and profitability constraints
- **Market Understanding**: Documents Steam Community Market, third-party platforms, and cashout pathways

#### Research Value
- **Proof-of-Concept**: Low-volume validation of automation feasibility and risk profile
- **Knowledge Base**: Comprehensive documentation for future researchers and developers
- **Community Resource**: Transparent sharing of findings, risks, and mitigation strategies

### Target Audience

#### Primary Audience
- **CS2 Traders**: Learning trade-up mechanics, EV calculations, and risk management
- **Technical Developers**: Understanding Steam GC protocol and automation architecture
- **Market Researchers**: Studying virtual item economies, trading dynamics, and automation impacts

#### Secondary Audience
- **CS2 Players (Including Teenagers)**: Educational resource debunking "easy profit" promises and explaining:
  - Why manual trading is increasingly unprofitable against sophisticated/automated traders
  - Real costs of trading (fees: 15% Steam, 2-12% third-party, holds, volatility)
  - How EV calculations work and why most trade-ups lose money
  - Why YouTube/social media profit promises are often misleading
  - Account security risks and ToS violation consequences
- Educators teaching game economics, virtual markets, or automation ethics
- Parents/guardians understanding CS2 trading risks for younger users
- Compliance professionals understanding ToS implications and risk frameworks
- Community members interested in transparent automation documentation
- Personal educational use on separate test accounts

### Non-Goals
- **Not high-frequency trading**: Human-paced delays (30-300s) maintained to minimize detection risk
- **Not multi-account**: Single account operation only (educational/test account recommended)
- **Not guaranteed profit**: Educational tool with real automation capabilities, but no profit guarantees
- **Not a commercial service**: Self-hosted, personal use only - not a SaaS platform
- **Not risk-free**: Full disclosure of Steam ToS violations and account restriction risks

## Key Constraints

### Technical Constraints
- Must use Steam GC protocol via `node-globaloffensive` library
- Requires Steam account credentials (stored securely)
- Subject to Steam's 7-day Trade Protection on received items
- Cannot execute trade-ups on Trade Protected items
- Session persistence needed for password-less reconnection

### Compliance Constraints
- **Steam SSA Violation**: Automation violates Section 2C (no scripts/bots to interact with Steam Content)
- **Risk Level**: Medium (account restrictions/bans possible)
- **Mitigation Required**: Low volume, human pacing, separate test account, educational purpose declaration
- **No Warranty**: Users accept account restriction risk

### Operational Constraints
- Low-to-moderate volume: 12-100 trade-up contracts per month (adjustable based on risk tolerance)
- Human-paced execution: 30-300 second delays between actions to minimize detection risk
- Single account operation (educational/test account recommended)
- Educational/research purpose with full-cycle automation capability
- Minimal marketplace automation (buying inputs, selling outputs) with conservative rate limiting

## Success Criteria

### Technical Success
- ✅ Node.js bot successfully authenticates with Steam
- ✅ Bot connects to CS2 Game Coordinator
- ✅ `craft()` method executes trade-ups programmatically
- ✅ Session tokens persist across restarts
- ✅ Container runs on standard CPU (no GPU required)
- ✅ Resource usage ≤ 1GB RAM, 5-10GB storage

### Educational Success
- Comprehensive documentation of GC protocol trade-up flow
- Clear risk disclosures and mitigation strategies documented
- Technical design artifacts demonstrate architecture simplification
- Proof-of-concept validates approach without major Steam enforcement action

### Risk Management Success
- No permanent Steam account restrictions during research phase
- Human-paced execution patterns maintained
- Separate test account isolation maintained
- All compliance disclosures clearly documented

## Project Scope

### In Scope

#### Core Automation (Phase 1)
1. **Steam Authentication**: Login, 2FA handling, session persistence
2. **GC Protocol Integration**: Connect to Game Coordinator, inventory access
3. **Trade-Up Execution**: Programmatic `craft()` calls with 10 asset IDs
4. **Result Handling**: Capture crafting results, log outcomes
5. **Session Management**: Persistent session tokens, auto-reconnect
6. **Docker Containerization**: Portable deployment on local/VPS
7. **Compliance Documentation**: Comprehensive ToS risk disclosure

#### Full-Cycle Automation (Phase 2)
8. **Automated EV Calculation Engine**:
   - Probability calculations for trade-up outcomes
   - Fee impact modeling (Steam 15%, third-party 2-12%)
   - Variance and risk scoring
   - Profitability thresholds and filters
   - Real-time price data integration

9. **Float Value Optimization**:
   - Float range calculations for desired output conditions
   - Input float averaging algorithms
   - FN/MW threshold targeting
   - Float-aware input selection (reasonably limited scope)

10. **Input Acquisition Automation**:
    - Steam Community Market buy order placement
    - Price monitoring and optimal buy timing
    - Third-party marketplace integration (optional)
    - Inventory tracking and float verification
    - Trade Protection wait period management

11. **Output Liquidation Automation**:
    - Automated listing on Steam Community Market
    - Third-party marketplace selling (minimal viable integration)
    - Price optimization (undercut strategies)
    - Sale confirmation and proceeds tracking

12. **Market Data & Opportunity Detection**:
    - Real-time price scraping (Steam, third-party markets)
    - Trade-up opportunity scanning
    - Profitability alerts and notifications
    - Historical price tracking

13. **Risk Management & Controls**:
    - Daily/monthly volume limits
    - Capital allocation rules
    - Stop-loss thresholds
    - Account health monitoring

#### Supporting Features
14. **Profit Tracking & Reporting**: Transaction logs, P&L calculations, performance metrics
15. **Configuration Management**: YAML/JSON configs for trade-up formulas, risk parameters, market settings
16. **Alerting & Notifications**: Discord/email alerts for profitable opportunities, errors, account issues

### Out of Scope (Current Phase)
- Multi-account orchestration
- High-frequency/high-volume execution (>100 crafts/month)
- Advanced arbitrage strategies across multiple marketplaces
- Trade Protection reversal handling
- Account recovery/ban appeal processes
- Sophisticated machine learning models for price prediction

### Potential Future Scope (Post-PoC / Pre-MVP)

**Web Dashboard/Control Panel**:
- **Purpose**: User-friendly interface for bot configuration, monitoring, and control
- **Key Features**:
  - Configuration management (volume limits, pacing parameters, risk thresholds)
  - Real-time bot status dashboard and activity feed
  - Trade-up opportunity viewer with EV calculations and profitability analysis
  - P&L tracking with historical analytics and performance charts
  - Manual override controls (pause/resume operations, emergency stop)
  - Market data visualization (price trends, collection analytics)
- **Value**: Transforms technical automation into accessible, controllable tool
- **Technology**: React or Angular frontend, REST/GraphQL API, containerized deployment
- **Timing**: Post-core-automation validation, if user demand justifies development effort

**LLM-Based AI Agentic Automation** (Requires SPIKE Research):
- **SPIKE Timing**: Post-PoC validation, pre-MVP feature set
- **Research Scope**:
  - LLM provider evaluation (OpenAI, Anthropic, local models)
  - Agent framework selection (LangChain, LlamaIndex, custom)
  - Cost-benefit analysis (API costs vs. value delivered)
  - Safety and reliability requirements
- **Potential Capabilities**:
  - Natural language configuration ("find trade-ups with >10% ROI in Mirage collection")
  - Market sentiment analysis (Reddit, Twitter, Steam forums) for trend detection
  - Dynamic strategy adjustment based on real-time market conditions
  - Automated learning from trading outcomes (success pattern recognition)
  - Educational content generation (explaining trade-up mechanics, risk breakdowns)
  - Anomaly detection and opportunity alerts
- **Value**: Enhanced decision-making, reduced manual analysis, more sophisticated trading strategies
- **Risk**: API costs, latency, prompt engineering complexity, hallucination mitigation
- **Decision Gate**: ROI analysis required before committing to implementation

**Advanced Capabilities** (Long-Term):
- Advanced machine learning for price prediction and opportunity detection
- Multi-marketplace arbitrage automation
- Portfolio optimization across multiple trade-up strategies
- Advanced risk management with dynamic capital allocation
- Integration with crypto payment gateways for fiat conversion
- Mobile app for monitoring and alerts
- Comprehensive trading strategy documentation (manual workflows comparison)
- Educational modules and interactive simulators

## Timeline & Milestones

### Completed Phases
- ✅ **Phase 1**: Initial Research (SPIKE investigations completed)
- ✅ **Phase 2**: Technical Design (7 TD documents completed 2025-11-02)
- ✅ **Phase 3**: Architecture Simplification (GPU approach abandoned, Node.js validated)

### Upcoming Phases
- **Phase 4**: Implementation Planning (current - estimate 1-2 weeks)
- **Phase 5**: Core Implementation (estimated 2-3 weeks)
- **Phase 6**: Testing & Validation (estimated 1 week)
- **Phase 7**: Documentation & Knowledge Capture (estimated 1 week)

## Risk Assessment

### High Risks
1. **Steam Account Restrictions**: Medium likelihood, high impact
   - Mitigation: Separate test account, low volume, human pacing
2. **Steam Policy Changes**: Low likelihood, high impact
   - Mitigation: Monitor Steam announcements, be ready to suspend operations

### Medium Risks
1. **Library API Changes**: Low likelihood, medium impact
   - Mitigation: Pin library versions, monitor GitHub repositories
2. **Network Connectivity Issues**: Medium likelihood, medium impact
   - Mitigation: Retry logic, session persistence, graceful degradation

### Low Risks
1. **Local Docker Environment Issues**: Medium likelihood, low impact
   - Mitigation: Standard Docker troubleshooting, VPS fallback option

## Resources & Tools

### Development Resources
- **MCP Tools**: searxng available for proactive research needs
- **Deployment Options**: Local macOS Docker Desktop OR cloud VPS
- **Documentation**: Technical Design documents, research reports

### Key Libraries
- `steam-user` (DoctorMcKay): Steam authentication, 2FA, session management
- `node-globaloffensive` (DoctorMcKay): GC protocol, craft() method, inventory access

### Infrastructure
- Docker + docker-compose for containerization
- Persistent volume for session storage (/data)
- Minimal resources: 512MB-1GB RAM, 1 CPU core, 5-10GB storage

## Stakeholders

### Primary Stakeholder
- Project owner/developer (educational/learning purpose)

### Secondary Stakeholders
- Technical community (via shared learnings/documentation)
- Open-source community (library maintainers, if contributions made)

## Communication & Reporting

- Technical design artifacts maintained in `.holicode/specs/technical-design/`
- Research findings captured in `.holicode/analyse/`
- Implementation progress tracked in `.holicode/state/progress.md`
- Retrospectives and learnings documented in `.holicode/state/retro-inbox.md`

---

**Note**: This project explicitly acknowledges Steam Subscriber Agreement violations inherent in automation. It is designed as an educational research tool with comprehensive risk mitigation strategies. Users accept full responsibility for any account restrictions that may result from using this bot.
