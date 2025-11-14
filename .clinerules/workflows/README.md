# HoliCode Workflows - Quick Reference

## Overview

This directory contains HoliCode framework workflows. Each workflow is self-contained with DoR/DoD validation and can be executed by AI assistants (Cline or Claude Code).

## Cross-Runtime Compatibility

All workflows support both:
- **Cline**: Workflow-Based Task pattern (user creates tasks manually)
- **Claude Code**: Subagent invocation via Task tool (automated)

Workflows with "🤖 Claude Code Subagent Compatibility" sections include specific instructions for Claude Code. Cline users can ignore these sections.

## Workflow Categories

### Core Workflows
Foundational workflows for project setup and maintenance.

| Workflow | Purpose | Execution Mode | State Updates |
|----------|---------|----------------|---------------|
| `state-init.md` | Initialize HoliCode structure | Standalone | Self-managed |
| `state-update.md` | Update HoliCode state files | Standalone | Self-managed |
| `state-review.md` | Review state file accuracy | Standalone | Self-managed |
| `state-health-check.md` | Validate state integrity | Standalone | Interactive |
| `task-init.md` | Initialize task context | Standalone | Self-managed |
| `session-retrospective.md` | Capture session learnings | Standalone | Self-managed |

### Spec-Driven Development Workflows (5 Phases)

The main development workflow follows this sequence:

```
Business → Functional → Technical → Implementation → Implementation
Analyze    Analyze      Design     Planning         Execution
   ↓          ↓            ↓           ↓                ↓
 Epic     Stories        TDs       Tasks            Code
```

| Phase | Workflow | Output | GitHub Artifact | Execution Mode | State Updates |
|-------|----------|--------|-----------------|----------------|---------------|
| 1. Business | `business-analyze.md` | Feature chunk | Epic issue | Interactive | Self or Deferred* |
| 2. Functional | `functional-analyze.md` | User stories | Story issues | Interactive | Self or Deferred* |
| 3. Technical | `technical-design.md` | TD documents | TD summary issues | Interactive | Deferred* |
| 4. Planning | `implementation-plan.md` | Task specs | Task issues | Autonomous | Deferred* |
| 5. Implementation | `task-implement.md` | Code + SPECs | Updates tasks | Autonomous | Self-managed |

\* **State Update Strategy**:
- **Self-managed**: When run standalone
- **Deferred**: When run as part of `spec-workflow.md` orchestration

### Orchestration Workflows

Meta-workflows that coordinate multi-phase operations.

| Workflow | Purpose | Phases Coordinated | State Updates |
|----------|---------|-------------------|---------------|
| `spec-workflow.md` | Full spec-driven development | All 5 phases | Self-managed (coordinates children) |
| `orchestrate-story.md` | Story-level task execution | Implementation phase | Self-managed |

### GitHub Integration Workflows

Workflows for GitHub operations (issues, PRs, sync).

| Workflow | Purpose | Execution Mode | State Updates |
|----------|---------|----------------|---------------|
| `github-issue-create.md` | Create GitHub issues (epic/story/task) | Autonomous | Minimal |
| `github-pr-create.md` | Create pull requests | Autonomous | Minimal |
| `github-pr-update.md` | Update pull requests | Autonomous | Minimal |
| `github-pr-review.md` | Review pull requests | Interactive | Minimal |
| `github-sync.md` | Sync GitHub state to HoliCode | Autonomous | Self-managed |
| `github-cache.md` | Cache GitHub issues locally | Autonomous | No state updates |

### Git Operations Workflows

Workflows for Git branch and commit management.

| Workflow | Purpose | Execution Mode | State Updates |
|----------|---------|----------------|---------------|
| `git-branch-manager.md` | Create/switch/delete branches | Autonomous | No state updates |
| `git-commit-manager.md` | Create semantic commits | Autonomous | No state updates |

### Analysis & Investigation Workflows

Workflows for research, analysis, and troubleshooting.

| Workflow | Purpose | Execution Mode | State Updates |
|----------|---------|----------------|---------------|
| `analyse-test-execution.md` | Analyze test failures | Interactive | Creates reports |
| `spike-investigate.md` | Research spike investigations | Interactive | Creates reports |
| `context-verify.md` | Verify context accuracy | Interactive | Self-managed |
| `tech-review-post-planning.md` | Post-planning tech review | Interactive | Self-managed |

### Quality & Validation Workflows

Workflows for quality assurance and validation.

| Workflow | Purpose | Execution Mode | State Updates |
|----------|---------|----------------|---------------|
| `quality-validate.md` | Validate implementation quality | Autonomous | Self-managed |
| `framework-integration-test.md` | Test framework integration | Autonomous | Creates reports |

### Handoff & Coordination Workflows

Workflows for team coordination and handoffs.

| Workflow | Purpose | Execution Mode | State Updates |
|----------|---------|----------------|---------------|
| `task-handoff.md` | Create handoff between sessions | Autonomous | Creates handoff |
| `analysis-to-task.md` | Convert analysis to tasks | Autonomous | Updates specs |

### Framework Setup Workflows

Workflows for setting up the HoliCode framework itself.

| Workflow | Purpose | Execution Mode | State Updates |
|----------|---------|----------------|---------------|
| `framework-setup.md` | Setup HoliCode framework | Standalone | Self-managed |

## State Update Patterns

### Self-Managed State Updates
Workflow directly updates `.holicode/state/` files.

**When to use**:
- Workflow runs standalone (not part of orchestration)
- Workflow is the primary owner of specific state
- No parallel execution expected

**Examples**: `task-implement.md`, `state-update.md`, `github-sync.md`

### Deferred State Updates
Workflow creates output artifacts, parent orchestrator updates state.

**When to use**:
- Workflow is part of multi-phase orchestration
- Multiple parallel workflows might create conflicts
- Parent needs to validate/consolidate outputs

**Examples**: When `spec-workflow.md` invokes `technical-design.md`, `implementation-plan.md`

## Execution Modes

### Autonomous
Workflow can complete fully without human interaction.

**Characteristics**:
- All inputs provided via context
- Follows documented defaults for decisions
- Output is deterministic
- Suitable for subagent execution

**Examples**: `implementation-plan.md`, `task-implement.md`, `github-issue-create.md`

### Interactive
Workflow may require human decisions during execution.

**Characteristics**:
- May ask clarifying questions
- Multiple valid approaches exist
- Business/technical approvals may be needed
- May pause for user input

**Examples**: `business-analyze.md`, `functional-analyze.md`, `technical-design.md`

### Standalone
Workflow designed to run independently (not as part of larger orchestration).

**Characteristics**:
- Complete DoR/DoD validation built-in
- Self-contained context requirements
- Updates state files directly
- User-invoked (not workflow-invoked)

**Examples**: `state-init.md`, `state-health-check.md`, `session-retrospective.md`

## Workflow Invocation Patterns

### Cline Invocation (Workflow-Based Task)

User creates a new task with workflow reference:

```markdown
/technical-design.md

Context:
- Feature: User Authentication
- Epic: #123
- Stories: .holicode/specs/features/FEATURE-auth/USER_STORIES.md

Required reading:
- .holicode/state/activeContext.md
- .holicode/state/techContext.md
- .holicode/specs/features/FEATURE-auth.md
```

### Claude Code Invocation (Subagent)

Parent workflow or user launches subagent:

```markdown
<Task tool>
subagent_type: "general-purpose"
description: "Generate technical design"
prompt: """
Execute: `.clinerules/workflows/technical-design.md`

Context:
- Feature: User Authentication
- Epic: #123

Required reading:
- [list of files]

[Detailed instructions from workflow's Claude Code section]
"""
```

## Parallel Execution Support

### Parallel-Safe Workflows
Can be executed in parallel without conflicts:

- `task-implement.md` (on different components)
- `functional-analyze.md` (on different stories)
- `technical-design.md` (on different features)
- `github-issue-create.md` (creating different issues)

**Coordination**: Parent orchestrator collects outputs and updates state atomically.

### Sequential-Only Workflows
Must be executed sequentially:

- `spec-workflow.md` (coordinates phases)
- `state-init.md` (initializes structure)
- `git-commit-manager.md` (creates commits)

## Workflow DoR/DoD Summary

Each workflow includes:

### Definition of Ready (DoR)
- **Required inputs**: What must exist before workflow can run
- **Context files**: Which `.holicode/state/` files to load
- **Pre-flight validation**: Checks to perform before starting
- **GitHub artifacts**: Required issues/PRs (if applicable)

### Definition of Done (DoD)
- **Output artifacts**: What files/specs are created
- **State updates**: Which state files are updated (or what's reported)
- **Quality gates**: Validation criteria for completion
- **Next workflow**: Recommended next step

## Quick Decision Tree

**Starting a new feature?**
→ Use `spec-workflow.md` for full orchestration
→ Or start with `business-analyze.md` for manual phase-by-phase

**Implementing a specific task?**
→ Use `task-implement.md`

**Need to sync with GitHub?**
→ Use `github-sync.md` or `github-issue-create.md`

**Setting up a new project?**
→ Use `state-init.md`

**Reviewing/validating state?**
→ Use `state-health-check.md` or `context-verify.md`

**Creating a handoff?**
→ Use `task-handoff.md`

**Analyzing test failures?**
→ Use `analyse-test-execution.md`

**Investigating unknowns?**
→ Use `spike-investigate.md`

## Claude Code Adaptation Status

Workflows marked with ✅ have been fully adapted for Claude Code subagent use.

**Adapted**:
- ✅ `technical-design.md` (example in `technical-design-example-adaptation.md`)

**To Be Adapted** (use integration guide):
- [ ] All other workflows (follow `.clinerules/claude-code-integration.md`)

**Adaptation Guide**: See `.clinerules/claude-code-integration.md` for complete instructions.

## See Also

- **Framework Core**: `.clinerules/holicode.md`
- **Claude Code Entry**: `CLAUDE.md` (project root)
- **Integration Guide**: `.clinerules/claude-code-integration.md`
- **Example Adaptation**: `.clinerules/workflows/technical-design-example-adaptation.md`
