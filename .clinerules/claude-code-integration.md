# Claude Code Integration Guide

## Overview

This guide explains how HoliCode workflows are adapted for **Claude Code** while maintaining full compatibility with **Cline**.

## Cross-Runtime Design Principle

HoliCode workflows are designed to work with multiple AI runtimes:
- **Cline**: Uses Workflow-Based Task pattern (manual task creation by user)
- **Claude Code**: Uses Task tool with subagent invocation (automated subagent launching)

**Key Strategy**: Add optional "Claude Code Subagent Compatibility" sections that Cline users can safely ignore.

## Workflow Adaptation Template

Add this section to each workflow file after the "Agent Identity" section:

```markdown
## 🤖 Claude Code Subagent Compatibility

> **NOTE FOR CLINE USERS**: This section is for Claude Code subagent invocation only.
> If you're using Cline, ignore this section and continue with normal Workflow-Based Task pattern.

**Subagent Type**: `general-purpose`
**Execution Mode**: `Autonomous` / `Interactive`
**State Update**: `Deferred to parent` / `Self-managed`

### DoR - Required Context Files
Before executing as subagent, ensure these files are loaded:
- [ ] `.clinerules/holicode.md` (framework core)
- [ ] `.holicode/state/activeContext.md` (current focus)
- [ ] `.holicode/state/progress.md` (completion status)
- [ ] [workflow-specific requirements]

### Output Artifacts
This workflow creates:
- **Primary**: [main deliverables with paths]
- **State updates needed**: [what parent orchestrator should update]
- **Next workflow**: [suggested next step]

### Claude Code Invocation Template

For Claude Code users, invoke this workflow as a subagent:

\`\`\`markdown
<Task tool invocation>
subagent_type: "general-purpose"
description: "[Brief workflow description]"
prompt: """
Execute HoliCode workflow: `.clinerules/workflows/[this-workflow].md`

**Context**:
- [Specific context for this execution]
- [Input artifacts or state]

**Required Reading (DoR)**:
- `.clinerules/workflows/[this-workflow].md` (the workflow itself)
- `.holicode/state/activeContext.md`
- `.holicode/state/progress.md`
- [other required files]

**Workflow Execution**:
Follow ALL steps in the workflow file, including:
1. DoR validation
2. Execution phases
3. DoD validation
4. Create output artifacts (but defer state updates to parent)

**Output Format**:
Return a concise summary containing:
- Output artifacts created (with paths)
- Key decisions made
- State updates needed (for parent to apply)
- Next recommended workflow (if any)
- Any blockers or issues encountered
"""
\`\`\`

### State Update Coordination

**Subagent Responsibility**:
- Create output artifacts (specs, docs, code)
- Report what state updates are needed

**Parent Orchestrator Responsibility**:
- Validate subagent output
- Update shared state files atomically:
  1. `activeContext.md` (narrative)
  2. `retro-inbox.md` (learnings)
  3. `progress.md` (metrics)
- Update `WORK_SPEC.md` manifest
```

## Execution Mode Classification

### Autonomous Mode
Workflow can complete fully without human interaction:
- All inputs provided via context
- Decisions follow documented defaults
- Output is deterministic

**Examples**: `technical-design.md`, `implementation-plan.md`

### Interactive Mode
Workflow may require human decisions during execution:
- Ambiguous requirements need clarification
- Multiple valid approaches exist
- Business/technical approvals needed

**Examples**: `business-analyze.md`, `functional-analyze.md`

## State Update Patterns

### Self-Managed State Updates
Workflow directly updates state files (used for standalone execution):
```markdown
**State Update**: Self-managed

This workflow updates:
- `.holicode/state/activeContext.md` (current focus)
- `.holicode/state/progress.md` (completion status)
- `.holicode/state/retro-inbox.md` (learnings)
```

### Deferred State Updates
Workflow reports changes, parent orchestrator applies them (prevents conflicts):
```markdown
**State Update**: Deferred to parent

This workflow creates output artifacts but does NOT update shared state.
Parent orchestrator must update:
- `activeContext.md` with [specific updates]
- `progress.md` with [completion metrics]
- `retro-inbox.md` with [learnings]
```

**When to defer**:
- Workflow is part of multi-phase orchestration
- Multiple parallel workflows might create conflicts
- Parent orchestrator needs to coordinate updates

**When to self-manage**:
- Workflow runs standalone
- No parallel execution expected
- User invokes directly (not via orchestrator)

## Example: task-implement.md Adaptation

Here's how the adaptation looks in practice:

```markdown
# Task Implementation Workflow (Generic Implementation Engine)

## Agent Identity
Role: Generic implementation engine that transforms specifications into working code
[... rest of agent identity section ...]

## 🤖 Claude Code Subagent Compatibility

> **NOTE FOR CLINE USERS**: This section is for Claude Code only.
> If using Cline, ignore this section and follow Workflow-Based Task pattern.

**Subagent Type**: `general-purpose`
**Execution Mode**: `Interactive` (may need clarification on edge cases)
**State Update**: `Self-managed` (standalone execution)

### DoR - Required Context Files
- [ ] `.clinerules/holicode.md`
- [ ] `.clinerules/workflows/task-implement.md`
- [ ] `.holicode/state/activeContext.md`
- [ ] `.holicode/state/progress.md`
- [ ] `.holicode/state/techContext.md`
- [ ] GitHub task issue (via MCP or issue number)
- [ ] Component SPECs: `src/**/SPEC.md` files referenced in task

### Output Artifacts
- **Primary**: Source code files in `src/` implementing the task
- **Component SPECs**: Updated `src/**/SPEC.md` with change logs
- **State updates**: Updates to `activeContext.md`, `progress.md`, `retro-inbox.md`
- **Next workflow**: Suggest `/quality-validate.md` for validation

### Claude Code Invocation Template

\`\`\`markdown
<Task tool>
subagent_type: "general-purpose"
description: "Implement GitHub task"
prompt: """
Execute: `.clinerules/workflows/task-implement.md`

**Context**:
- GitHub Task: #[issue-number] [task title]
- Feature: [feature context]
- Parent Story: [story reference]

**Required Reading**:
- `.clinerules/workflows/task-implement.md`
- `.holicode/state/activeContext.md`
- `.holicode/state/techContext.md`
- GitHub issue #[number] (use MCP get_issue)
- Component SPECs from task references

**Execution**:
1. Validate DoR
2. Load GitHub task and component SPECs
3. Implement code following SPECs
4. Run tests (target >90% success)
5. Update component SPECs with change log
6. Update state files
7. Validate DoD

**Output Summary**:
- Files created/updated (paths)
- Tests results (pass/fail counts)
- SPEC compliance confirmation
- State updates applied
- Next steps recommendation
"""
\`\`\`

## Definition of Ready (DoR)
[... rest of workflow continues as normal ...]
```

## Parallel Execution Patterns

Claude Code can run multiple subagents in parallel. Orchestrators can leverage this:

```markdown
## Phase: Parallel Story Analysis

For each story in the epic, launch parallel functional-analyze subagents:

**Story 1: User Authentication**
<Task tool invocation for /functional-analyze.md with story 1 context>

**Story 2: User Profile Management**
<Task tool invocation for /functional-analyze.md with story 2 context>

**Story 3: Session Management**
<Task tool invocation for /functional-analyze.md with story 3 context>

Wait for all subagents to complete, then consolidate results.
```

**Coordination**:
1. Each subagent creates independent output artifacts
2. Parent orchestrator collects all outputs
3. Parent orchestrator updates state files with consolidated results
4. Prevents state file conflicts from parallel execution

## Context Window Optimization

Claude Code benefits from targeted context loading. Adapt DoR sections:

### Before (Generic)
```markdown
## DoR
Read all state files and specs before starting.
```

### After (Optimized)
```markdown
## DoR - Required Context Files

**Always Load** (essential context, ~5KB total):
- [ ] `.clinerules/workflows/[this-workflow].md` (~3KB)
- [ ] `.holicode/state/activeContext.md` (~2KB)

**Load if Needed** (conditional context):
- [ ] `.holicode/state/techContext.md` (if making technical decisions)
- [ ] `.holicode/state/productContext.md` (if analyzing business requirements)
- [ ] `.holicode/specs/WORK_SPEC.md` (if linking to tasks/stories)

**Skip Unless Specified** (large or historical):
- [ ] `.holicode/state/retro-inbox.md` (only if investigating past issues)
- [ ] `.holicode/specs/technical-design/` (only if refactoring)
- [ ] Historical task archives
```

## GitHub Integration

Claude Code has native `gh` CLI support. Update GitHub workflows:

```markdown
### Create GitHub Epic

**Using gh CLI**:
\`\`\`bash
gh issue create \
  --repo ciekawy/dobble-generato \
  --title "Epic: User Authentication" \
  --label "epic" \
  --body "$(cat .holicode/specs/features/FEATURE-auth.md)"
\`\`\`

**Using GitHub MCP** (if available):
\`\`\`markdown
<use create_issue tool>
repo: "ciekawy/dobble-generato"
title: "Epic: User Authentication"
labels: ["epic"]
body: [content from FEATURE-auth.md]
\`\`\`
```

## Migration Checklist

To adapt a workflow for Claude Code compatibility:

- [ ] Add "🤖 Claude Code Subagent Compatibility" section after "Agent Identity"
- [ ] Include "NOTE FOR CLINE USERS" at top of section
- [ ] Specify subagent type, execution mode, state update strategy
- [ ] List DoR required context files (with size estimates)
- [ ] Document output artifacts created
- [ ] Provide Claude Code invocation template
- [ ] Clarify state update responsibilities (self vs deferred)
- [ ] Keep existing workflow content unchanged
- [ ] Test workflow works in both Cline and Claude Code

## Testing Compatibility

### Cline Testing
1. Open workflow file
2. Verify "NOTE FOR CLINE USERS" is clear
3. Ignore Claude Code section
4. Execute workflow using Workflow-Based Task pattern
5. Verify workflow completes successfully

### Claude Code Testing
1. Launch Claude Code session
2. Use Task tool with subagent invocation template
3. Verify DoR files are loaded correctly
4. Execute workflow as subagent
5. Verify output artifacts created
6. Verify state updates coordinated correctly

## Best Practices

### 1. Keep Workflows Self-Contained
Each workflow should be executable in isolation (with proper DoR context).

### 2. Explicit Context Requirements
List exactly what files/context are needed - don't assume parent knows.

### 3. Clear Output Contracts
Specify exactly what artifacts are created and where.

### 4. State Update Clarity
Be explicit about who updates state (self vs parent orchestrator).

### 5. Graceful Degradation
Workflows should work standalone even if not using subagent pattern.

### 6. Consistent Templates
Use the same invocation template format across all workflows.

### 7. Size Awareness
Note file sizes in DoR to help with context window management.

### 8. Parallel Safety
Design workflows to be safe for parallel execution (avoid shared state conflicts).

## Troubleshooting

### Issue: Workflow runs but state not updated
**Cause**: State update responsibility unclear
**Fix**: Clarify if workflow is self-managed or deferred state updates

### Issue: Context window overflow
**Cause**: Loading too many unnecessary files
**Fix**: Use conditional loading in DoR section

### Issue: Parallel execution conflicts
**Cause**: Multiple workflows updating same state files
**Fix**: Use deferred state updates with parent orchestrator coordination

### Issue: Cline users confused by Claude Code section
**Cause**: Not clear it's optional for Cline
**Fix**: Add prominent "NOTE FOR CLINE USERS" at section start

## See Also

- `.clinerules/holicode.md` - Core HoliCode framework
- `CLAUDE.md` - Claude Code entry point
- `.clinerules/workflows/spec-workflow.md` - Orchestration example
