# System Patterns: CS2 Trade-Up Educational Bot

**Last Updated**: 2025-11-02  
**Status**: Architectural Foundation - Implementation Patterns TBD

## Validated Architectural Decisions

### 1. Protocol-Level Integration (Validated)

**Decision**: Use direct Steam Game Coordinator (GC) protocol via Node.js libraries instead of CS2 game client automation.

**Rationale**: 
- Trade-ups execute via network protocol, not graphical interface
- Eliminates GPU, graphics environment, and 85GB game installation requirements
- Proven feasible via DoctorMcKay's `steam-user` and `node-globaloffensive` libraries

**Implications**:
- Container size ~500MB vs ~85GB
- Standard CPU sufficient (no GPU needed)
- Headless operation in Docker

### 2. Session Persistence Required

**Conclusion**: Steam 2FA challenges break automation without session token persistence.

**Directions**:
- Persist session/refresh tokens across container restarts
- Store in persistent volume (`/data`)
- Security considerations: encrypted storage, restricted file permissions

### 3. Human-Paced Execution Essential

**Conclusion**: Rapid automation triggers Steam bot detection.

**Strategy**:
- Randomized delays between actions (mimics human behavior)
- Configurable pacing: 30-300s between crafts, 10-30s between market actions
- Exponential backoff after errors

**Risk Mitigation**: Volume limits (daily/monthly caps) to reduce enforcement exposure

### 4. Event-Driven GC Protocol

**Architectural Constraint**: `node-globaloffensive` uses event-driven API (not promises).

**Implication**: Need async/await wrapper patterns for cleaner code flow.

### 5. Trade Protection Impact

**Constraint**: Steam's 7-day Trade Protection blocks immediate reuse of traded items in trade-ups.

**Implications**:
- Full-cycle automation must account for 7-day delays
- Queueing/scheduling system needed for "item becomes available" triggers
- Capital velocity reduced by waiting periods

## Strategic Directions for Full-Cycle Automation

### Expected Value (EV) Calculation

**Requirements**:
- Probability modeling based on collection mixing (10 inputs → outcome distribution)
- Fee impact modeling (15% Steam, 2-12% third-party)
- Variance and risk scoring

**Open Questions**:
- Monte Carlo simulation vs. deterministic calculation?
- Historical price data window size?
- Volatility adjustment factors?

### Float Value Optimization

**Requirements**:
- Map input float averages to output wear conditions (FN/MW/FT/WW/BS)
- Target specific output conditions based on value differentials

**Known Constraints**:
- Float ranges fixed: FN [0.00-0.07], MW [0.07-0.15], etc.
- Output float = f(avg input floats, output skin's min/max range)

**Implementation Scope TBD**: "Reasonably limited" per project scope

### Market Data Integration

**Requirements**:
- Real-time price data for EV calculations
- Opportunity detection (profitable trade-up identification)

**Strategic Options**:
- Steam Community Market API (rate limits, 15% fees)
- Third-party APIs (CSFloat, Skinport, etc. - lower fees, different constraints)

**Directions**: Polling with caching, rate limiting, TTL-based refresh

### Risk Management Controls

**Non-Negotiable**:
- Daily/monthly volume limits (configurable, default: 12-100 crafts/month)
- Capital allocation rules
- Account health monitoring

**Implementation TBD**: Persistent counters, time-based resets, alerting thresholds

## Deployment Patterns (Validated)

### Docker Containerization

**Confirmed Approach**:
- Node.js 18/20 LTS on Alpine Linux base
- Single persistent volume (`/data`) for session, config, logs, state
- docker-compose for orchestration
- Environment variable configuration (Steam credentials, limits, etc.)

**Deployment Targets**:
- Local: macOS Docker Desktop
- Cloud: Standard VPS (no GPU required)

### Configuration Management

**Strategy**: External configuration files (YAML/JSON) with environment variable overrides.

**Rationale**: Separation of code from configuration, easy adjustment without rebuilds.

## Anti-Patterns to Avoid

1. **Synchronous Blocking**: Node.js event loop must not be blocked
2. **Hardcoded Credentials**: Use environment variables + session persistence
3. **No Rate Limiting**: Steam enforcement risk without pacing
4. **Ignoring Trade Protection**: Attempting to use protected items causes failures
5. **No Error Recovery**: Single failures should not kill entire bot

## Topics Requiring Investigation/Specification During Implementation

The following areas require detailed investigation and pattern specification as implementation progresses:

### Authentication & Session Management
- Session token storage mechanisms (file format, encryption, rotation)
- Refresh token lifecycle management
- 2FA handling patterns
- Session invalidation detection and recovery

### Retry and Error Handling
- Exponential backoff implementation details
- Circuit breaker patterns for Steam API
- Error classification (retryable vs. fatal)
- Graceful degradation strategies

### EV Calculation Engine
- Algorithm selection (Monte Carlo vs. deterministic)
- Collection mixing probability calculations
- Fee modeling precision requirements
- Variance and risk scoring methodologies
- Price data staleness handling

### Float Value Optimization
- Input float averaging algorithms
- Output float prediction accuracy
- Optimal input selection strategies
- Edge case handling (unavailable float ranges)

### Market Data Scraping
- Steam Community Market API integration details
- Third-party marketplace API selection and integration
- Caching strategies and TTL optimization
- Rate limiting implementation
- Price data validation and anomaly detection

### Trade Protection Scheduling
- Queue persistence format
- Scheduling algorithm (priority, fairness, etc.)
- Item availability tracking
- Notification/alerting mechanisms

### Volume Limiting
- Counter persistence and atomicity
- Time-based reset logic (daily/monthly boundaries)
- Configurable limit enforcement
- Override mechanisms for testing

### Configuration Management
- Configuration file format and validation
- Environment variable precedence rules
- Hot-reload capability requirements
- Configuration versioning strategy

### Logging and Observability
- Log levels and structured logging format
- Metrics collection points
- Alert threshold definitions
- Performance profiling approach

### Testing Strategies
- Unit test patterns for async/event-driven code
- Integration test setup (mocking Steam APIs)
- End-to-end test scenarios
- Performance test criteria

## Pattern Evolution Strategy

This file will grow iteratively as implementation progresses:

**Phase 1 (Current)**: Architectural conclusions from technical design
**Phase 2 (Implementation)**: Add validated implementation patterns as they emerge
**Phase 3 (Refactoring)**: Document refactoring patterns and lessons learned
**Phase 4 (Optimization)**: Capture performance and optimization patterns

**Principle**: Document what is proven, not what is speculated.

---

**Philosophy**: "Validate through implementation, document what works, iterate what doesn't."
