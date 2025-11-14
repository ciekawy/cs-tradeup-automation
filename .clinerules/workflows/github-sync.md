# GitHub Sync Workflow

## Agent Identity
Role: Pull GitHub state INTO HoliCode for synchronization (one-way sync from GitHub to local)
Responsibilities:
- Fetch open issues from GitHub
- Update `.holicode/specs/WORK_SPEC.md` with current GitHub state
- Update `.holicode/state/github-mapping.md` with issue-to-spec mappings
- Report any discrepancies between GitHub and local state
- Handle incremental sync for efficiency

## Purpose Clarification
- **Primary**: Pull GitHub state INTO HoliCode (one-way sync)
- **NOT**: Push local changes to GitHub (that's done by issue creation workflows)
- **Frequency**: On-demand or scheduled (daily/weekly)
- **Direction**: GitHub → Local (read-only from GitHub perspective)

## Definition of Ready (DoR)
- [ ] GitHub MCP tools available OR fallback to cached data
- [ ] `.holicode/specs/WORK_SPEC.md` exists
- [ ] `.holicode/state/github-mapping.md` exists (or will be created)
- [ ] Repository context available (auto-detected from git config)

## Definition of Done (DoD)
- [ ] `.holicode/specs/WORK_SPEC.md` updated with current GitHub issue links
- [ ] `.holicode/state/github-mapping.md` updated with issue ID to local mapping
- [ ] Report generated on any discrepancies (e.g., orphaned local specs)
- [ ] State batch update completed:
  - [ ] `activeContext.md` updated with sync status
  - [ ] `progress.md` updated with relevant metrics

## Process

### 1. Read Existing Mapping

Read the current `github-mapping.md` to understand existing mappings.

### 2. Detect Repository Context

Dynamically detect repository from git configuration:

```bash
# Auto-detect repository
REPO_URL=$(git config --get remote.origin.url)
# Parse owner/repo from URL (handles both HTTPS and SSH)
if [[ $REPO_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
  OWNER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]}"
else
  # Ask user if auto-detection fails
  echo "Could not auto-detect repository. Please provide owner/repo."
fi

# Cache in gitContext.md for future use
echo "owner: $OWNER" >> .holicode/state/gitContext.md
echo "repo: $REPO" >> .holicode/state/gitContext.md
```

### 3. Fetch Open GitHub Issues

Use the GitHub MCP tool with incremental sync support:

```bash
# Read last sync timestamp if exists
if [ -f ".holicode/state/github-mapping.md" ]; then
  LAST_SYNC=$(grep "last_sync:" .holicode/state/github-mapping.md | cut -d' ' -f2)
  # Fetch only issues updated since last sync
  ISSUES=$(use_mcp_tool(
    server_name="github",
    tool_name="list_issues",
    arguments={
      "owner": "$OWNER",
      "repo": "$REPO",
      "state": "OPEN",
      "since": "$LAST_SYNC"
    }
  ))
else
  # First sync - fetch all open issues
  ISSUES=$(use_mcp_tool(
    server_name="github",
    tool_name="list_issues",
    arguments={
      "owner": "$OWNER",
      "repo": "$REPO",
      "state": "OPEN"
    }
  ))
fi
```

### 4. Update WORK_SPEC.md

Iterate through fetched GitHub issues with proper categorization:

```markdown
For each issue in fetched issues:
  - Extract issue type from labels (epic, story, task, technical-design)
  - Extract issue number, title, and URL
  - Check parent relationships (parent-epic, parent-story)
  
  Based on type:
  - Epic → Update "Features (GitHub Epics)" section
  - Story → Update "Active Stories (GitHub Issues)" section  
  - Task → Update "Current Tasks (GitHub Issues)" section
  - TD → Update "Technical Design Documents" section
  
  Format entry:
  - [Title](GitHub URL) #{number}
  - Include parent reference if exists
  - Note local spec path if mapping exists
```

### 5. Update github-mapping.md

Maintain comprehensive mapping with metadata:

```yaml
# github-mapping.md structure
---
last_sync: {{ISO_DATETIME}}
repository: {owner}/{repo}
total_issues: {count}
---

## Issue Mappings
- Issue #{number} → {local_spec_path}
- Issue #{number} → {local_spec_path}

## Orphaned Specs (No GitHub Issue)
- {local_spec_path} - Consider creating issue or archiving

## Closed Issues (Need Cleanup)  
- Issue #{number} (closed) → {local_spec_path} - Archive local spec
```

### 6. Discrepancy Resolution

Handle synchronization discrepancies systematically:

```yaml
discrepancy_types:
  orphaned_local_specs:
    # Local specs without GitHub issues
    action: Report for review, suggest creating issue or archiving
    
  closed_github_issues:
    # GitHub issues closed but local specs active
    action: Mark local specs as archived, update WORK_SPEC
    
  status_mismatches:
    # GitHub status differs from local progress
    action: Report for human review, don't auto-resolve
    
  missing_parent_links:
    # Issues without proper parent relationships
    action: Report and suggest link updates
```

### 7. Generate Report and Update State

Create comprehensive sync report:

```markdown
## GitHub Sync Report - {{ISO_DATE}}
- **Repository**: {owner}/{repo}
- **Issues Synced**: {count}
- **New Issues**: {new_count}
- **Updated Issues**: {updated_count}
- **Orphaned Specs**: {orphan_count}
- **Closed Issues**: {closed_count}

### Actions Taken
- Updated WORK_SPEC.md with {X} changes
- Updated github-mapping.md with {Y} mappings
- Identified {Z} discrepancies for review

### Recommendations
- [Specific actions needed for discrepancies]
```

Update state files:
- activeContext.md: Note sync completion and any issues
- progress.md: Update GitHub integration metrics

## Error Handling

- **Network failures**: Fall back to github-cache workflow
- **API rate limiting**: Report limit, use cached data
- **Authentication failures**: Prompt for re-authentication
- **Malformed data**: Skip problematic issues, report in summary
- **Partial sync**: Continue with available data, note gaps

## Performance Optimizations

- **Incremental sync**: Only fetch changed issues since last sync
- **Batch operations**: Update files in single operations
- **Cache frequently accessed data**: Store in github-mapping.md
- **Parallel processing**: Process multiple issues concurrently if possible

## Output Files
- `.holicode/specs/WORK_SPEC.md` (updated with current GitHub state)
- `.holicode/state/github-mapping.md` (updated with mappings and metadata)
- `.holicode/state/gitContext.md` (cached repository info)
- `.holicode/state/activeContext.md` (updated with sync status)
- `.holicode/state/progress.md` (updated with sync metrics)
- `.holicode/analysis/reports/github-sync-{date}.md` (optional detailed report)

## Integration with Other Workflows

### Triggers This Workflow
- Manual execution: `/github-sync.md`
- Scheduled execution: Daily/weekly cron
- After major GitHub operations: Bulk issue creation
- Before offline work: Pre-cache GitHub state

### This Workflow Triggers
- `/github-cache.md`: If online, trigger cache update
- `/state-update.md`: If significant changes detected
- `/task-handoff.md`: If orphaned specs need attention

## Next Steps After Completion
**Workflow Completed**: GitHub Sync
- **Issues Synced**: {count}
- **Discrepancies Found**: {count}
- **Cache Updated**: {yes/no}
**Recommended Next Step**: Review discrepancies if any, or continue with main workflow
