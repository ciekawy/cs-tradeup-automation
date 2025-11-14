<!--
workflow_type: coordination
recommended_model: medium
description: "Initialize task with proper mode selection and context loading"
-->

# Task Initialization - Plan vs Act Mode Selection

Choose the appropriate mode and load necessary context for the current task.

## Context Loading
Read essential state files to understand current project state:

<read_file>
<path>.holicode/state/activeContext.md</path>
</read_file>

<read_file>
<path>.holicode/state/progress.md</path>
</read_file>

## Mode Selection Analysis

Based on the current context and incoming request, I need to determine the appropriate mode:

### **Plan Mode** - Use for:
- Discovery and strategy discussions
- High-level planning and architecture
- Requirement analysis and clarification
- Epic breakdown and story definition
- Risk assessment and technical feasibility

### **Act Mode** - Use for:
- Implementation and coding tasks
- Specific feature development
- Bug fixes and debugging
- Code reviews and refactoring
- Testing and deployment

## Task Classification

<ask_followup_question>
<question>What type of task are you working on?

**Planning Tasks:**
- Strategic planning or architecture design
- Requirements analysis or epic breakdown
- Research or feasibility analysis
- Process improvement or retrospective

**Implementation Tasks:**
- Feature development or bug fixes
- Code review or refactoring
- Testing or deployment
- Documentation updates

**Coordination Tasks:**
- Task handoffs or status updates
- Team coordination or communication
- Context synchronization

Please describe your current task to help determine the best approach.</question>
</ask_followup_question>

## Mode Selection & Context Loading

Based on your task description, I recommend: **{{selected_mode}} Mode**

### Additional Context Loading
{{#if selected_mode == "Plan"}}
Loading planning context:

<read_file>
<path>.holicode/state/projectbrief.md</path>
</read_file>

<read_file>
<path>.holicode/state/productContext.md</path>
</read_file>
{{/if}}

{{#if selected_mode == "Act"}}
Loading implementation context:

<read_file>
<path>.holicode/state/systemPatterns.md</path>
</read_file>

<read_file>
<path>.holicode/state/techContext.md</path>
</read_file>
{{/if}}

## Active Handoffs Check

<read_file>
<path>.holicode/handoff/active/</path>
</read_file>

{{#if active_handoffs_found}}
**Active handoffs detected:**
{{#each active_handoffs}}
- {{handoff_file}}: {{handoff_summary}}
{{/each}}

Should I prioritize any of these handoffs for the current task?
{{/if}}

## Task Initialization Complete

**Mode**: {{selected_mode}}
**Context Loaded**: {{loaded_files}}
**Active Handoffs**: {{handoff_count}}
**Ready to proceed with**: {{task_description}}

Next steps based on selected mode:
{{#if selected_mode == "Plan"}}
- Use strategic thinking and high-level analysis
- Focus on architecture and requirements
- Create clear specifications and documentation
{{/if}}

{{#if selected_mode == "Act"}}
- Follow established patterns from systemPatterns.md
- Implement using tech stack from techContext.md
- Update progress and activeContext as work proceeds
{{/if}}
