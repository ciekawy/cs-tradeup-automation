# GitHub Cache Workflow

## Agent Identity
Role: Manage offline GitHub cache for disconnected operation
Responsibilities:
- Cache GitHub issues when online
- Provide cached data when offline
- Track cache freshness
- Enable offline-first development

## Purpose (KISS Principle)
Provide simple file-based caching of GitHub data to enable workflows to continue operating when GitHub is unreachable. NOT a complex synchronization system.

## Definition of Ready (DoR)
- [ ] GitHub MCP tools available OR explicit offline mode
- [ ] `.holicode/cache/` directory exists (create if needed)
- [ ] Repository context available (owner/repo)

## Definition of Done (DoD)
- [ ] GitHub issues cached in `.holicode/cache/github/issues/`
- [ ] Cache metadata updated with timestamp
- [ ] Stale cache entries pruned (>30 days)
- [ ] Summary report of cache status

## Process

### 1. Detect Mode

Check GitHub availability and determine operating mode:

```yaml
online_check:
  try:
    - Test GitHub MCP connectivity
    - Check network status
  catch:
    - Set mode: offline
    - Report: "Working in offline mode"
```

### 2. Online Mode - Update Cache

When GitHub is available, refresh the cache:

```bash
# Fetch all open issues
issues = list_issues(state="OPEN")

# Cache each issue
for issue in issues:
  cache_path = ".holicode/cache/github/issues/{issue.number}.json"
  write_to_file(cache_path, issue)

# Update cache metadata
metadata = {
  "last_sync": "{{ISO_DATETIME}}",
  "total_issues": count,
  "repository": "{owner}/{repo}"
}
write_to_file(".holicode/cache/github/metadata.json", metadata)
```

### 3. Offline Mode - Serve from Cache

When workflows need GitHub data but it's unavailable:

```bash
# When workflows need GitHub data
if !github_available:
  # Read from cache
  issues = read_directory(".holicode/cache/github/issues/")
  # Warn about freshness
  metadata = read(".holicode/cache/github/metadata.json")
  if age(metadata.last_sync) > 24h:
    warn("Cache is {age} old")
```

### 4. Cache Pruning

Maintain cache hygiene:
- Remove closed issues from cache
- Delete entries older than 30 days
- Compress large cache files if needed

### 5. Report Cache Status

Generate summary of cache state:
```markdown
## GitHub Cache Status
- **Mode**: {online|offline}
- **Last Sync**: {timestamp}
- **Cached Issues**: {count}
- **Cache Age**: {hours/days}
- **Stale Entries**: {count}
```

## Integration Points

### Input Sources
- GitHub MCP tools (when online)
- `.git/config` for repository detection
- Existing cache files (when offline)

### Output Targets
- `.holicode/cache/github/issues/` - Individual issue files
- `.holicode/cache/github/metadata.json` - Cache metadata
- `.holicode/cache/github/mappings.json` - Issue to local spec mapping

### Usage by Other Workflows
- Called by other workflows when GitHub unavailable
- Triggered manually for pre-offline work
- Used by `task-implement.md` as fallback

## Cache Structure

```
.holicode/cache/
└── github/
    ├── metadata.json      # Sync timestamp, stats
    ├── issues/           # Individual issue files
    │   ├── 123.json
    │   ├── 124.json
    │   └── ...
    └── mappings.json     # Issue ID to local spec mapping
```

## Error Handling

- **Network failures**: Switch to offline mode gracefully
- **Corrupted cache**: Regenerate on next sync
- **Missing cache**: Work without GitHub data, warn user
- **API rate limits**: Report and use cache
- **Authentication failures**: Fall back to cached data

## Example Execution

### Online Cache Update
```bash
# Detect repository
REPO=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
OWNER=$(echo $REPO | cut -d'/' -f1)
REPO_NAME=$(echo $REPO | cut -d'/' -f2)

# Create cache directory
mkdir -p .holicode/cache/github/issues

# Fetch and cache issues
# Use MCP tool: list_issues(owner=$OWNER, repo=$REPO_NAME, state="OPEN")
# For each issue: write to .holicode/cache/github/issues/{number}.json

# Update metadata
echo "{
  \"last_sync\": \"$(date -Iseconds)\",
  \"repository\": \"$OWNER/$REPO_NAME\",
  \"total_issues\": $COUNT
}" > .holicode/cache/github/metadata.json
```

### Offline Fallback
```bash
# Check cache freshness
if [ -f ".holicode/cache/github/metadata.json" ]; then
  LAST_SYNC=$(jq -r .last_sync .holicode/cache/github/metadata.json)
  echo "Using cached GitHub data from $LAST_SYNC"
  
  # Serve cached issues
  for issue in .holicode/cache/github/issues/*.json; do
    # Process cached issue
  done
else
  echo "⚠️ No GitHub cache available, operating without issue data"
fi
```

## Performance Considerations

- **Incremental Updates**: Only fetch issues updated since last sync
- **Selective Caching**: Cache only necessary fields to reduce size
- **Lazy Loading**: Load cache files on-demand, not all at once
- **Background Sync**: Update cache asynchronously when possible

## Security Considerations

- **No Sensitive Data**: Don't cache tokens or private information
- **File Permissions**: Ensure cache files are readable only by owner
- **Gitignore**: Add `.holicode/cache/` to `.gitignore`

## Next Steps After Completion

**Workflow Completed**: GitHub Cache
**Cache Status**: {online|offline}, {count} issues cached
**Recommended**: Continue with main workflow using cached data if needed
