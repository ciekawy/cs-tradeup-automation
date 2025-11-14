# Work Specification: [Project Name]

**Status:** [draft | active | completed]  
**Created:** {{ISO_DATE}}  
**Last Updated:** {{ISO_DATE}}  
**Total Context Size:** <2KB (optimized for AI context loading)

## ⚠️ IMPORTANT: GitHub is Primary Source
**This file is a LOCAL CACHE of GitHub issue state.**
- GitHub Issues are the single source of truth for all task management
- Run `/github-sync.md` to update this cache from GitHub
- All task creation, updates, and tracking happens in GitHub
- Local specs in `.holicode/specs/` are for technical details only

## Project Overview
[Brief one-line description of the project and its primary goal]

## Features (GitHub Epics)
<!-- GitHub Epics linked here by github-sync workflow -->
<!-- Example: - [User Authentication](https://github.com/owner/repo/issues/123) -->

## Active Stories (GitHub Issues)
<!-- GitHub Stories linked here by github-sync workflow -->
<!-- Example: - [Login Form](https://github.com/owner/repo/issues/124) (Epic: #123) -->

## Current Tasks (GitHub Issues)
<!-- GitHub Tasks linked here by github-sync workflow -->
<!-- Example: - [TASK-001: Implement Auth Service](https://github.com/owner/repo/issues/125) (Story: #124) -->

## Technical Design Documents (GitHub Issues & Local Files)
<!-- GitHub TD Issues linked here by github-sync workflow -->
<!-- Example: - [TD-001: System Architecture Overview](https://github.com/owner/repo/issues/126) (Local: .holicode/specs/technical-design/TD-001.md) -->
### Processed TDs
<!-- Track which TDs have been converted to tasks to prevent duplicates -->
<!-- Example: - TD-001: System Architecture - ✅ Tasks generated -->
<!-- Example: - TD-002: Infrastructure & Deployment - ⏳ Pending task generation -->

### Unprocessed TDs
<!-- TDs waiting for task generation -->

## Implementation Status
<!-- Component references as they are implemented -->
### Completed Components
<!-- Example: - `Auth` → [SPEC.md](../src/components/Auth/SPEC.md) - Authentication service (✅ Complete) -->

### In Progress Components
<!-- Example: - `UserProfile` → [SPEC.md](../src/components/UserProfile/SPEC.md) - User profile management (🔄 In Progress) -->

### Planned Components
<!-- Components identified but not yet implemented -->

## Hierarchy Map
<!-- Visual representation of relationships for quick navigation -->
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
