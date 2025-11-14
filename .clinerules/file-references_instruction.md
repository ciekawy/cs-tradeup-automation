# File Reference (ANCHOR) Instruction 
- when anchoring referencing files to be accessed use strictly NO ANY QUOTES (neither backticks, apostrophes) just start with two characters: `@/` followed by relative path.
- in all other case DO NOT use `@/` but just regular quoted path
- You can reference either single file - e.g. @/README.md (no quotations!) or a path which will thus pulls in content of all top level files in this path (no recursion) - e.g. @./mementis/state/ - this is prefered if all files in a path are to be read
- when mentioning same file in other places, just use `./regular/path/to/file.ext` in `backticks`

## Anchor ONLY ONCE
each file can be Anchored with `@/` prefix ONLY ONCE - in all other cases use regular relative path
- IMPORTANT: prefer using reference map section, and in all other sections simply do not anchor.

