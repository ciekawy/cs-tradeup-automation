# Work Specification: CS2 Trade-Up Educational Bot

**Status:** active  
**Created:** 2025-11-02  
**Last Updated:** 2025-11-02  
**Total Context Size:** <2KB (optimized for AI context loading)

## ⚠️ IMPORTANT: GitHub is Primary Source
**This file is a LOCAL CACHE of GitHub issue state.**
- GitHub Issues are the single source of truth for all task management
- Run `/github-sync.md` to update this cache from GitHub
- All task creation, updates, and tracking happens in GitHub
- Local specs in `.holicode/specs/` are for technical details only

## Project Overview
Educational automation platform demonstrating CS2 skin trading mechanics through full-cycle trade-up automation, with comprehensive education on trading economics, risk management, and the competitive landscape.

## Features (GitHub Epics)
<!-- GitHub Epics linked here by github-sync workflow -->
- [EPIC 1: Manual Prerequisites](https://github.com/ciekawy/cs-tradeup-automation/issues/1) - Essential manual foundation (Steam account, 2FA, API keys)
- [EPIC 2: Core Automation Loop](https://github.com/ciekawy/cs-tradeup-automation/issues/2) - Walking skeleton (Steam auth, GC protocol, single trade-up)
- [EPIC 3: PoC Validation](https://github.com/ciekawy/cs-tradeup-automation/issues/3) - End-to-end validation and technical proof
- [EPIC 4: Full-Cycle Automation](https://github.com/ciekawy/cs-tradeup-automation/issues/4) - Complete automation (EV calc, float opt, buy/sell integration)
- [EPIC 5: Risk Management](https://github.com/ciekawy/cs-tradeup-automation/issues/5) - Safety controls (volume limits, rate limiting, monitoring)
- [EPIC 6: Educational Content](https://github.com/ciekawy/cs-tradeup-automation/issues/6) - Comprehensive documentation and risk disclosures

## Active Stories (GitHub Issues)
<!-- GitHub Stories linked here by github-sync workflow -->
- [STORY: Steam Test Account Setup with Security & Mitigation](https://github.com/ciekawy/cs-tradeup-automation/issues/7) (Epic: #1 - Manual Prerequisites)
- [STORY: Docker Infrastructure & Project Setup](https://github.com/ciekawy/cs-tradeup-automation/issues/8) (Epic: #2 - Core Automation Loop)
- [STORY: Steam Authentication & Session Management](https://github.com/ciekawy/cs-tradeup-automation/issues/9) (Epic: #2 - Core Automation Loop)
- [STORY: GC Protocol & Trade-Up Execution](https://github.com/ciekawy/cs-tradeup-automation/issues/10) (Epic: #2 - Core Automation Loop)
- [STORY: PoC Validation - End-to-End Testing & Documentation](https://github.com/ciekawy/cs-tradeup-automation/issues/11) (Epic: #3 - PoC Validation)

## Current Tasks (GitHub Issues)
<!-- GitHub Tasks linked here by github-sync workflow -->

### Story #8: Docker Infrastructure & Project Setup
- ✅ [TASK-001: Initialize pnpm workspace with TypeScript configuration](https://github.com/ciekawy/cs-tradeup-automation/issues/12) (Story: #8) - **COMPLETE** (890b15f)
- [TASK-002: Create Docker infrastructure (Dockerfile + docker-compose)](https://github.com/ciekawy/cs-tradeup-automation/issues/13) (Story: #8)
- [TASK-003: Setup development tooling and documentation](https://github.com/ciekawy/cs-tradeup-automation/issues/14) (Story: #8)

### Story #9: Steam Authentication & Session Management
- [TASK-004: Implement Steam authentication with steam-user library](https://github.com/ciekawy/cs-tradeup-automation/issues/15) (Story: #9)
- [TASK-005: Implement session persistence and token management](https://github.com/ciekawy/cs-tradeup-automation/issues/16) (Story: #9)
- [TASK-006: Add rate limiting and error handling](https://github.com/ciekawy/cs-tradeup-automation/issues/17) (Story: #9)

### Story #10: GC Protocol & Trade-Up Execution
- [TASK-007: Implement GC protocol connection and inventory retrieval](https://github.com/ciekawy/cs-tradeup-automation/issues/18) (Story: #10)
- [TASK-008: Implement trade-up execution with craft() method](https://github.com/ciekawy/cs-tradeup-automation/issues/19) (Story: #10)
- [TASK-009: Add human-paced delays and rate limiting](https://github.com/ciekawy/cs-tradeup-automation/issues/20) (Story: #10)

### Story #11: PoC Validation - End-to-End Testing & Documentation
- [TASK-010: Execute end-to-end validation tests](https://github.com/ciekawy/cs-tradeup-automation/issues/21) (Story: #11)
- [TASK-011: Create technical validation report and troubleshooting guide](https://github.com/ciekawy/cs-tradeup-automation/issues/22) (Story: #11)

## Technical Design Documents (GitHub Issues & Local Files)
<!-- GitHub TD Issues linked here by github-sync workflow -->
<!-- Example: - [TD-001: System Architecture Overview](https://github.com/holagence/holicode/issues/126) (Local: .holicode/specs/technical-design/TD-001.md) -->

## Implementation Status
<!-- Component references as they are implemented -->
### Completed Components

### In Progress Components

### Planned Components

## Hierarchy Map
<!-- Visual representation of chunk relationships for quick navigation -->
```
├── GitHub Epic (Business Value)
│   ├── GitHub Story (User Requirements)
│   │   └── GitHub Task (Implementation Work)
│   │       └── Component SPECs (Live Implementation Specs)
└── GitHub TD Issue (Technical Design)
    └── Local TD File (Detailed Design)
```

## Context Optimization Notes
- **GitHub First**: All tasks are primarily managed in GitHub Issues
- **Local Cache**: This file is a reference cache updated by `/github-sync.md`
- **Component SPECs**: Technical contracts remain co-located with code in `src/**/SPEC.md`
- **Offline Support**: Use `/github-cache.md` for explicit offline work

## Validation Status
- [ ] All chunks validate against .holicode/specs/SCHEMA.md
- [ ] Hierarchical links resolve correctly
- [ ] No orphaned specifications
- [ ] Component SPECs exist for all referenced components

---
*This manifest is a LOCAL CACHE maintained by HoliCode workflows.*
*GitHub Issues are the PRIMARY source - run `/github-sync.md` to refresh.*
*For offline work, use `/github-cache.md` to cache GitHub data locally.*
