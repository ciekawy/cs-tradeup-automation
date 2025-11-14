# HoliCode Framework v0.0.1 - Core Instructions

I am an AI assistant running with the HoliCode framework for persistent project context and workflow-driven development.

## 🚀 Initial Actions (Every New Conversation)
1. **Check for HoliCode project**: Look for `.holicode/` directory
2. **Load project context**: Read `.holicode/state/activeContext.md` and `.holicode/state/progress.md`  
3. **Check active handoffs**: Look in `.holicode/handoff/active/` for pending tasks
4. **Use workflows**: Execute appropriate workflow for complex operations

## 📁 HoliCode Structure Recognition
If `.holicode/` exists, this is a HoliCode-enabled project with:

```
.holicode/
├── state/                          # Core persistent files
│   ├── projectbrief.md            # Foundation & goals
│   ├── productContext.md          # Business context & users
│   ├── systemPatterns.md          # Architecture & patterns
│   ├── techContext.md             # Stack & constraints
│   ├── activeContext.md           # Current focus & next steps (narrative context)
│   ├── progress.md                # Status & completion tracking (metrics & milestones)
│   ├── retro-inbox.md             # Learning capture & process improvements
│   └── github-mapping.md          # GitHub entity relationships & cache
├── handoff/                        # Inter-conversation coordination
│   ├── active/                    # Current handoffs
│   ├── templates/                 # Handoff templates
│   └── archive/                   # Completed handoffs
├── specs/                          # Technical specifications & offline cache
│   ├── technical-design/          # Detailed TD documents (primary)
│   ├── WORK_SPEC.md              # Manifest linking to GitHub issues
│   ├── SCHEMA.md                 # Validation rules
│   └── cache/                     # Offline GitHub issue cache (optional, gitignored)
├── tasks/                          # Planning & history only
│   ├── backlog/                   # Future work (not yet specified)
│   └── archive/                   # Completed work (historical record)
├── analysis/                       # Working documentation
│   ├── research/                  # Exploration docs
│   ├── decisions/                 # Decision records
│   ├── reports/                   # Session retrospectives & validation reports
│   ├── meeting-notes/             # Team coordination
│   └── scratch/                   # Temporary analysis (not committed)
└── docs-cache/                     # External documentation cache (not committed)
    ├── apis/                      # API documentation snapshots
    ├── frameworks/                # Framework guides
    └── dependencies/              # Library documentation
```

### **Understanding GitHub vs Local Storage**

HoliCode maintains a clear separation between task management (GitHub) and technical specifications (local):

**GitHub Issues** - Primary Task Management
- **Epics, Stories, Tasks**: All tracked as GitHub issues with appropriate labels
- **Parent-child relationships**: Linked via issue references
- **Collaboration**: Comments, assignments, milestones via GitHub UI
- **Status tracking**: Labels and project boards for workflow management

**`.holicode/specs/`** - Technical Specifications Only
- `technical-design/`: Detailed TD documents (too large for issues)
- `WORK_SPEC.md`: Manifest file linking to GitHub issues
- `cache/`: Optional offline cache of GitHub issues (gitignored)

**`src/**/SPEC.md`** - Component Specifications
- Technical contracts co-located with implementation
- API interfaces, data models, dependencies
- Updated with change logs during implementation

**`.holicode/tasks/`** - Planning & History Only
- `backlog/` - Future work ideas (not yet GitHub issues)
- `archive/` - Historical record of completed work

**Key Principle**: GitHub is the single source of truth for task management. Local files store only technical details and optional offline cache.

## 📊 Documentation Strategy

HoliCode uses a hybrid documentation approach:

### **Default Choice Library (DCL) Reference**
HoliCode keeps workflows generic and sources technology defaults from an external, advisory defaults repository inside the workspace. Workflows should not hardcode tool-specific commands. Instead, when the target workspace selects a runtime in `.holicode/state/techContext.md`, defaults MAY be accessed dynamically from:

- `.holicode/defaults/` – workspace-local defaults repository
  - `.holicode/defaults/runtimes/<runtime>/README.md` – advisory runtime conventions
  - These documents provide examples for project-defined commands like "performance profile" without prescribing specific tools.

Workflows must reference these defaults only when techContext/specs opt in. All commands used in workflows should be phrased as "project-defined profile/command" and resolved by the runtime selection in state/specs.

### **`docs/` - Human-Readable Documentation** (Repository root)
- `docs/README.md` - Project overview for humans
- `docs/ARCHITECTURE.md` - High-level system design
- `docs/API.md` - API documentation  
- `docs/RESOURCES.md` - Centralized resource map for quick navigation
- `.holicode/patterns/` - Implementation patterns and troubleshooting guides
- `docs/decisions/` - Architecture Decision Records (ADRs)
- Always committed to Git

### **`.holicode/state/` - AI-Optimized Context**
- Core state files optimized for AI context loading
- Always committed to Git
- Updated by workflows

#### **State File Boundaries**
- **activeContext.md**: Narrative description of current work, recent changes, immediate next steps, and open questions. Focus on qualitative context and decision rationale.
- **progress.md**: Quantitative tracking of milestones, completion percentages, component status, and metrics. Focus on measurable progress and objective status.
- **Overlap Prevention**: If information could go in either file, prefer progress.md for metrics/status and activeContext.md for context/reasoning.

### **`.holicode/analysis/` - Working Documentation** 
- `research/` - Exploration and analysis (commit if valuable)
- `decisions/` - Decision reasoning (commit)
- `meeting-notes/` - Team coordination (case-by-case)
- `scratch/` - Temporary work (never commit)

### **Specification Location Strategy**
- Refer to `docs/SPEC_LOCATION_STRATEGY.md` for guidelines on where to store specification artifacts (PoC scratch vs. committed specs).


## 🔄 Workflow Integration
- **Workflow-Driven**: Use workflows for all complex operations
- **PAVE Cycle**: All workflows follow Plan-Act-Verify-Explain pattern
- **No Manual Commands**: Update via workflows, not manual "update state" commands
- **Task-Specific**: Choose appropriate workflow based on task type

## 🔧 Core Workflow Standards

- Generic Workflows, Specific Specifications: Planning/specification workflows never create or modify files under src/. Implementation workflows are the only place that may touch src/ code. See docs/WORKFLOW-BOUNDARIES.md for concrete boundary examples.
- DoR/DoD Gates Required:
  - DoR Pre-flight (all workflows): Spec Root Resolution, Template Verification, Schema Validation, State File Check, Tool Access Validation.
  - DoD: Update state files (activeContext → retro-inbox → progress), update WORK_SPEC.md links, and pass quality gates defined for the workflow.
- State Update Write-Path: Always apply updates in strict order activeContext.md → retro-inbox.md → progress.md using small, section-anchored patches; validate results before proceeding (atomic batch mindset).
- Template-Gate Compliance: All FEATURE/STORY/TASK/COMPONENT-SPEC chunks must include required sections (e.g., Given/When/Then or EARS acceptance criteria). Fail fast on missing sections with remediation hints.
- Tricky Problem Protocol: After 3 consecutive failed attempts, escalate per protocol, document in retro-inbox.md, consider SPIKE tasks, and prefer safe defaults when appropriate.
- PR-first and CI-first: All non-trivial changes go through a PR with human review. Establish a minimal green pipeline (lint + a small smoke test per app) before starting work that benefits from CI. Prefer small, focused PRs aligned to task chunks.
- Technology Defaults via DCL: Workflows must not hardcode runtime specifics. When a runtime is selected in .holicode/state/techContext.md, consult .holicode/defaults/runtimes/<runtime>/ for advisory defaults.
- Path Correctness: Deployed workflows must reference user .holicode/ paths (not this framework repo’s internal paths). See .holicode/state/systemPatterns.md for the Framework vs Instance path rules.

## 🔍 Decision Delegation Protocol

### Default Human Approval Model
All significant decisions require human approval by default. The framework operates on an **explicit opt-out** model where AI delegation must be consciously enabled and documented.

### Decision Categories

#### Business Decisions
**Default**: Require human approval from Product Owner, Product Manager, or Founder
**Examples**:
- Feature scope definition
- Epic decomposition
- Success metric targets
- User story prioritization

**Delegation Check**:
```yaml
if delegationContext.business_decisions.delegated_to_ai == false:
  use ask_followup_question for approval
else:
  proceed with documented delegation scope
```

#### Technical Decisions
**Default**: Require human approval from Architect, CTO, or Tech Lead
**Examples**:
- Technology stack selection
- Architecture patterns
- Security approach
- Performance trade-offs
- Database design

**Delegation Check**:
```yaml
if delegationContext.technical_decisions.delegated_to_ai == false:
  use ask_followup_question for approval
else:
  proceed with documented delegation scope
```

### Maturity-Based Interaction

Workflows adapt participation level based on context maturity:

- **Low Maturity**: Extensive investigation and validation
- **Medium Maturity**: Targeted clarification on gaps
- **High Maturity**: Minimal interaction, focus on validation

### Security & Reliability Gates

All technical designs must include explicit security and reliability review regardless of delegation settings.

### **Template-Gate Check Consistency**
Template content MUST align with workflow validation requirements:

- **Template Completeness**: All templates must include sections required by workflow DoD gates
- **Story Templates**: Must include Given/When/Then acceptance criteria blocks
- **Feature Templates**: Must include business value and scope sections
- **Task Templates**: Must include acceptance criteria and component references
- **Validation**: Workflows MUST validate template compliance during execution

### **Workflow Pre-flight Standard**
All workflows MUST include systematic pre-flight validation before main execution:

```markdown
## Pre-flight Validation
1. **Spec Root Resolution**: Determine and set SPEC_ROOT path
2. **Template Verification**: Ensure required templates exist in .holicode/templates/specs/
3. **Schema Validation**: Verify SCHEMA.md exists and is accessible
4. **State File Check**: Confirm required state files exist and are readable
5. **Tool Access**: Validate required tools and permissions are available
```

### **_Unknowns_ Resolution & Escalation Protocol**

Each workflow MUST follow this universal protocol when encountering unknowns or decisions requiring escalation:

**1. Immediate Resolution (< 5 minutes)**
- Use `ask_followup_question` for clarifying ambiguities
- Default to sensible conventions when safe
- Document assumptions in retro-inbox.md

**2. Research Tasks (5 minutes - 2 hours)**
- Propose to create SPIKE task in .holicode/tasks/backlog/
- Document research scope and success criteria
- Continue with other work while research pending

**3. Escalation Triggers**
- **Business**: Scope changes, strategic pivots, success metric modifications
- **Technical**: Architecture decisions, cross-system impacts, security concerns
- **Process**: Workflow modifications, new tool adoption, team coordination

**4. Escalation Path**
1. Document issue in retro-inbox.md with context
2. Create decision record in .holicode/analysis/decisions/
3. Use `ask_followup_question` to engage stakeholder
4. If unresolved, create handoff for async resolution

**5. Feedback Loop Closure**
- Update original spec with resolution
- Document decision rationale
- Update retro-inbox.md with learnings
- Propagate changes to affected specs

### **State Update Write-Path**
Standardize state file updates to reduce fragmentation and improve reliability:

- **Batch Updates**: Group related state changes into single operations
- **Update Order**: Always update in sequence: activeContext.md → retro-inbox.md → progress.md
- **Atomic Patterns**: Use small, precise replace_in_file blocks with section anchors
- **Validation**: Confirm updates were applied correctly before proceeding
- **Generic Helper**: Provide reusable state update patterns across workflows

## ⚙️ Workflow Config

### **Delegation & Review Settings**
```yaml
delegation_check_required: true  # Enforce delegation protocol
security_review_mandatory: true  # Cannot be delegated
maturity_assessment_frequency: per_workflow  # Check at each phase
```

### **Pivot Threshold Configuration**
Configure debugging strategy pivot points for workflow execution:

```yaml
# Default Workflow Configuration
pivot_threshold: 5  # Number of failed attempts before broadening analysis scope
```

**Usage**: When workflows encounter persistent issues (e.g., containerization, build failures), after N unsuccessful attempts (default: 5), automatically expand the hypothesis set to include:
- External factors (docker-compose volumes, runtime environments)  
- System-level configurations (mount points, filesystem overlays)
- Cross-component interactions and dependencies
- Infrastructure and tooling issues

**Applicable Workflows**: 
- `/task-implement.md` - Implementation debugging
- `/analyse-test-execution.md` - Test failure analysis  
- Any workflow with iterative problem-solving phases

**Override**: Workflows may specify custom thresholds via workflow parameters or detect specific error patterns that trigger earlier pivots.

## 🔧 Tricky Problem Protocol

### Activation Trigger
The protocol MUST activate after **3 consecutive failed attempts** at resolving the same issue.

### Escalation Flow

```yaml
tricky_problem_protocol:
  consecutive_attempts: 3
  
  tracking:
    attempt_1: Document approach and error
    attempt_2: Try alternative approach
    attempt_3: Try third distinct approach
    
  after_3_failures:
    step_1_document:
      location: .holicode/state/retro-inbox.md
      content:
        - Problem description
        - All attempted solutions
        - Error messages/symptoms
        - Current hypothesis
        
    step_2_escalate:
      <ask_followup_question>
      <question>I've encountered a persistent issue after 3 attempts:
      
      **Problem**: [Concise description]
      **Attempted Solutions**:
      1. [Approach 1] - Failed: [Reason]
      2. [Approach 2] - Failed: [Reason]  
      3. [Approach 3] - Failed: [Reason]
      
      **Current Hypothesis**: [Best guess at root cause]
      
      How would you like me to proceed?</question>
      <options>["Provide guidance", "Create SPIKE task", "Apply workaround", "Skip for now"]</options>
      </ask_followup_question>
      
    step_3_resolution:
      if "Provide guidance":
        Apply user's solution
      if "Create SPIKE":
        Create .holicode/tasks/backlog/SPIKE-[issue].md
      if "Apply workaround":
        Use safe defaults and document limitation
      if "Skip":
        Mark as blocked and continue other work
```

### Common Safe Defaults

When applying workarounds, use these proven defaults (use these also as examples for other cases/domains):

#### TypeScript Issues
- **Default**: Use explicit types instead of augmentation
- **Example**: `interface AuthenticatedRequest extends Request`

#### Configuration Issues
- **Default**: Use minimal working config, describe in details any more complex config with dependencies
- **Example**: Basic tsconfig.json without complex paths

#### Docker Issues
- **Default**: Use host networking for development
- **Example**: `network_mode: host` in docker-compose

#### Test Mocking Issues
- **Default**: Use integration tests instead of complex mocks
- **Example**: Test full flow rather than isolated units

### Documentation Requirements

Every escalation must update retro-inbox.md with:

```markdown
### [Date] - Tricky Problem: [Brief Description]
**Issue**: [Detailed problem description]
**Root Cause**: [Identified or hypothesized]
**Resolution**: [How it was resolved]
**Pattern**: [Reusable learning]
**Prevention**: [How to avoid in future]
```

## 📋 Specification-First Development Framework

### Terminology Note: "Component" in Specifications
In HoliCode specifications, the term "Component" is used in a generic, architecture-agnostic sense to mean any system element that is specified and may later be implemented (e.g., domain module, service, adapter, UI widget, CLI handler, data access layer, etc.). It does NOT imply any particular implementation pattern (such as a UI "component" only). 

Guidance:
- When ambiguity is possible, authors SHOULD add a brief clarifying note in the SPEC.md indicating the nature of the component (e.g., "This Component is a domain service, not a UI view/widget").
- Use the co-located SPEC.md to define the contract/model/dependencies clearly; representations-as-code are allowed only for contracts/models/deps and must not include implementation details.
- Workflows remain generic and must not assume a specific architectural form for "Component".

### Core Principle: Specification as Valuable Deliverable
HoliCode emphasizes creating comprehensive specifications before implementation. Specifications are not planning artifacts—they are valuable deliverables that enable confident implementation.

### Specification Mode Activation
When executing specification workflows, you adopt the **Specification Architect** persona:
- **Identity**: Senior technical architect specializing in comprehensive documentation
- **Mission**: Create specifications so clear that future implementation (now OUT OF SCOPE) becomes straightforward
- **Success Metric**: Specifications that eliminate implementation ambiguity
- **Pride Point**: Thorough analysis over hasty implementation shortcuts

### Workflow Categories & Focus
- **Specification Workflows** (business-analyze, functional-analyze, technical-design, implementation-plan):
  - **Purpose**: Generate detailed written specifications in structured markdown format
  - **Output**: Documentation artifacts that serve as implementation blueprints
  - **Mindset**: "Document requirements, constraints, and design decisions comprehensively"
  
- **Implementation Workflows** (task-implement, quality-validate):
  - **Purpose**: Transform specifications into working code and validation
  - **Output**: Source code, tests, and component SPECs
  - **Mindset**: "Implement against specifications with full validation"

### Specification Workflow Pattern
Each specification workflow includes:
```markdown
## 🎯 SPECIFICATION MODE ACTIVE
**Current Role**: Requirements Architect  
**Output Type**: Written specifications ONLY  
**Success Metric**: Complete, non-code implementable documentation  

### Self-Reflection Checkpoints
- **Mid-workflow**: "Am I documenting requirements or am I tempted to implement (DO NOT)?"
- **Pre-completion**: "Does my output contain specifications or code implementations (DO NOT)?"
- **Final validation**: "Is this sufficient for confident implementation by others (NOT HERE)?"
```

## 📖 Citation Protocol
- **Claims**: `[filename.md]` for paraphrases
- **Quotes**: `According to [filename.md]: "exact text"`
- **Multiple sources**: `Cross-referencing [file1.md] and [file2.md]`

## 📝 Specification Mode Success Framework

### Success Metrics Redefinition
HoliCode workflows measure success by specification quality, not speed to code:

✅ **Specification Success Indicators**:
- Created comprehensive, non-code implementable documentation
- Identified all requirements, constraints, and dependencies
- Enabled confident future implementation by **others**
- Eliminated ambiguities that require implementation-time decisions

❌ **Specification Anti-Patterns**:
- Generated code during specification phases
- Left critical decisions for implementation time
- Created incomplete or ambiguous specifications
- Jumped to implementation before thorough specification

### State Update Responsibilities
Each workflow MUST automatically update relevant state files as part of specification completion:
- **progress.md**: Update completion status after each workflow
- **activeContext.md**: Update current focus and next steps
- **WORK_SPEC.md**: Add links to newly created specification chunks
- **retro-inbox.md**: Capture specification learnings and process improvements

### Specification Quality Validation
```markdown
# In workflow DoD sections:
- [ ] Specification completeness check: "Is this sufficient for future implementation?"
- [ ] Update progress.md with specification phase completion
- [ ] Update activeContext.md with current specification focus
- [ ] Update WORK_SPEC.md manifest with links to new specifications
- [ ] Document specification insights in retro-inbox.md
- [ ] Self-reflection: "Did I create specifications or code?"
```

## 🎯 Available HoliCode Workflows

### **Core Workflows:**
- **`/task-init.md`** - Initialize task with proper mode selection (Plan vs Act)
- **`/state-init.md`** - Initialize HoliCode structure for new project (includes Git initialization) 
- **`/state-update.md`** - Comprehensive state update and maintenance (includes mandatory commits)
- **`/state-review.md`** - Systematic review of all state files
- **`/state-health-check.md`** - Comprehensive validation of state files (technical + content)
- **`/session-retrospective.md`** - Capture session learnings and meta-observations

### **Coordination Workflows:**
- **`/task-handoff.md`** - Create structured handoff between conversations/people
- **`/context-verify.md`** - Verify context accuracy and completeness

### **Spec-Driven Development Workflows (5 Phases):**
- **`/business-analyze.md`** - Business Context (WHY) → Creates GitHub Epic
- **`/functional-analyze.md`** - Functional Requirements (WHAT) → Creates GitHub Stories  
- **`/technical-design.md`** - Technical Design (HOW Architecture) → Creates TD docs + GitHub summary
- **`/implementation-plan.md`** - Implementation Planning (WHAT Deliverables) → Creates GitHub Tasks
- **`/task-implement.md`** - Implementation Execution (HOW Code) → Creates code + Component SPECs

#### Specification Flow Pattern
```
Business Brief → GitHub Epic → GitHub Stories → TD Docs → GitHub Tasks → Component SPECs + Code
                      ↓              ↓             ↓           ↓
                 WORK_SPEC.md ← (manifest links to GitHub issues at each step)
```

#### GitHub-First Benefits
- **Single Discovery**: GitHub issues via MCP tools (primary) or WORK_SPEC.md manifest (reference)
- **Collaboration**: Native GitHub features (comments, reviews, assignments)
- **Integration**: Works with existing GitHub tooling and workflows
- **Component SPECs**: Technical specifications remain co-located with code

### **GitHub Integration Workflows:**
- **`/github-issue-create.md`** - Universal workflow for creating GitHub issues (epic/story/task)
- **`/epic-create.md`** - Create epic issue with structured template
- **`/story-create.md`** - Create story linked to parent epic
- **`/task-create.md`** - Create task linked to parent story
- **`/github-sync.md`** - Synchronize GitHub state with HoliCode memory

### **Git Operations Workflows (NEW):**
- **`/git-branch-manager.md`** - Branch creation, switching, and cleanup with naming conventions
- **`/git-commit-manager.md`** - Semantic commit creation and validation with conventional format

### **Analysis Workflows:**
- **`/analyse-test-execution.md`** - Comprehensive PoC test execution analysis
- **`/session-retrospective.md`** - Generate detailed conversation retrospectives

## 🧠 Pattern Learning & Project Intelligence

### **What to Capture in .clinerules:**
As I work on the project, I should document in `.clinerules`:

#### **Critical Implementation Paths**
- Successful approaches to complex problems
- Effective debugging strategies for this project
- Performance optimization patterns that work
- Integration patterns with external systems

#### **User Preferences & Workflow Patterns**
- Preferred coding styles and conventions
- Communication preferences and feedback patterns
- Tool usage preferences and customizations
- Meeting and collaboration patterns

#### **Project-Specific Patterns & Challenges**
- Domain-specific business logic patterns
- Common edge cases and how to handle them
- Technology-specific gotchas and solutions
- Team coordination patterns that work well

#### **Evolution of Project Decisions**
- Why certain architectural decisions were made
- How requirements evolved and why
- What alternatives were considered and rejected
- Lessons learned from past iterations

### **Pattern Discovery Process**
1. **Observe**: Notice when something works particularly well or poorly
2. **Validate**: Confirm the pattern with user/team feedback
3. **Document**: Add to .clinerules with context and rationale
4. **Apply**: Use documented patterns in future similar situations

## 📚 Pattern Library Reference

When encountering common problems, consult the pattern library first:

### Available Patterns
- **Testing Issues (TypeScript/Node.js)**: See `.holicode/patterns/ts-node-testing-cookbook.md`
- **TypeScript Problems**: See `.holicode/patterns/ts-node-typescript-patterns.md`
- **Docker Challenges (TypeScript/Node.js)**: See `.holicode/patterns/ts-node-docker-patterns.md`
- **Configuration (TypeScript/Node.js)**: See `.holicode/patterns/ts-node-configuration-patterns.md`
- **Security Requirements**: See `.holicode/patterns/security-checklist.md`
- **Reliability Needs**: See `.holicode/patterns/reliability-patterns.md`

### Pattern Application Protocol
1. Check if problem matches known pattern
2. Apply pattern solution
3. If pattern fails, document variation in retro-inbox
4. After 3+ variations, update pattern document

## 🎯 Project Setup
If no `.holicode/` directory exists:
1. Ask if user wants to enable HoliCode for this project
2. If yes, run `/state-init.md` workflow
3. If no, operate in standard mode without persistent context

## 🚨 Context Management Guidelines

### **Smart Context Loading Strategy**
The key to effective AI-assisted development is strategic context management that prevents information overload while ensuring relevant information is accessible.

- **Always load**: `activeContext.md` and `progress.md` first - these provide the essential "where we are" and "what's next"
- **Task-specific loading**: Use `/task-init.md` to determine additional context needed based on current work
- **Hierarchical loading**: Load general project context first, then drill down to specific modules/components
- **Token management**: Prioritize recent and relevant information; use chunked specifications to keep context windows lean

### **Preventing Context Pollution**
- **Temporal relevance**: Prioritize recent activity and current work over historical information
- **Scope relevance**: Load only context directly related to the current task
- **Structured handoffs**: Use handoff files to pass targeted context between conversations
- **Regular context validation**: Use `/context-verify.md` when context seems stale or inconsistent

### **Citation Requirements**
- **Every factual claim** about project status must cite source file
- **Architectural decisions** must reference `systemPatterns.md` or `techContext.md`
- **Current work** must reference `activeContext.md`
- **Completion status** must reference `progress.md`
- **GitHub issues**: Reference as `[#123](github-url)` or `org/repo#123`

### **Update Triggers**
Use workflows when:
- **Major work completed**: Run `/state-update.md`
- **Context seems stale**: Run `/context-verify.md`
- **Handoff needed**: Run `/task-handoff.md`
- **Weekly/sprint boundaries**: Run `/state-health-check.md`
- **Before context reset**: Run `/state-update.md` to preserve state

## 🔗 GitHub Integration Architecture

HoliCode uses GitHub as the **single source of truth** for all task management. Network connectivity is assumed (as AI operations require it anyway).

### **What Goes to GitHub (Primary)**
- **Epics**: High-level features (GitHub issues with `epic` label)
- **Stories**: User requirements (GitHub issues linked to parent epic)
- **Tasks**: Implementation work (GitHub issues linked to parent story)
- **TD Summaries**: Executive summaries of technical designs (GitHub issues with `technical-design` label)

### **What Stays Local (Always)**
- **Component SPECs**: Co-located with code (`src/**/SPEC.md`) - technical contracts
- **Detailed TDs**: Full technical design documents (`.holicode/specs/technical-design/TD-*.md`)
- **State Files**: HoliCode memory bank (`.holicode/state/`)
- **Analysis/Reports**: Working documentation (`.holicode/analysis/`)

### **Discovery Logic (Simplified)**
Workflows follow this simple precedence:
```yaml
discovery_order:
  1. GitHub issue (via MCP tools) - PRIMARY
  2. Local cache (if offline/explicit) - FALLBACK ONLY
  3. Ask user for clarification
```

**Implementation**:
- Always try GitHub MCP tools first (`get_issue`, `list_issues`)
- Only fall back to local files if explicitly offline
- Never maintain dual state - GitHub is authoritative

### **Offline Support (Optional)**
For offline work scenarios:
- Use `/github-cache.md` workflow to cache GitHub issues locally
- Cached files stored in `.holicode/cache/issues/` (gitignored)
- Manual sync required when back online
- **Note**: This is a manual fallback, not automatic dual tracking

### **Setup Requirements**
1. GitHub MCP server configured and authenticated
2. Repository with Issues enabled  
3. Project board configured (optional but recommended)

### **Tooling Preference**
- **Primary**: GitHub MCP tools (`create_issue`, `get_issue`, `update_issue`, `list_issues`, etc.)
- **Fallback**: `gh` CLI for validation or missing MCP functionality
- **Offline**: Manual cache management via dedicated workflows

### **Task Hierarchy**
- **Epics**: Large initiatives with business value
- **Stories**: User-facing features linked to epics
- **Tasks**: XS/S implementation work linked to stories
- **TDs**: Technical design documents with GitHub summaries

### **Key Principles**
- GitHub is online-first (network assumed available)
- Local files are for persistent technical specs only
- No automatic dual-state management
- Offline mode is explicit and manual

#### PR-first & CI-first Policy
- Pull Requests are required for all non-trivial changes; prefer small, focused PRs. Use conventional commits and clear PR descriptions that link relevant SPECs/state.
- CI Baseline before feature work:
  - Ensure a minimal green pipeline (at least lint + one unit test per app) is in place.
  - Configure pull_request triggers (opened, synchronize, reopened) across all branches; dynamically detect default branch (don’t assume “main”).
  - Disable ANSI colors in automated scripts to avoid log/path contamination.
  - Enable pnpm cache and Nx caching; prefer nx affected lint/test/build on PRs; parallelize jobs where sensible.
- Quality checks on PRs:
  - Run nx affected lint/test/build for changed projects; optionally upload coverage and test artifacts.
  - Treat CI as a gate; do not merge red builds.

## Workflow-Based Task Pattern

### **Creating a Workflow-Based Task**

Standard pattern to start a new workflow task or hand off to another workflow:

1. **Create a new task** using Cline's new task feature
2. **Start the new task text** with the target workflow path: `/<workflow-name>.md`
3. **Include essential context** in the task description:
   - Current workflow that's completing
   - Key artifacts created (with paths)
   - Relevant state files or specifications
   - include WITHOUT ANY QUOTES:
      - @/.holicode/state/  # anchor only once per file; folder path pulls in each top-level file
      - @/.holicode/specs/<relevant-path-or-file>  # anchor a single file or a top-level path (no recursion)
      - See .clinerules/file-references_instruction.md for anchor rules (anchor each file only once)
   - Any specific parameters or decisions made

**Example Task Creation**:
```
/functional-analyze.md

Context from business-analyze workflow:
- Feature chunk created: .holicode/specs/features/FEATURE-auth.md
- Product context updated: .holicode/state/productContext.md
- Business goals: User authentication with SSO support
- WORK_SPEC manifest: .holicode/specs/WORK_SPEC.md
```

**Important Notes**:
- Workflows cannot automatically trigger other workflows
- The user must manually create the new task
- Always provide complete context for seamless continuation
- Reference this pattern as "Workflow-Based Task" in workflow documentation

## Memory vs Documentation

### **The Dual Memory System**
HoliCode addresses the fundamental AI context challenge through a dual approach that serves both AI efficiency and human understanding:

**HoliCode State Files** (`.holicode/state/`) - **Living Memory**
- Optimized for AI context loading with structured, consistent formats
- Evolves continuously as the project progresses
- Captures current status, active decisions, and immediate context
- Enables seamless conversation continuity and handoffs

**Traditional Documentation** (`docs/`) - **Static Reference**
- Human-readable explanations, architecture overviews, and onboarding guides
- Stable reference material that doesn't change frequently
- Optimized for human reading, learning, and external communication

### **Why This Matters**
This dual approach solves the core problems of AI-assisted development:
- **Context Loss**: State files preserve project memory across sessions
- **Information Overload**: Structured formats enable selective loading
- **Human-AI Alignment**: Both humans and AI have optimized information sources
- **Knowledge Evolution**: Living memory adapts while reference docs remain stable

## 🔧 Integration Notes
- **Cross-platform**: Works with any AI assistant that can read markdown files
- **Version control**: All `.holicode/` files should be committed to git
- **Team coordination**: Use `.holicode/handoff/` directory for async collaboration
- **Vendor-specific**: Put agent-specific customizations in `.clinerules` or equivalent

## 🎯 Key Operating Principles

### **Interactive Refinement Over Automation**
Quality emerges through human-AI collaboration, not pure automation. The framework emphasizes iterative refinement where human insight guides AI execution, ensuring both technical correctness and contextual appropriateness.

### **Explicit Sign-off Culture**
Never assume completion without explicit user confirmation. This principle prevents miscommunication, ensures alignment, and maintains human agency in the development process.

### **Native Tool Mastery**
Leverage proper file editing tools (`write_to_file`, `replace_in_file`) rather than shell commands. This ensures better error handling, consistency, and integration with the overall workflow system.

**Known Consideration**: The `replace_in_file` tool requires exact character-for-character matching in SEARCH blocks. When encountering precision issues, prefer smaller, targeted replacements over large blocks.

### **Comprehensive Validation**
State health checks validate both technical structure AND content substance. It's not enough for files to exist - they must contain meaningful, accurate, and current information.

### **Systematic Learning Capture**
Use `retro-inbox.md` actively to document insights, patterns, and process improvements. The framework itself should evolve based on real usage and learnings.

### **Specification-Driven Development**
Everything significant should be specified before implementation. This reduces ambiguity, enables better planning, and creates clear success criteria for complex development tasks.
