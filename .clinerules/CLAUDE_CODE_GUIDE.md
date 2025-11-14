# HoliCode Framework - Claude Code Integration Guide

**Version**: 1.0
**Status**: Production Ready
**Last Updated**: 2025-11-14

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Design Principles](#design-principles)
3. [File Organization](#file-organization)
4. [Workflow Adaptation Template](#workflow-adaptation-template)
5. [State Update Patterns](#state-update-patterns)
6. [Invocation Examples](#invocation-examples)
7. [Testing Guide](#testing-guide)
8. [FAQ](#faq)

---

## Quick Start

### For Cline Users
**No changes needed!** Continue using existing Workflow-Based Task pattern. Ignore "🤖 Claude Code Subagent Compatibility" sections in workflows.

### For Claude Code Users
1. **Entry Point**: `CLAUDE.md` (loads automatically)
2. **Load Context**: `.holicode/state/activeContext.md` + `progress.md`
3. **Choose Workflow**: See `.clinerules/workflows/README.md`
4. **Invoke**: Use Task tool with template from workflow's Claude Code section

### First Test (Right Now!)
Let's test by running a simple workflow as a subagent. Try this:

```markdown
I'll check the current project state using a subagent.

<use Task tool>
subagent_type: "Explore"
description: "Check HoliCode state files"
prompt: """
Explore the HoliCode state files to understand current project status.

Files to read:
- .holicode/state/activeContext.md
- .holicode/state/progress.md
- .holicode/state/projectbrief.md

Provide a brief summary (3-5 bullet points) of:
- Current focus/phase
- Recent completions
- Next steps
- Any blockers
"""
```

---

## Design Principles

### 1. Cross-Runtime Compatibility
**Goal**: One framework, two runtimes (Cline + Claude Code)

**Implementation**:
- Add optional "🤖 Claude Code Subagent Compatibility" sections to workflows
- Start sections with: `> **NOTE FOR CLINE USERS**: ignore this section`
- Keep existing workflow content unchanged
- Zero breaking changes to Cline workflows

### 2. Minimal Entry Point
**Goal**: Keep CLAUDE.md lean and focused

**Structure**:
```
CLAUDE.md (< 400 lines)
    ↓ points to
.clinerules/holicode.md (full framework)
    ↓ references
.clinerules/workflows/*.md (individual workflows)
```

### 3. State Update Coordination
**Goal**: Prevent state file conflicts from parallel execution

**Two Patterns**:

| Pattern | Use When | Who Updates State |
|---------|----------|-------------------|
| **Self-managed** | Standalone workflow | Workflow itself |
| **Deferred** | Part of orchestration | Parent orchestrator |

**Example**:
```markdown
# Standalone execution (e.g., user runs /task-implement.md)
→ Workflow updates state files directly

# Orchestrated execution (e.g., /spec-workflow.md invokes /technical-design.md)
→ Subagent creates artifacts only
→ Parent orchestrator updates state files
```

### 4. Context Window Optimization
**Goal**: Load only what's needed

**DoR Organization**:
```markdown
**Always Load** (~5KB):
- Essential files that every workflow needs

**Load if Needed** (~10KB):
- Conditional based on workflow type

**Skip Unless Specified**:
- Large or historical files
```

---

## File Organization

### Created Files

```
dobble-generato/
├── CLAUDE.md                                    # Claude Code entry point
├── .clinerules/
│   ├── holicode.md                             # Framework core (existing)
│   ├── CLAUDE_CODE_GUIDE.md                    # THIS FILE - main reference
│   ├── claude-code-integration.md              # Detailed integration guide
│   ├── CLAUDE_CODE_ADAPTATION_SUMMARY.md       # Changelog/summary
│   └── workflows/
│       ├── README.md                           # Workflow catalog
│       ├── technical-design-example-adaptation.md  # Example
│       └── [all workflow files].md             # Individual workflows
└── .holicode/
    ├── state/                                  # State files (existing)
    └── specs/                                  # Specifications (existing)
```

### File Purposes

| File | Purpose | Audience |
|------|---------|----------|
| `CLAUDE.md` | Entry point, quick reference | Claude Code at session start |
| `CLAUDE_CODE_GUIDE.md` | **Main reference** (this file) | Developers setting up/using framework |
| `claude-code-integration.md` | Detailed technical guide | Workflow authors adapting workflows |
| `workflows/README.md` | Workflow catalog | Anyone choosing a workflow |
| `technical-design-example-adaptation.md` | Concrete example | Learning how to adapt |

---

## Workflow Adaptation Template

### Where to Insert
Add after "Agent Identity" section, before "Definition of Ready (DoR)":

```markdown
# [Workflow Name]

## Agent Identity
[existing content]

## 🤖 Claude Code Subagent Compatibility    ← INSERT HERE

> **NOTE FOR CLINE USERS**: Ignore this section, use Workflow-Based Task pattern.

[Claude Code section content - see below]

## Definition of Ready (DoR)
[existing content]
```

### Template Content

```markdown
## 🤖 Claude Code Subagent Compatibility

> **NOTE FOR CLINE USERS**: This section is for Claude Code subagent invocation only.
> If you're using Cline, ignore this section and continue with normal Workflow-Based Task pattern.

**Subagent Type**: `general-purpose`
**Execution Mode**: `Autonomous` | `Interactive`
**State Update**: `Self-managed` | `Deferred to parent`

### DoR - Required Context Files

**Always Load** (~XKB total):
- [ ] `.clinerules/holicode.md` (framework core)
- [ ] `.clinerules/workflows/[this-workflow].md` (workflow itself)
- [ ] `.holicode/state/activeContext.md` (current focus)
- [ ] `.holicode/state/progress.md` (completion status)

**Load if Needed**:
- [ ] `.holicode/state/techContext.md` (if technical decisions)
- [ ] `.holicode/state/productContext.md` (if business context)
- [ ] [workflow-specific files]

**Skip Unless Specified**:
- [ ] `.holicode/state/retro-inbox.md` (only if investigating issues)
- [ ] Historical archives

### Output Artifacts

This workflow creates:

**Primary Artifacts**:
- [Main deliverables with exact paths]

**State Updates Needed** (if deferred):
- `activeContext.md`: [specific updates]
- `progress.md`: [specific updates]
- `retro-inbox.md`: [learnings to capture]
- `WORK_SPEC.md`: [manifest updates]

**Next Workflow**: [Recommended next step]

### Claude Code Invocation Template

\`\`\`markdown
<Task tool invocation>
subagent_type: "general-purpose"
description: "[Brief 3-5 word description]"
prompt: """
Execute HoliCode workflow: `.clinerules/workflows/[workflow-name].md`

**Context**:
- [Specific context for this execution]
- [Input artifacts or parameters]

**Required Reading (DoR)**:
- `.clinerules/workflows/[workflow-name].md`
- `.holicode/state/activeContext.md`
- `.holicode/state/progress.md`
- [other required files]

**Execution Instructions**:
1. Validate DoR (all required files accessible)
2. [Step-by-step execution from workflow]
3. Validate DoD (all outputs created)
4. [If self-managed: Update state files]
5. [If deferred: Report state updates needed]

**Success Criteria**:
- [Key DoD criteria from workflow]
- [Quality gates to pass]

**Output Format**:
Provide concise summary containing:

**Artifacts Created**:
- [List with paths]

**Key Decisions**:
- [Important choices made]

**State Updates** (if deferred):
- [What parent should update]

**Next Steps**:
- Recommended workflow: [next workflow]
- Blockers: [any issues]
- Questions: [clarifications needed]
"""
\`\`\`

### State Update Coordination

**If Self-Managed**:
Subagent updates state files directly:
1. `activeContext.md` (narrative updates)
2. `retro-inbox.md` (learnings)
3. `progress.md` (completion metrics)

**If Deferred**:
Subagent creates artifacts, parent updates state:
1. Subagent creates output files
2. Subagent reports needed updates
3. Parent orchestrator validates
4. Parent updates state atomically
```

---

## State Update Patterns

### Pattern 1: Self-Managed (Standalone Workflows)

**Use When**:
- User invokes workflow directly
- Not part of larger orchestration
- Workflow is primary owner of state

**Examples**: `task-implement.md`, `state-update.md`, `github-sync.md`

**In Workflow**:
```markdown
**State Update**: Self-managed

This workflow updates:
- `.holicode/state/activeContext.md` (current focus)
- `.holicode/state/progress.md` (completion status)
- `.holicode/state/retro-inbox.md` (learnings)
```

**In Subagent Prompt**:
```markdown
**Execution Instructions**:
...
4. Update state files:
   - activeContext.md with [updates]
   - progress.md with [completion %]
   - retro-inbox.md with [learnings]
```

### Pattern 2: Deferred (Orchestrated Workflows)

**Use When**:
- Part of multi-phase orchestration (e.g., `spec-workflow.md`)
- Parallel execution possible
- Parent needs to validate/consolidate

**Examples**: `technical-design.md`, `implementation-plan.md` (when called by orchestrator)

**In Workflow**:
```markdown
**State Update**: Deferred to parent

Subagent creates artifacts, parent orchestrator updates state.

**Subagent Responsibility**:
- Create output files
- Report needed updates

**Parent Responsibility**:
- Validate outputs
- Update state atomically
- Trigger next workflow
```

**In Subagent Prompt**:
```markdown
**Execution Instructions**:
...
4. Create all output artifacts
5. DO NOT update shared state files
6. Report what state updates are needed

**Output Format**:
...
**State Updates Needed** (for parent to apply):
- activeContext.md: [updates]
- progress.md: [updates]
```

**In Parent Orchestrator**:
```markdown
## Phase 3: Technical Design

1. Launch technical-design subagent
2. Wait for completion
3. Validate outputs
4. Update state files:
   - activeContext.md
   - progress.md
   - retro-inbox.md
   - WORK_SPEC.md
5. Trigger next phase
```

---

## Invocation Examples

### Example 1: Simple State Check (Explore Agent)

```markdown
<Task tool>
subagent_type: "Explore"
description: "Check project state"
prompt: """
Read and summarize HoliCode state:
- .holicode/state/activeContext.md
- .holicode/state/progress.md

Provide brief summary of current status and next steps.
"""
```

### Example 2: Technical Design Workflow (Full Workflow)

```markdown
<Task tool>
subagent_type: "general-purpose"
description: "Generate technical design"
prompt: """
Execute: `.clinerules/workflows/technical-design.md`

**Context**:
- Feature: User Authentication
- Epic: #123 (GitHub issue)
- Stories: .holicode/specs/features/FEATURE-auth/USER_STORIES.md

**Required Reading**:
- `.clinerules/workflows/technical-design.md`
- `.holicode/state/activeContext.md`
- `.holicode/state/techContext.md`
- `.holicode/state/systemPatterns.md`
- `.holicode/specs/features/FEATURE-auth.md`

**Execution**:
Follow ALL steps from technical-design.md including:
1. DoR validation
2. Identify quality attributes
3. Create TD-001 through TD-007
4. Create component SPECs (contracts only)
5. Create GitHub TD issues
6. DoD validation
7. Report state updates needed (deferred to parent)

**Output Summary**:
- TD documents created (paths)
- Key architectural decisions
- State updates needed
- Next workflow recommendation
"""
```

### Example 3: Parallel Story Analysis

```markdown
# Launch 3 parallel subagents for story analysis

<Task tool>
subagent_type: "general-purpose"
description: "Analyze authentication story"
prompt: """[Story 1 context]"""

<Task tool>
subagent_type: "general-purpose"
description: "Analyze profile story"
prompt: """[Story 2 context]"""

<Task tool>
subagent_type: "general-purpose"
description: "Analyze session story"
prompt: """[Story 3 context]"""

# Wait for all to complete, then consolidate and update state
```

---

## Testing Guide

### Test 1: Cline Compatibility (Regression Test)

**Objective**: Ensure workflows still work in Cline

**Steps**:
1. Open Cline
2. Create Workflow-Based Task: `/technical-design.md`
3. Add context from activeContext.md
4. Execute workflow
5. Verify workflow completes
6. Verify state files updated
7. Verify outputs created

**Pass Criteria**:
- ✅ Workflow executes without errors
- ✅ State files updated correctly
- ✅ Output artifacts created
- ✅ Claude Code section easily ignored

### Test 2: Claude Code Subagent (New Feature)

**Objective**: Verify subagent invocation works

**Steps**:
1. Open Claude Code session
2. CLAUDE.md loads automatically
3. Load activeContext.md and progress.md
4. Use Task tool with invocation template
5. Verify DoR files loaded
6. Verify workflow executes
7. Verify outputs created
8. Verify state coordination (if deferred)

**Pass Criteria**:
- ✅ Subagent launches successfully
- ✅ DoR validation passes
- ✅ Workflow completes autonomously
- ✅ Output artifacts created
- ✅ State updates coordinated correctly
- ✅ Summary report provided

### Test 3: Parallel Execution

**Objective**: Verify parallel subagents work without conflicts

**Steps**:
1. Launch 2-3 parallel subagents
2. Each working on different features/stories
3. Wait for all to complete
4. Collect outputs
5. Update state atomically
6. Verify no conflicts

**Pass Criteria**:
- ✅ All subagents complete successfully
- ✅ Independent outputs created
- ✅ No state file conflicts
- ✅ Parent consolidation works

---

## FAQ

### Q: Do I need to adapt all workflows immediately?
**A**: No. Workflows work as-is in Cline. Adapt workflows incrementally as needed for Claude Code usage.

### Q: What if I only use Cline?
**A**: No action needed. Ignore Claude Code sections. CLAUDE.md provides a nice overview but isn't required.

### Q: What if I only use Claude Code?
**A**: CLAUDE.md is your entry point. Workflows with Claude Code sections are ready for subagent use. Others can be executed by reading the workflow file directly.

### Q: How do I choose between self-managed vs deferred state updates?
**A**: Decision tree:
- Standalone workflow (user invokes) → **Self-managed**
- Part of orchestration (workflow invokes) → **Deferred**
- Parallel execution possible → **Deferred**
- Simple utility workflow → **Self-managed**

### Q: Can I run workflows in parallel?
**A**: Yes, if using deferred state updates. Parent orchestrator coordinates state file updates after all subagents complete.

### Q: How do I handle workflow dependencies?
**A**: Use orchestrator workflows (like `spec-workflow.md`) to coordinate phases and dependencies.

### Q: What's the migration path?
**A**:
1. ✅ Foundation complete (CLAUDE.md, guides, examples)
2. Adapt high-priority workflows (spec-workflow, task-implement, etc.)
3. Test in real usage
4. Iterate based on feedback

### Q: Where do I start testing?
**A**: Try the "First Test" in Quick Start section above - run an Explore subagent to check state files.

---

## Quick Reference

### Files to Remember

| Need | File to Use |
|------|-------------|
| Claude Code entry point | `CLAUDE.md` |
| Main reference guide | `.clinerules/CLAUDE_CODE_GUIDE.md` (this file) |
| Adaptation how-to | `.clinerules/claude-code-integration.md` |
| Workflow catalog | `.clinerules/workflows/README.md` |
| Concrete example | `.clinerules/workflows/technical-design-example-adaptation.md` |
| Framework core | `.clinerules/holicode.md` |

### Workflow Adaptation Checklist

- [ ] Read this guide (CLAUDE_CODE_GUIDE.md)
- [ ] Study example (technical-design-example-adaptation.md)
- [ ] Add Claude Code section after "Agent Identity"
- [ ] Include "NOTE FOR CLINE USERS" at top
- [ ] Document DoR files (with size estimates)
- [ ] Classify execution mode (Autonomous/Interactive)
- [ ] Choose state update pattern (Self-managed/Deferred)
- [ ] Provide complete invocation template
- [ ] Test in both Cline and Claude Code
- [ ] Commit and document

### State Update Order (Always)

```
1. activeContext.md    (narrative, current focus)
2. retro-inbox.md      (learnings, insights)
3. progress.md         (metrics, completion %) ← LAST
```

### Common Subagent Types

| Type | Use For |
|------|---------|
| `general-purpose` | Most workflows, complex multi-step tasks |
| `Explore` | Quick codebase exploration, file searches |
| `Plan` | Planning and analysis tasks |

---

## Support & Resources

- **Framework Documentation**: `.clinerules/holicode.md`
- **Project Context**: `.holicode/state/activeContext.md`
- **Workflow Catalog**: `.clinerules/workflows/README.md`
- **Issues**: GitHub repository issues
- **Examples**: `.clinerules/workflows/*-example-*.md`

---

**Version History**:
- **1.0** (2025-11-14): Initial release with cross-runtime compatibility
