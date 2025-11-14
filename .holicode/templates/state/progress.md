<!--
template_type: state
recommended_model: medium
projectID: "{{project_id}}"
version: "0.1.0"
lastUpdated: "{{timestamp}}"
templateVersion: "1.0"
fileType: "progress"
-->

# {{project_name}} - Progress & Status

## Current Status
- **Phase**: {{current_phase}}
- **Completion**: {{overall_completion}}%
- **Status**: {{project_status}} <!-- On Track / At Risk / Delayed -->

## Completed Milestones
- [x] **{{completed_milestone_1}}** ({{milestone_1_date}})
- [x] **{{completed_milestone_2}}** ({{milestone_2_date}})

## Current Milestone
- [ ] **{{current_milestone}}** - Target: {{current_target_date}}
  - Progress: {{current_progress}}%
  - Key deliverables: {{key_deliverables}}

## Upcoming Milestones
- [ ] **{{upcoming_milestone_1}}** ({{upcoming_date_1}})
- [ ] **{{upcoming_milestone_2}}** ({{upcoming_date_2}})

## Component Status
### {{component_1_name}}
**Completion**: {{component_1_completion}}% | **Status**: {{component_1_status}}

#### Completed
- [x] {{component_1_completed_1}}
- [x] {{component_1_completed_2}}

#### In Progress
- [ ] {{component_1_in_progress_1}} ({{progress_1}}%)
- [ ] {{component_1_in_progress_2}} ({{progress_2}}%)

### {{component_2_name}}
**Completion**: {{component_2_completion}}% | **Status**: {{component_2_status}}

#### Completed
- [x] {{component_2_completed_1}}
- [x] {{component_2_completed_2}}

## Known Issues & Blockers
- **{{issue_1}}**: {{issue_1_description}} ({{issue_1_status}})
- **{{issue_2}}**: {{issue_2_description}} ({{issue_2_status}})

## Metrics Tracking
| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| {{metric_1}} | {{target_1}} | {{current_1}} | {{notes_1}} |
| {{metric_2}} | {{target_2}} | {{current_2}} | {{notes_2}} |
| {{metric_3}} | {{target_3}} | {{current_3}} | {{notes_3}} |
