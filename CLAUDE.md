# Dobble Generator - AI Assistant Instructions

## Project Overview
Dobble (Spot It!) card generator using advanced symbol placement algorithms. Built with React + TypeScript + Vite.

**Current Focus**: D3 front-chain circle packing algorithm implementation and quality optimization (see `.holicode/state/activeContext.md`).

## HoliCode Framework Integration

This project uses the **HoliCode framework** for structured, specification-driven development.

### Framework Core
**Full Framework**: `.clinerules/holicode.md` - Complete framework instructions and protocols

### Quick Start (Every Session)
1. **Load current context**:
   - `.holicode/state/activeContext.md` - Current focus and recent changes
   - `.holicode/state/progress.md` - Completion status and metrics
2. **Check pending work**: `.holicode/handoff/active/` for handoffs
3. **Use workflows**: Execute appropriate workflow from `.clinerules/workflows/` for complex operations

## Workflow Execution

### Available Workflows

**Core Workflows:**
- `/task-init.md` - Initialize task with proper mode selection
- `/state-update.md` - Update HoliCode state files
- `/state-health-check.md` - Validate state file integrity
- `/session-retrospective.md` - Capture session learnings

**Spec-Driven Development (5 Phases):**
- `/business-analyze.md` - Business context analysis → GitHub Epic
- `/functional-analyze.md` - Functional requirements → GitHub Stories
- `/technical-design.md` - Technical design → TD docs
- `/implementation-plan.md` - Implementation planning → GitHub Tasks
- `/task-implement.md` - Implementation execution → Code + Component SPECs

**Orchestration:**
- `/spec-workflow.md` - Full spec-driven development orchestrator
- `/orchestrate-story.md` - Story-level task coordination

**GitHub Integration:**
- `/github-issue-create.md` - Create GitHub issues (epic/story/task)
- `/github-pr-create.md` - Create pull requests
- `/github-sync.md` - Synchronize GitHub state

**Git Operations:**
- `/git-branch-manager.md` - Branch management
- `/git-commit-manager.md` - Semantic commits

**Analysis:**
- `/analyse-test-execution.md` - Test execution analysis
- `/spike-investigate.md` - Research spike investigations

### Workflow Invocation

**For Cline**: Follow existing workflow patterns (Workflow-Based Task creation)

**For Claude Code**: Use Task tool with subagent invocation (see workflow-specific sections in each workflow file)

## Project-Specific Context

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Core Logic**: TypeScript (strict mode)
- **Image Processing**: OpenCV.js
- **Testing**: Vitest (configured)
- **Build**: Vite (configured)

### GitHub Repository
- **Repo**: `ciekawy/dobble-generato`
- **Branch Strategy**: Feature branches with PR workflow
- **Issue Tracking**: GitHub Issues with labels (epic, story, task)

### Architecture Principles
1. **Logic/Presentation Separation**: All algorithms in `src/logic/`, React components are pure presentation
2. **Strategy Pattern**: Multiple placement algorithms with unified interface
3. **Configuration-Driven**: Behavior controlled through config objects
4. **Type Safety**: Strict TypeScript for all business logic

### Key Code Structure
```
src/
├── logic/
│   ├── placement/          # Symbol placement algorithms
│   │   ├── index.ts       # Algorithm dispatcher
│   │   ├── d3-front-chain-packing.ts
│   │   ├── hybrid-circle-packing.ts
│   │   └── geometry-utils.ts
│   ├── outline/           # Symbol processing
│   └── card-generation/   # Card generation logic
├── components/            # React UI components
├── types/                # TypeScript definitions
└── utils/                # Utilities

.holicode/
├── state/                # HoliCode memory bank
│   ├── activeContext.md  # Current focus
│   ├── progress.md       # Completion tracking
│   ├── projectbrief.md   # Project goals
│   ├── techContext.md    # Tech stack
│   └── systemPatterns.md # Architecture patterns
└── specs/                # Specifications
    ├── WORK_SPEC.md      # Manifest
    └── tasks/            # Task specs

.clinerules/
├── holicode.md           # Framework core
└── workflows/            # Workflow files
```

## Current Project Status

**Phase**: Implementation and optimization
**Active Work**: D3 front-chain packing algorithm with localStorage persistence
**Status**: Complete, ready for commit and testing

**Recent Completions**:
- ✅ D3 front-chain circle packing implementation
- ✅ localStorage configuration persistence
- ✅ Hexagonal grid placement (Option C)
- ✅ Geometry algorithm fixes (TASK-007 through TASK-010)

**Next Steps**: See `.holicode/state/activeContext.md` for detailed next steps

## Development Conventions

### Commit Messages
Follow Conventional Commits format (enforced by `/git-commit-manager.md`):
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Test additions/changes
- `chore:` - Tooling/config changes

### Code Style
- TypeScript strict mode enabled
- ESLint configured (see `eslint.config.js`)
- Prefer functional patterns
- Comprehensive JSDoc for complex functions

### Testing Strategy
- Unit tests for logic modules
- Integration tests for algorithm pipelines
- Target: >90% success rate for implemented features

## AI Assistant Guidelines

### Context Loading Strategy
1. **Always load first**: `activeContext.md` and `progress.md`
2. **Task-specific**: Use `/task-init.md` to determine additional context
3. **Hierarchical**: Load general project context first, drill down to specifics
4. **Token management**: Prioritize recent and relevant information

### Citation Requirements
- Cite source files when referencing project state
- Use format: `[filename.md]` for paraphrases, `"exact text" [filename.md]` for quotes
- Reference code locations: `file_path:line_number`

### Decision Protocol
- **Business decisions**: Require user approval
- **Technical decisions**: Require user approval (unless delegated)
- **Security/Reliability**: Always require review
- See `.clinerules/holicode.md` for full delegation protocol

### State Management
- Use workflows for state updates (not manual edits)
- Follow update order: `activeContext.md` → `retro-inbox.md` → `progress.md`
- Validate updates before proceeding

### GitHub Integration
- Primary: GitHub MCP tools (if available in Claude Code)
- Fallback: `gh` CLI commands
- Issues are single source of truth for task management
- Local specs for technical details only

## Cross-Runtime Compatibility

This CLAUDE.md is designed to work with both **Claude Code** and **Cline** AI assistants.

**Claude Code Specific**:
- Use Task tool for subagent workflow execution
- See "Claude Code Subagent Compatibility" sections in workflow files

**Cline Specific**:
- Continue using existing Workflow-Based Task pattern
- Ignore "Claude Code Subagent Compatibility" sections

## Getting Help

For questions about:
- **Framework**: Read `.clinerules/holicode.md`
- **Current work**: Read `.holicode/state/activeContext.md`
- **Project scope**: Read `.holicode/state/projectbrief.md`
- **Architecture**: Read `.holicode/state/systemPatterns.md`
- **Tech stack**: Read `.holicode/state/techContext.md`

## Workflow Self-Documentation

Each workflow file is self-contained and includes:
- **Agent Identity**: Role and responsibilities
- **DoR (Definition of Ready)**: Required inputs and validation
- **DoD (Definition of Done)**: Completion criteria
- **Process Steps**: Detailed execution instructions
- **Memory Bank Integration**: Files to read/update

Always read the full workflow file before execution.

## Wrapping Up Work & Creating PRs

### Before Creating a Pull Request

**Always update HoliCode state files** to reflect completed work:

1. **Update activeContext.md**:
   - Current focus and task status
   - Recent changes with details
   - Next steps for continuation

2. **Update retro-inbox.md**:
   - Key learnings and patterns discovered
   - Process improvements identified
   - Reusable solutions for future reference

3. **Update progress.md**:
   - Completion percentages
   - Milestone status
   - Phase completions

**State Update Order** (always):
```
activeContext.md → retro-inbox.md → progress.md
```

**Why This Matters**:
- Provides complete context for PR reviewers
- Preserves knowledge across sessions
- Maintains accurate project memory bank
- Helps next AI session understand current state

**Example Workflow**:
```bash
# After completing feature work:
1. Update .holicode/state/ files (activeContext, retro-inbox, progress)
2. Commit state updates: git commit -m "docs: update HoliCode state for [feature]"
3. Push to session branch
4. Create PR with updated state included
```

### Git Branch Strategy (Claude Code Web)

**Session Branch Restriction**: Claude Code web sessions can only push to branches ending with session ID:
- ✅ `claude/feature-name-<session-id>` - Works
- ❌ `main-claude` - Cannot push from web session (403 error)

**Recommended Workflow**:
1. Work on session branch: `claude/review-agentic-framework-workflow-01BogbGoqhidjtt2QkZ167A5`
2. Update HoliCode state before finishing
3. Push to session branch (works within session)
4. Create PR to `main-claude` (via GitHub UI or outside session)
5. Merge PR externally (desktop git or GitHub UI)

**For Periodic Updates from Main**:
```bash
# Merge updates from main into your working branch
git checkout claude/your-session-branch
git merge main
# Resolve conflicts if any
git push  # Push to session branch
```
