# Iteration 1 Implementation Orchestration Plan

**Created**: 2025-11-02  
**Status**: Active - Ready to Execute  
**Total Tasks**: 11 (across 4 phases)  
**Estimated Duration**: 21-30 hours (2-4 weeks)

## Overview

This document orchestrates the complete implementation of Iteration 1 (Walking Skeleton) using a PR-first workflow with feature branches per phase.

## Branch Strategy

**Feature Branches** (one per phase):
- `feat/phase1-infrastructure` → PR #1 (Foundation)
- `feat/phase2-authentication` → PR #2 (Authentication)
- `feat/phase3-automation` → PR #3 (Automation)
- `feat/phase4-validation` → PR #4 (Validation)

## Per-Task Requirements (ALL TASKS)

Every task implementation MUST include:
1. ✅ **Code Implementation**: Source code in `src/` with proper structure
2. ✅ **Component SPECs**: Create `src/**/SPEC.md` co-located with code
3. ✅ **Tests**: Unit tests with >80% coverage target
4. ✅ **State Updates**: Update `.holicode/state/activeContext.md` and `.holicode/state/progress.md`
5. ✅ **Manifest Update**: Update `.holicode/specs/WORK_SPEC.md` with completion status
6. ✅ **Commit**: Conventional commit format (`feat:`, `fix:`, `docs:`, etc.)

## Per-Phase Requirements (END OF EACH PHASE)

After all tasks in a phase are complete:
1. ✅ **Verify all phase tasks completed and committed**
2. ✅ **Run `/github-pr-create.md` workflow** to create PR
3. ✅ **Review and merge PR** (self-review or team review)

---

## Phase 1: Foundation (Story #8 - Docker Infrastructure)

**Branch**: `feat/phase1-infrastructure`  
**Tasks**: TASK-001, TASK-002, TASK-003  
**Estimated Duration**: 3-6 hours

### Step 1.1: Create Feature Branch

```bash
git checkout -b feat/phase1-infrastructure
```

### Step 1.2: TASK-001 - Initialize pnpm workspace

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-001 - Initialize pnpm workspace with TypeScript configuration

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/12

**Acceptance Criteria**:
- pnpm workspace initialized with package.json
- TypeScript configured (tsconfig.json, tsconfig.build.json)
- Basic directory structure created (src/, tests/, docs/)
- ESLint and Prettier configured
- All dependencies installable via `pnpm install`

**Key Resources**:
- State: .holicode/state/activeContext.md, .holicode/state/techContext.md
- Tech Stack: Node.js 24, pnpm, TypeScript
- Mitigation: .holicode/analyse/reports/mitigation-to-avoid-steam-ban-in-eductional-bot.md

**Component SPECs to Create**:
- src/infrastructure/SPEC.md (project infrastructure specification)

**Dependencies**: None (foundation task)
**Size**: XS (1 hour)
**Complexity Score**: 2/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement code and configuration
- [ ] Create Component SPEC: `src/infrastructure/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(infra): initialize pnpm workspace with TypeScript configuration`

---

### Step 1.3: TASK-002 - Create Docker infrastructure

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-002 - Create Docker infrastructure (Dockerfile + docker-compose)

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/13

**Acceptance Criteria**:
- Dockerfile created with Node.js 24 Alpine base
- docker-compose.yml with service definition and volumes
- Persistent volumes configured (/data for session/config)
- Environment variable support (.env.example template)
- Container builds successfully and runs bot process
- Development hot-reload working (volume mounts)

**Key Resources**:
- Tech Stack: .holicode/state/techContext.md (Docker + Alpine Linux)
- Mitigation: .holicode/analyse/reports/mitigation-to-avoid-steam-ban-in-eductional-bot.md
- Previous Task: TASK-001 (workspace must exist)

**Component SPECs to Update**:
- src/infrastructure/SPEC.md (add Docker deployment section)

**Dependencies**: TASK-001
**Size**: S (2 hours)
**Complexity Score**: 4/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement Dockerfile and docker-compose.yml
- [ ] Update Component SPEC: `src/infrastructure/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(infra): add Docker infrastructure with persistent volumes`

---

### Step 1.4: TASK-003 - Setup development tooling

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-003 - Setup development tooling and documentation

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/14

**Acceptance Criteria**:
- README.md with project overview and setup instructions
- Development scripts in package.json (dev, build, test, lint)
- Git hooks configured (pre-commit: lint + test)
- VS Code settings.json with recommended extensions
- CONTRIBUTING.md with development workflow guide

**Key Resources**:
- Project Brief: .holicode/state/projectbrief.md
- Tech Context: .holicode/state/techContext.md
- Previous Tasks: TASK-001, TASK-002

**Component SPECs to Update**:
- src/infrastructure/SPEC.md (add development tooling section)

**Dependencies**: TASK-001, TASK-002
**Size**: S (2 hours)
**Complexity Score**: 3/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement tooling and documentation
- [ ] Update Component SPEC: `src/infrastructure/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `docs(infra): add development tooling and documentation`

---

### Step 1.5: Create Phase 1 PR

**Workflow-Based Task Template**:
```
/github-pr-create.md

## Context: Phase 1 - Foundation PR

**Branch**: feat/phase1-infrastructure
**Base**: main

**PR Title**: feat: Phase 1 - Foundation Infrastructure (TASK-001, TASK-002, TASK-003)

**PR Description**:
Implements foundation infrastructure for CS2 Trade-Up Educational Bot:

**Tasks Completed**:
- [x] TASK-001: Initialize pnpm workspace with TypeScript configuration (#12)
- [x] TASK-002: Create Docker infrastructure (Dockerfile + docker-compose) (#13)
- [x] TASK-003: Setup development tooling and documentation (#14)

**Key Deliverables**:
- pnpm workspace with TypeScript
- Docker containerization (Node.js 24 Alpine)
- Development tooling (ESLint, Prettier, Git hooks)
- Project documentation (README, CONTRIBUTING)

**Testing**:
- [x] `pnpm install` succeeds
- [x] `pnpm lint` passes
- [x] `docker-compose build` succeeds
- [x] Container runs successfully

**Component SPECs**:
- src/infrastructure/SPEC.md (created)

**Story**: #8 - Docker Infrastructure & Project Setup
**Epic**: #2 - Core Automation Loop
```

**Per-Phase Actions**:
- [ ] Create Cline task with above template
- [ ] Create PR via `/github-pr-create.md` workflow
- [ ] Review PR (self-review or team review)
- [ ] Merge PR to main
- [ ] Delete feature branch after merge

---

## Phase 2: Authentication (Story #9 - Steam Authentication)

**Branch**: `feat/phase2-authentication`  
**Tasks**: TASK-004, TASK-005, TASK-006  
**Estimated Duration**: 6-9 hours

### Step 2.1: Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/phase2-authentication
```

### Step 2.2: TASK-004 - Steam authentication

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-004 - Implement Steam authentication with steam-user library

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/15

**Acceptance Criteria**:
- steam-user library integrated and functional
- Login flow with username/password via environment variables
- 2FA support (Steam Guard Mobile Authenticator codes)
- Connection error handling and retry logic (exponential backoff)
- Human-paced delays (30-60s) between auth attempts
- Successful authentication logs session details

**Key Resources**:
- Tech Stack: .holicode/state/techContext.md (steam-user library)
- Mitigation: .holicode/analyse/reports/mitigation-to-avoid-steam-ban-in-eductional-bot.md (CRITICAL - rate limiting, human pacing)

**Component SPECs to Create**:
- src/auth/SPEC.md (authentication service specification)

**Dependencies**: TASK-002 (Docker environment)
**Size**: M (3 hours)
**Complexity Score**: 6/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement Steam authentication
- [ ] Create Component SPEC: `src/auth/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(auth): implement Steam authentication with steam-user`

---

### Step 2.3: TASK-005 - Session persistence

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-005 - Implement session persistence and token management

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/16

**Acceptance Criteria**:
- Session tokens saved to /data/session.json (persistent volume)
- Automatic session restoration on container restart (no re-login)
- Token refresh logic before expiration
- Secure file permissions (read/write for bot only)
- Session invalidation detection and re-auth trigger

**Key Resources**:
- Mitigation: .holicode/analyse/reports/mitigation-to-avoid-steam-ban-in-eductional-bot.md (session persistence reduces auth frequency)
- Previous Task: TASK-004 (authentication must work)

**Component SPECs to Update**:
- src/auth/SPEC.md (add session persistence section)

**Dependencies**: TASK-004
**Size**: S (2 hours)
**Complexity Score**: 5/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement session persistence
- [ ] Update Component SPEC: `src/auth/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(auth): add session persistence with token management`

---

### Step 2.4: TASK-006 - Rate limiting and error handling

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-006 - Add rate limiting and error handling for authentication

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/17

**Acceptance Criteria**:
- Human-paced delays enforced (30-300s randomized)
- Exponential backoff for failed auth attempts (max 5 retries)
- Rate limiter tracks daily/monthly auth attempts
- Detailed error logging (with error codes)
- Graceful shutdown on critical auth failures

**Key Resources**:
- Mitigation: .holicode/analyse/reports/mitigation-to-avoid-steam-ban-in-eductional-bot.md (CRITICAL - must mimic human behavior)

**Component SPECs to Update**:
- src/auth/SPEC.md (add rate limiting and error handling sections)

**Dependencies**: TASK-004
**Size**: S (2 hours)
**Complexity Score**: 5/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement rate limiting and error handling
- [ ] Update Component SPEC: `src/auth/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(auth): add rate limiting and comprehensive error handling`

---

### Step 2.5: Create Phase 2 PR

**Workflow-Based Task Template**:
```
/github-pr-create.md

## Context: Phase 2 - Authentication PR

**Branch**: feat/phase2-authentication
**Base**: main

**PR Title**: feat: Phase 2 - Steam Authentication & Session Management (TASK-004, TASK-005, TASK-006)

**PR Description**:
Implements Steam authentication with session persistence and rate limiting:

**Tasks Completed**:
- [x] TASK-004: Steam authentication with steam-user library (#15)
- [x] TASK-005: Session persistence and token management (#16)
- [x] TASK-006: Rate limiting and error handling (#17)

**Key Deliverables**:
- Steam login with 2FA support
- Session token persistence (/data/session.json)
- Human-paced delays (30-300s)
- Exponential backoff for failures
- Comprehensive error handling

**Testing**:
- [x] Successful authentication with valid credentials
- [x] Session restoration after container restart
- [x] Rate limiting enforced (human-paced delays)
- [x] Error handling for invalid credentials

**Steam Ban Mitigation**:
- ✅ Human-paced delays implemented (30-300s randomized)
- ✅ Rate limiting tracks auth attempts
- ✅ Session persistence reduces re-auth frequency

**Component SPECs**:
- src/auth/SPEC.md (created)

**Story**: #9 - Steam Authentication & Session Management
**Epic**: #2 - Core Automation Loop
```

**Per-Phase Actions**:
- [ ] Create Cline task with above template
- [ ] Create PR via `/github-pr-create.md` workflow
- [ ] Review PR
- [ ] Merge PR to main
- [ ] Delete feature branch

---

## Phase 3: Automation (Story #10 - GC Protocol & Trade-Up)

**Branch**: `feat/phase3-automation`  
**Tasks**: TASK-007, TASK-008, TASK-009  
**Estimated Duration**: 6-9 hours

### Step 3.1: Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/phase3-automation
```

### Step 3.2: TASK-007 - GC protocol connection

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-007 - Implement GC protocol connection and inventory retrieval

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/18

**Acceptance Criteria**:
- node-globaloffensive library integrated
- CS2 Game Coordinator connection established
- Inventory retrieval working (CS2 items fetched)
- Connection state management (connected/disconnected events)
- Automatic reconnection on disconnects

**Key Resources**:
- Tech Stack: .holicode/state/techContext.md (node-globaloffensive library)
- Previous Tasks: TASK-004, TASK-005 (auth must be working)

**Component SPECs to Create**:
- src/gamecoordinator/SPEC.md (GC protocol service specification)

**Dependencies**: TASK-005 (session must persist)
**Size**: M (3 hours)
**Complexity Score**: 7/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement GC protocol connection
- [ ] Create Component SPEC: `src/gamecoordinator/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(gc): implement GC protocol connection and inventory retrieval`

---

### Step 3.3: TASK-008 - Trade-up execution

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-008 - Implement trade-up execution with craft() method

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/19

**Acceptance Criteria**:
- craft() method implemented with 10 asset ID inputs
- Trade-up result capture (item received, float value)
- Trade Protection detection (7-day hold warning)
- Transaction logging (inputs, output, timestamp)
- Error handling for invalid inputs or failed crafts

**Key Resources**:
- Previous Task: TASK-007 (GC connection must work)

**Component SPECs to Update**:
- src/gamecoordinator/SPEC.md (add trade-up execution section)

**Dependencies**: TASK-007
**Size**: M (3 hours)
**Complexity Score**: 8/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement trade-up execution
- [ ] Update Component SPEC: `src/gamecoordinator/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(gc): implement trade-up execution with craft() method`

---

### Step 3.4: TASK-009 - Human-paced delays

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-009 - Add human-paced delays and rate limiting for automation

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/20

**Acceptance Criteria**:
- Randomized delays between trade-ups (30-300s)
- Daily/monthly volume limits enforced (12-100 crafts/month)
- Volume tracking persisted to /data/volume.json
- Delay configuration via environment variables
- Log warnings when approaching limits

**Key Resources**:
- Mitigation: .holicode/analyse/reports/mitigation-to-avoid-steam-ban-in-eductional-bot.md (CRITICAL - human pacing required)

**Component SPECs to Update**:
- src/gamecoordinator/SPEC.md (add rate limiting section)

**Dependencies**: TASK-008
**Size**: S (2 hours)
**Complexity Score**: 4/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement human-paced delays
- [ ] Update Component SPEC: `src/gamecoordinator/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `feat(gc): add human-paced delays and volume limiting`

---

### Step 3.5: Create Phase 3 PR

**Workflow-Based Task Template**:
```
/github-pr-create.md

## Context: Phase 3 - Automation PR

**Branch**: feat/phase3-automation
**Base**: main

**PR Title**: feat: Phase 3 - GC Protocol & Trade-Up Automation (TASK-007, TASK-008, TASK-009)

**PR Description**:
Implements CS2 Game Coordinator protocol and trade-up automation:

**Tasks Completed**:
- [x] TASK-007: GC protocol connection and inventory retrieval (#18)
- [x] TASK-008: Trade-up execution with craft() method (#19)
- [x] TASK-009: Human-paced delays and rate limiting (#20)

**Key Deliverables**:
- GC protocol connection (node-globaloffensive)
- Inventory retrieval (CS2 items)
- Trade-up execution (craft() method)
- Human-paced delays (30-300s randomized)
- Volume limiting (12-100 crafts/month)

**Testing**:
- [x] GC connection established successfully
- [x] Inventory retrieval works
- [x] Trade-up execution completes (with test items)
- [x] Human-paced delays enforced
- [x] Volume tracking persisted

**Steam Ban Mitigation**:
- ✅ Human-paced delays (30-300s) between trade-ups
- ✅ Volume limits enforced (12-100/month)
- ✅ Volume tracking persisted to /data/volume.json

**Component SPECs**:
- src/gamecoordinator/SPEC.md (created)

**Story**: #10 - GC Protocol & Trade-Up Execution
**Epic**: #2 - Core Automation Loop
```

**Per-Phase Actions**:
- [ ] Create Cline task with above template
- [ ] Create PR via `/github-pr-create.md` workflow
- [ ] Review PR
- [ ] Merge PR to main
- [ ] Delete feature branch

---

## Phase 4: Validation (Story #11 - PoC Validation)

**Branch**: `feat/phase4-validation`  
**Tasks**: TASK-010, TASK-011  
**Estimated Duration**: 6-6 hours

### Step 4.1: Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/phase4-validation
```

### Step 4.2: TASK-010 - E2E validation tests

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-010 - Execute end-to-end validation tests

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/21

**Acceptance Criteria**:
- E2E test suite created (authentication → GC → trade-up)
- Docker container smoke test (build + run)
- Session persistence validation test
- Trade-up execution validation (mock or real)
- Test coverage report generated (>80% target)
- CI/CD configuration (GitHub Actions or similar)

**Key Resources**:
- All previous tasks (complete system validation)

**Component SPECs to Create**:
- tests/SPEC.md (test strategy and coverage specification)

**Dependencies**: TASK-009 (all automation must be complete)
**Size**: M (4 hours)
**Complexity Score**: 6/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Implement E2E validation tests
- [ ] Create Component SPEC: `tests/SPEC.md`
- [ ] Update state files
- [ ] Update WORK_SPEC.md
- [ ] Commit: `test: add E2E validation tests and CI configuration`

---

### Step 4.3: TASK-011 - Validation report

**Workflow-Based Task Template**:
```
/task-implement.md

## Context: TASK-011 - Create technical validation report and troubleshooting guide

**GitHub Issue**: https://github.com/ciekawy/cs-tradeup-automation/issues/22

**Acceptance Criteria**:
- Technical validation report created (.holicode/analyse/reports/poc-validation-report.md)
- Report includes: test results, performance metrics, lessons learned
- Troubleshooting guide with common issues and solutions
- Deployment guide for local + VPS environments
- Known limitations documented
- Next steps / Iteration 2 recommendations

**Key Resources**:
- All previous tasks (complete project context)
- Project Brief: .holicode/state/projectbrief.md

**Component SPECs to Update**:
- tests/SPEC.md (add validation report section)

**Dependencies**: TASK-010
**Size**: S (2 hours)
**Complexity Score**: 3/10
```

**Per-Task Actions**:
- [ ] Create Cline task with above template
- [ ] Create validation report and documentation
- [ ] Update Component SPEC: `tests/SPEC.md`
- [ ] Update state files (mark Iteration 1 COMPLETE)
- [ ] Update WORK_SPEC.md
- [ ] Commit: `docs: add PoC validation report and troubleshooting guide`

---

### Step 4.4: Create Phase 4 PR

**Workflow-Based Task Template**:
```
/github-pr-create.md

## Context: Phase 4 - Validation PR

**Branch**: feat/phase4-validation
**Base**: main

**PR Title**: test/docs: Phase 4 - PoC Validation & Documentation (TASK-010, TASK-011)

**PR Description**:
Implements end-to-end validation tests and PoC validation documentation:

**Tasks Completed**:
- [x] TASK-010: E2E validation tests and CI configuration (#21)
- [x] TASK-011: Technical validation report and troubleshooting guide (#22)

**Key Deliverables**:
- E2E test suite (authentication → GC → trade-up)
- Test coverage report (>80%)
- CI/CD configuration (GitHub Actions)
- PoC validation report (.holicode/analyse/reports/poc-validation-report.md)
- Troubleshooting guide with common issues
- Deployment guide (local + VPS)

**Testing**:
- [x] E2E tests pass successfully
- [x] Docker smoke tests pass
- [x] Test coverage >80%
- [x] CI pipeline passes

**Documentation**:
- ✅ PoC validation report complete
- ✅ Troubleshooting guide complete
- ✅ Known limitations documented
- ✅ Iteration 2 recommendations provided

**Component SPECs**:
- tests/SPEC.md (created)

**Story**: #11 - PoC Validation - End-to-End Testing & Documentation
**Epic**: #3 - PoC Validation

**🎉 Iteration 1 (Walking Skeleton) COMPLETE!**
```

**Per-Phase Actions**:
- [ ] Create Cline task with above template
- [ ] Create PR via `/github-pr-create.md` workflow
- [ ] Review PR
- [ ] Merge PR to main
- [ ] Delete feature branch
- [ ] **Celebrate Iteration 1 completion!** 🎉

---

## Final State Updates

After Phase 4 PR is merged, update state files to reflect completion:

### Update .holicode/state/progress.md

Mark Iteration 1 as 100% complete:
- Phase 7: Core Automation Implementation → ✅ Complete (100%)
- Update component status table (all core components implemented)

### Update .holicode/state/activeContext.md

Update current focus:
- Iteration 1 (Walking Skeleton) complete
- Ready for Iteration 2 planning (Full-Cycle Automation)
- Document key learnings from implementation

### Update .holicode/specs/WORK_SPEC.md

Mark all tasks #12-#22 as completed with links to merged PRs.

---

## Success Metrics

**Iteration 1 Complete When**:
- ✅ All 11 tasks (#12-#22) implemented and merged
- ✅ All 4 PRs created, reviewed, and merged
- ✅ Walking skeleton works end-to-end (auth → GC → trade-up)
- ✅ Steam ban mitigation measures implemented (human pacing, rate limiting)
- ✅ Component SPECs created for all major components
- ✅ Test coverage >80%
- ✅ PoC validation report complete
- ✅ State files updated to reflect completion

---

## Important Reminders

1. **Steam Ban Mitigation**: ALWAYS implement human-paced delays (30-300s) and volume limits
2. **Component SPECs**: Create/update SPECs for every component during implementation
3. **State Updates**: Update activeContext.md and progress.md after EVERY task
4. **Conventional Commits**: Use semantic commit messages (feat:, fix:, docs:, test:)
5. **PR Reviews**: Self-review or team review before merging
6. **Test First**: Ensure tests pass before creating PRs

---

**Next Action**: Create first Cline task for TASK-001 using the template in Step 1.2 above.
