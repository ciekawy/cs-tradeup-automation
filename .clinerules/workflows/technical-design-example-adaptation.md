# Technical Design Workflow - Example Claude Code Adaptation

This file demonstrates how to adapt `technical-design.md` for Claude Code compatibility while maintaining Cline support.

## Where to Insert the Section

The "Claude Code Subagent Compatibility" section should be inserted **after the "Agent Identity" section** and **before the "Definition of Ready (DoR)" section**.

---

## Original Structure (technical-design.md)

```markdown
# Technical Design Workflow (PoC)

## 🎯 SPECIFICATION MODE ACTIVE
[specification mode instructions]

## Agent Identity
[agent identity content]

## ⚠️ CRITICAL BOUNDARY ENFORCEMENT ⚠️
[boundary enforcement content]

## Definition of Ready (DoR)
[DoR content]
```

## Adapted Structure (with Claude Code section)

```markdown
# Technical Design Workflow (PoC)

## 🎯 SPECIFICATION MODE ACTIVE
[specification mode instructions - unchanged]

## Agent Identity
[agent identity content - unchanged]

## ⚠️ CRITICAL BOUNDARY ENFORCEMENT ⚠️
[boundary enforcement content - unchanged]

## 🤖 Claude Code Subagent Compatibility

> **NOTE FOR CLINE USERS**: This section is for Claude Code subagent invocation only.
> If you're using Cline, ignore this section and continue with normal Workflow-Based Task pattern.

**Subagent Type**: `general-purpose`
**Execution Mode**: `Interactive` (may require architectural decision clarifications)
**State Update**: `Deferred to parent` (part of spec-workflow orchestration)

### DoR - Required Context Files

**Always Load** (essential context, ~15KB total):
- [ ] `.clinerules/holicode.md` (framework core, ~8KB)
- [ ] `.clinerules/workflows/technical-design.md` (this workflow, ~5KB)
- [ ] `.holicode/state/activeContext.md` (current focus, ~2KB)

**Load for Technical Decisions** (~10KB total):
- [ ] `.holicode/state/techContext.md` (technology stack, ~3KB)
- [ ] `.holicode/state/systemPatterns.md` (architecture patterns, ~4KB)
- [ ] `.holicode/state/productContext.md` (business context for quality attributes, ~3KB)

**Load for Functional Validation** (~5KB per feature):
- [ ] `.holicode/specs/features/FEATURE-*.md` (feature specification from functional-analyze)
- [ ] `.holicode/specs/features/*/USER_STORIES.md` (functional requirements for validation)

**Skip Unless Investigating**:
- [ ] `.holicode/state/retro-inbox.md` (only if researching past architectural decisions)
- [ ] `.holicode/specs/technical-design/` archives (only if refactoring existing design)

### Output Artifacts

This workflow creates:

**Primary Artifacts**:
- Local TD documents: `.holicode/specs/technical-design/TD-{001-007+}.md`
  - TD-001: System Architecture Overview
  - TD-002: Data Architecture
  - TD-003: API & Integration Design
  - TD-004: Security Architecture
  - TD-005: Performance & Scalability
  - TD-006: Testing Strategy
  - TD-007: Deployment & Operations
  - TD-00X: Domain-specific TDs as needed
- Component SPEC.md contracts: `src/**/SPEC.md` (API contracts, data models only)

**GitHub Integration**:
- GitHub TD summary issues (via `/github-issue-create.md` workflow delegation)
- Linked to parent epic/stories

**State Updates Needed** (for parent orchestrator to apply):
- `WORK_SPEC.md`: Add links to GitHub TD issues and local TD documents
- `activeContext.md`: Update with "Technical design complete, ready for implementation planning"
- `progress.md`: Update phase completion status (spec-driven development: 60% → 75%)
- `retro-inbox.md`: Capture architectural decisions and alternatives considered

**Next Workflow**: Recommend `/tech-review-post-planning.md` → `/implementation-plan.md`

### Claude Code Invocation Template

For Claude Code users, invoke this workflow as a subagent:

\`\`\`markdown
I'll launch the technical design workflow as a specialized architecture subagent.

<Task tool>
subagent_type: "general-purpose"
description: "Generate technical design documents"
prompt: """
You are a specialized Technical Design agent running the HoliCode technical-design workflow.

**Workflow to Execute**:
Read and follow `.clinerules/workflows/technical-design.md` completely, including:
- Specification Mode protocols
- Architecture-first approach (quality attributes before functional validation)
- Critical boundary enforcement (no code in src/, specs only)
- All DoR/DoD validation checkpoints

**Context**:
- Feature: [feature name/description]
- Parent Epic: [GitHub issue link or number]
- Stories Analyzed: [references to functional-analyze outputs]
- Quality Attributes: [performance, security, scalability priorities]

**Required Reading (DoR)**:
Core context:
- `.clinerules/holicode.md`
- `.clinerules/workflows/technical-design.md`
- `.holicode/state/activeContext.md`

Technical context:
- `.holicode/state/techContext.md`
- `.holicode/state/systemPatterns.md`
- `.holicode/state/productContext.md`

Functional requirements:
- `.holicode/specs/features/FEATURE-[name].md`
- `.holicode/specs/features/FEATURE-[name]/USER_STORIES.md`

**Execution Instructions**:
1. **Validate DoR**: Confirm all required context loaded
2. **Identify Quality Attributes**: From product context and stakeholder needs
3. **Generate Standard TDs**: Create TD-001 through TD-007 proactively
4. **Generate Domain TDs**: Add project-specific TDs as needed
5. **Document Alternatives**: For each decision, document 2-3 alternatives with pros/cons
6. **Create Component SPECs**: Contract/model/dependency sections only (no implementation)
7. **Create GitHub Issues**: Use `/github-issue-create.md` workflow for TD summaries
8. **Validate DoD**: Confirm all architectural domains covered
9. **DO NOT UPDATE STATE FILES**: Report what updates are needed, parent will apply

**Success Criteria**:
1. Complete architectural coverage (no gaps requiring reactive design later)
2. Every TD includes explicit alternatives and trade-offs
3. Architecture supports all functional requirements (validate against stories)
4. Component SPECs contain contracts only (no implementation details)
5. All TDs ready for tech review workflow

**Output Format**:
Provide concise summary including:

**Artifacts Created**:
- TD documents: [list paths with brief description of each]
- Component SPECs: [list paths]
- GitHub TD issues: [list issue numbers with titles]

**Key Architectural Decisions**:
- Architecture pattern chosen: [e.g., microservices, monolith, layered]
- Data architecture: [e.g., SQL, NoSQL, event sourcing]
- Security model: [e.g., OAuth2, JWT, session-based]
- Integration approach: [e.g., REST, GraphQL, gRPC]

**Alternatives Considered**:
- [Decision area]: [Chosen approach] vs [Alternative 1] vs [Alternative 2]
- Rationale: [Why chosen approach selected]

**State Updates Needed** (for parent to apply):
- WORK_SPEC.md: [specific updates]
- activeContext.md: [specific updates]
- progress.md: [specific updates]
- retro-inbox.md: [key learnings to capture]

**Next Steps**:
- Recommended workflow: `/tech-review-post-planning.md`
- Blockers: [any issues encountered]
- Open questions: [anything needing clarification]
"""
\`\`\`

### State Update Coordination

**Subagent Responsibility**:
- Create all TD documents locally
- Create GitHub TD summary issues (via workflow delegation)
- Create component SPEC.md contract sections
- Report what state updates are needed
- **DO NOT** directly update shared state files

**Parent Orchestrator Responsibility** (e.g., spec-workflow.md):
1. Validate subagent output completeness
2. Update `WORK_SPEC.md` with TD links
3. Update `activeContext.md` with phase completion
4. Update `progress.md` with metrics (spec phase 60% → 75%)
5. Update `retro-inbox.md` with architectural learnings
6. Trigger next workflow (`/tech-review-post-planning.md`)

**Why Deferred State Updates**:
- Technical design is part of multi-phase orchestration (spec-workflow.md)
- Parent orchestrator needs to coordinate across all spec phases
- Prevents state file conflicts from parallel TD generation
- Enables parent to validate outputs before committing to state

### Parallel Execution Support

This workflow CAN be parallelized when working on multiple features:

\`\`\`markdown
## Parallel Technical Design for Multiple Features

**Feature 1: User Authentication**
<Task tool for technical-design.md with Feature 1 context>

**Feature 2: Data Export**
<Task tool for technical-design.md with Feature 2 context>

**Feature 3: Reporting Dashboard**
<Task tool for technical-design.md with Feature 3 context>

**Coordination**:
1. Each subagent creates independent TD documents
2. Wait for all to complete
3. Parent consolidates all TD outputs
4. Parent updates state files with all changes atomically
\`\`\`

**Safety**: Each feature has separate TD documents, no shared file conflicts.

## Definition of Ready (DoR)
[DoR content - unchanged from original]
```

---

## Key Points for Adaptation

### 1. Placement
Insert after "Agent Identity" and before "DoR"

### 2. Cline Compatibility Note
Always start with prominent note: "NOTE FOR CLINE USERS: ignore this section"

### 3. Context File List
- Organize by priority (always load vs conditional)
- Include size estimates for context window planning
- Explain when to skip large/historical files

### 4. State Update Strategy
- Technical design is part of orchestration → **deferred state updates**
- Explain why (prevents conflicts, enables validation)
- Clear separation of responsibilities

### 5. Invocation Template
- Complete prompt that subagent can execute autonomously
- Includes all context, instructions, and output format
- Self-contained (doesn't assume parent knowledge)

### 6. Parallel Execution
- Document if workflow is parallel-safe
- Show example of parallel invocation
- Explain coordination strategy

## Testing the Adaptation

### Cline Test
1. User creates Workflow-Based Task with `/technical-design.md`
2. Workflow executes normally
3. Updates state files directly (self-managed)
4. Claude Code section ignored

### Claude Code Test
1. Parent workflow (spec-workflow.md) launches subagent
2. Subagent reads technical-design.md
3. Subagent executes architecture-first protocol
4. Subagent creates TD documents
5. Subagent reports back (no state updates)
6. Parent orchestrator updates state files
7. Parent triggers next workflow

## See Also

- `.clinerules/claude-code-integration.md` - Full integration guide
- `.clinerules/workflows/spec-workflow.md` - Orchestration example
- `CLAUDE.md` - Claude Code entry point
