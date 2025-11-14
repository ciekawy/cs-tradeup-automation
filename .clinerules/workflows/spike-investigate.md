# SPIKE Investigation Workflow

## Agent Identity
Role: Technical Investigator
Responsibilities: Research unknowns, test hypotheses, document findings
Success Criteria: Answer investigation question within time box

## DoR
- [ ] SPIKE task exists with clear question
- [ ] Time box defined (max 4 hours)
- [ ] Success criteria specified

## Process

### 1. Load SPIKE Specification
Read the SPIKE task from `.holicode/specs/tasks/SPIKE-{id}.md`

### 2. Research Phase
- Review existing patterns in `.holicode/patterns/`
- Search relevant documentation
- Analyze similar implementations
- Research external resources

### 3. Hypothesis Testing
- Create minimal PoC if needed
- Test assumptions
- Document what works and what doesn't
- Identify edge cases

### 4. Documentation
Update the SPIKE task with:
- **Findings**: What was learned
- **Recommendation**: How to proceed
- **New patterns**: Any patterns to add to library
- **Remaining unknowns**: What still needs investigation

### 5. Update Parent Task
- Update parent task with findings
- Reduce complexity score based on learnings
- Add implementation approach

### 6. Pattern Extraction
If new patterns discovered:
- Document in relevant `.holicode/patterns/` file
- Update retro-inbox.md with learning

## DoD
- [ ] Question answered or declared unanswerable
- [ ] Findings documented in SPIKE
- [ ] Parent task updated
- [ ] Patterns extracted to library (if applicable)
- [ ] Time box respected
- [ ] retro-inbox.md updated with learnings

## Time Box Management
```yaml
time_management:
  max_duration: 4_hours
  checkpoints:
    - 1_hour: Assess progress
    - 2_hours: Decide on approach
    - 3_hours: Start documenting
    - 4_hours: HARD STOP
```

## Investigation Techniques

### Pattern Matching
Check if the problem matches any existing patterns:
- Testing issues → `.holicode/patterns/testing-cookbook.md`
- TypeScript problems → `.holicode/patterns/typescript-patterns.md`
- Docker challenges → `.holicode/patterns/docker-patterns.md`
- Configuration issues → `.holicode/patterns/configuration-patterns.md`
- Security concerns → `.holicode/patterns/security-checklist.md`
- Reliability needs → `.holicode/patterns/reliability-patterns.md`

### Minimal PoC Creation
When creating a PoC:
- Keep it minimal (just enough to test hypothesis)
- Document assumptions
- Test edge cases
- Measure performance if relevant

### Documentation Template for Findings
```markdown
## Findings
**Question**: [Original investigation question]
**Answer**: [Clear answer or "Unable to determine"]

### What Worked
- [Approach that succeeded]
- [Key insight gained]

### What Didn't Work
- [Failed approach and why]
- [Incorrect assumption identified]

### Recommendation
[Clear recommendation for how to proceed]

### New Patterns Discovered
[Any reusable patterns to add to library]

### Remaining Unknowns
[What still needs investigation]

### Time Spent
[Actual time spent on investigation]
```

## Common Investigation Areas

### Performance Issues
- Profile the code
- Identify bottlenecks
- Test optimization strategies
- Document trade-offs

### Integration Problems
- Test API contracts
- Verify data formats
- Check authentication/authorization
- Document integration patterns

### Configuration Mysteries
- Test different configurations
- Document what each setting does
- Identify dependencies between settings
- Create minimal working config

### Testing Challenges
- Try different mocking strategies
- Test isolation vs integration approaches
- Document test patterns that work

## Exit Criteria
Investigation ends when:
1. Question is answered definitively
2. Time box expires
3. Determined unanswerable with current resources
4. Blocked by external dependencies

## Next Steps After Completion
**Workflow Completed**: SPIKE Investigation
**Actions Required**:
1. Update parent task with findings
2. Create follow-up SPIKEs if needed
3. Add patterns to library
4. Update WORK_SPEC.md if scope changed

**Handoff to Implementation**:
If SPIKE successful, parent task should now have:
- Clear implementation approach
- Reduced complexity score
- Known patterns to apply
- Identified risks and mitigations
