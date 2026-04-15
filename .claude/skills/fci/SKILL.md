---
name: fci
description: >-
  Fix CI pipeline failures blocking PR merge. Use when CI checks fail,
  'pipeline broken', 'build failing', 'fix CI', or 'checks not passing'.
  NOT for debugging runtime bugs (use /dbg), NOT for code review (use /sr).
argument-hint: [workflow-name or run-id]
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
disable-model-invocation: true
---

# Fix CI Issues Command

> **Announcement**: Begin with: "I'm using the **fci** skill for CI failure resolution."

## PRIMARY OBJECTIVE
Fix all CI pipeline failures blocking the PR merge while maintaining code quality and test integrity.

## SCOPE
- Supports the project CI pipeline as configured in the repository
- If `$ARGUMENTS` specifies a workflow outside the project scope, inform the user and suggest manual investigation

## CONTEXT & CONSTRAINTS
- CI pipeline failed during merge attempt to main branch
- Must resolve all failures without compromising code quality
- Preserve existing test coverage and validation logic
- CI includes: `cd client && npm run check`, `cd client && npx vitest run`, `cd client && npm run build`, and any project-specific checks
- **NEVER** use `any` type, `@ts-ignore`, `// eslint-disable`, or architectural shortcuts to make CI pass
- Follow project architecture rules (see coding-conventions skill)

## RELATED SKILLS
- `/dbg` - Runtime bugs requiring instrumentation and evidence gathering
- `/sr` - Post-fix code review before re-attempting merge
- `/prc` - Addressing reviewer comments on the PR

## ANALYSIS REQUIREMENTS
1. **Identify CI Failures:**
   - Run `gh workflow list` if you are unsure of the workflow name
   - Run `gh run list --limit=3` to check recent CI status
   - Review failure logs (`gh run view <run-id> --log`) to identify specific issues
   - Categorize failures by type (linting, tests, types, build, other)

2. **Execute Diagnostic Checks:**
   - Ensure dependencies are installed (run project install command)
   - Type check: `cd client && npm run check`
   - Test suite: `cd client && npx vitest run`
   - Build: `cd client && npm run build`

## RESOLUTION PROCESS
1. **Address Type Errors:**
   - Resolve typing errors surfaced by lint/test/typecheck output
   - Add precise typings rather than suppressing warnings

2. **Resolve Test Failures:**
   - Fix failing tests by correcting implementation bugs
   - DO NOT simplify tests or reduce assertions
   - Maintain or improve test coverage (>=80% target)

3. **Fix Linting Issues:**
   - Address linter violations
   - Update tests/fixtures when necessary rather than suppressing rules

4. **Security Issues:**
   - Address any dependency vulnerability findings that surface during investigation

5. **Build Issues:**
   - Ensure build succeeds
   - Fix any import or runtime errors

## VERIFICATION REQUIREMENTS
Before completion, execute ALL checks and confirm passing:
```bash
# Run full CI validation suite
cd client && npm run check && \
npx vitest run && \
npm run build
```

## TROUBLESHOOTING
- `gh` auth failure: Run `gh auth status`; prompt user to run `gh auth login` if needed
- Docker not running: Run `docker info`; inform user to start Docker Desktop
- DB connection refused: Verify test database is running; check port conflicts
- Language version mismatch: Check version files (`.nvmrc`, `.tool-versions`, etc.) and use appropriate version manager

## DEFINITION OF DONE
- [ ] All CI checks pass (typing, tests, build)
- [ ] Test coverage maintained at >=80%
- [ ] No test logic simplified or removed
- [ ] Security vulnerabilities resolved (if applicable)
- [ ] Build succeeds
- [ ] GitHub CI status shows green checkmark
- [ ] Ready for clean merge to main branch
