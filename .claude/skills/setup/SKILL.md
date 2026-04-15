---
name: setup
description: >-
  Configure workflow for your codebase. Run after cloning .claude/ into your repo.
  Use when asked to 'setup', 'configure workflow', 'initialize .claude', 'setup wizard',
  'configure for my project', or when the codebase has unconfigured {{PLACEHOLDER}} variables.
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Write
  - Edit
  - AskUserQuestion
  - Agent
  - TodoWrite
---

# Setup Wizard

> **Announcement**: "Running the **setup wizard** to configure this workflow for your codebase."

Configure all workflow skills, agents, and hooks to match the target codebase's tech stack, structure, and conventions. This skill reads the codebase, detects patterns, confirms with the user, then fills in `{{PLACEHOLDER}}` variables across all workflow files.

## When to Run

- First time after cloning `.claude/` into a new repo
- When switching to a different project
- When `{{PLACEHOLDER}}` variables are visible in skill/agent files
- When the user says "setup", "configure", or "initialize"

## Process

### Phase 1: Codebase Discovery (Parallel Agents)

Launch **3 Explore agents in parallel** to scan the target codebase:

**Agent 1 — Tech Stack Detection:**
```
Detect the project's technology stack by examining:
- package.json / go.mod / pyproject.toml / Gemfile / Cargo.toml / pom.xml
- Import patterns in source files (framework detection)
- ORM/database config files (prisma/, alembic/, db/migrate/, etc.)
- Auth configuration (firebase config, auth0, clerk, passport setup)
- Test configuration (jest.config, pytest.ini, vitest.config, .rspec)
- CI/CD files (.github/workflows/, .gitlab-ci.yml, Jenkinsfile)

Return a structured report:
- Language: [TypeScript/Python/Go/Ruby/Java/Rust/etc.]
- Framework: [NestJS/Express/Next.js/Django/FastAPI/Rails/Gin/Spring/etc.]
- ORM: [Prisma/TypeORM/Drizzle/SQLAlchemy/GORM/ActiveRecord/etc.] or "none"
- Auth: [Firebase JWT/Auth0/Clerk/Passport/custom JWT/etc.] or "none detected"
- Test framework: [Jest/Vitest/pytest/RSpec/go test/JUnit/etc.]
- Package manager: [npm/yarn/pnpm/pip/poetry/bundler/cargo/etc.]
- CI system: [GitHub Actions/GitLab CI/etc.] or "none detected"
```

**Agent 2 — Project Structure Detection:**
```
Map the project's directory structure:
- Is this a monorepo? (multiple package.json, workspaces, nx.json, turbo.json)
- Source directories (src/, app/, lib/, cmd/, backend/src/, etc.)
- Test directories (tests/, __tests__/, test/, spec/, *_test.go, etc.)
- Documentation directories (docs/, doc/, documentation/)
- Config files (tsconfig.json, pyproject.toml, go.mod, etc.)
- Schema/migration files (prisma/schema.prisma, db/schema.rb, alembic/, etc.)
- Architecture docs (any file describing project structure or conventions)

Return a structured report:
- Monorepo: yes/no (if yes, list workspace names and paths)
- Source dir(s): [paths]
- Test dir(s): [paths]
- Docs dir: [path] or "none"
- Config files: [list]
- Schema path: [path] or "N/A"
- Architecture docs found: [paths] or "none"
```

**Agent 3 — Commands & Conventions Detection:**
```
Detect the project's standard commands and conventions:
- Read package.json scripts / Makefile / pyproject.toml scripts / taskfile.yml
- Identify: test command, lint command, build command, format command, typecheck command, coverage command
- Check for existing .claude/ or .cursor/ configuration
- Read any architecture docs found to understand patterns (DDD, MVC, hexagonal, etc.)
- Detect architecture layers from directory structure (controllers/, services/, models/, etc.)

Return a structured report:
- Test command: [command]
- Lint command: [command] or "none"
- Build command: [command] or "none"
- Format command: [command] or "none"
- Typecheck command: [command] or "none"
- Coverage command: [command] or "none"
- Architecture pattern: [description] or "not detected"
- Layer structure: [description of layers and their responsibilities]
- Layer rules: [dependency direction, encapsulation rules]
- Existing .claude/: yes/no (if yes, list what's configured)
```

### Phase 2: User Confirmation (Interactive)

Present discovery results and confirm with user. Use `AskUserQuestion` for each category.

**Round 1 — Tech Stack:**
```
question: "We detected the following tech stack. Is this correct?"
options:
  - "Yes, this is correct"
  - "Let me correct some values" (then ask for corrections)
```
Show: Language, Framework, ORM, Auth, Test framework, Package manager

**Round 2 — Project Structure:**
```
question: "We detected this project structure. Correct?"
options:
  - "Yes, correct"
  - "Let me adjust paths"
```
Show: Monorepo status, Source/Test/Docs dirs, Schema path

**Round 3 — Commands:**
```
question: "These are the detected commands. Correct?"
options:
  - "Yes, correct"
  - "Let me fix some commands"
```
Show: All detected commands (test, lint, build, format, typecheck, coverage)

**Round 4 — Architecture:**
```
question: "This is the detected architecture pattern. Correct?"
options:
  - "Yes, correct"
  - "Let me describe the architecture"
  - "No specific architecture pattern"
```
Show: Architecture pattern, layer structure, layer rules

### Phase 3: Apply Configuration

After confirmation, fill in all `{{PLACEHOLDER}}` variables **directly in the files** across the workflow. No intermediate config files — the wizard edits skills, agents, and hooks in-place.

**Step 1: Fill convention skills**

Update `coding-conventions/SKILL.md` and `review-conventions/SKILL.md` — these are the most important files as they're preloaded into all review agents and the developer agent via `skills:` frontmatter.

Replace ALL `{{VARIABLE}}` placeholders with detected values. For multi-line sections (`{{LAYERS}}`, `{{LAYER_RULES}}`), generate complete, well-structured content based on detection results.

**Step 2: Fill remaining skills and agents**

Scan ALL `.md` files under `.claude/skills/` and `.claude/agents/` for remaining `{{PLACEHOLDER}}` patterns. For each file with placeholders:

1. Read the file
2. Identify all `{{VARIABLE}}` placeholders
3. Replace with confirmed values
4. Show the user a brief summary: "Updated [filename]: replaced X placeholders"

Ask user confirmation every 5 files: "Continue applying to next batch?"

**Step 3: Fill hook scripts**

Scan `.sh` and `.py` files in `.claude/hooks/` for `{{PLACEHOLDER}}` patterns and replace with confirmed values. Hook scripts use `{{VARIABLE}}` syntax — Python hooks use Python literal syntax (lists, tuples), shell hooks use plain strings.

**Hook placeholder mapping** — derive each value from Phase 1 detection results:

| Hook File | Placeholder | How to Fill |
|---|---|---|
| **lint-on-write.py** | `{{LINT_TARGETS}}` | Python list of source dirs, e.g. `["src"]` or `["backend", "frontend"]` |
| | `{{LINT_EXTENSIONS}}` | Python tuple of extensions, e.g. `(".ts", ".tsx")` or `(".py",)` |
| | `{{SKIP_PATTERNS}}` | Python tuple of path substrings to skip, e.g. `("node_modules", "dist/", "prisma/migrations")` |
| | `{{FORMAT_CMD}}` | Python list for formatter, e.g. `["npx", "prettier", "--write"]` or `["npx", "eslint", "--fix"]`. If no formatter detected, set to `[]` |
| **ts-typecheck-on-write.py** | `{{TYPECHECK_TARGET}}` | Directory with tsconfig.json relative to project root. `"."` for root-level tsconfig, or subdir like `"backend"` |
| | `{{TYPECHECK_CMD}}` | Python list, e.g. `["npx", "tsc", "--noEmit"]` |
| | `{{TYPECHECK_EXTENSIONS}}` | Python tuple, e.g. `(".ts", ".tsx")` |
| **test-after-edit.py** | `{{TEST_CMD_LIST}}` | Python list form of test command, e.g. `["npm", "run", "test:silent"]` or `["pytest", "-q"]` |
| | `{{SOURCE_DIRS}}` | Python list of watched dirs, e.g. `["src"]` or `["backend/src", "lib"]` |
| | `{{SOURCE_EXTENSIONS}}` | Python tuple matching language, e.g. `(".ts", ".tsx")` or `(".py",)` |
| **bash-guard.sh** | `{{PROTECTED_DIRS}}` | Pipe-separated dir names, e.g. `node_modules\|src\|dist` |
| | `{{DB_DANGER_PATTERN}}` | Regex for destructive DB commands based on ORM. Prisma: `prisma migrate reset\|prisma db push --force-reset`. Django: `migrate --run-syncdb\|flush`. Empty if no ORM. |
| | `{{DB_SAFE_CMD}}` | Safe alternative, e.g. `prisma migrate dev` or `python manage.py migrate` |
| | `{{DB_MIGRATE_PATTERN}}` | Regex for migration commands. Prisma: `prisma migrate`. Django: `manage.py migrate`. Empty if no ORM. |
| | `{{DB_MIGRATE_SAFE_FLAG}}` | Safety flag. Prisma: `--create-only`. Django: `--plan`. Empty if no ORM. |
| | `{{TEST_SILENT_PATTERN}}` | Regex matching test commands, e.g. `npm run test\|npm test`. Empty to disable enforcement. |
| | `{{TEST_SILENT_SUFFIX}}` | Suffix to enforce, e.g. `:silent` or ` --quiet` |
| **file-guard.sh** | `{{PROTECTED_FILE_PATTERN}}` | Regex for files needing special workflow, empty if none |
| | `{{PROTECTED_FILE_MESSAGE}}` | Block message, empty if none |
| | `{{CORE_LAYER_PATH}}` | Path substring for core/domain layer based on architecture. DDD: `/domain/`. Clean arch: `/core/`. Empty if no clear domain layer. |
| | `{{CORE_FORBIDDEN_IMPORTS}}` | Regex for forbidden imports in core layer, e.g. `from.*infrastructure\|from.*@prisma`. Empty if no core layer. |
| | `{{INTERFACE_NAMING_ENABLED}}` | `true` or `false` — enable only if codebase uses I-prefix convention |
| | `{{INTERFACE_PATH_FILTER}}` | Path filter for naming enforcement, e.g. `/src/` |
| | `{{CONSOLE_LOG_BLOCKED}}` | `true` or `false` — enable only if project uses a structured logger |
| | `{{CONSOLE_LOG_PATH_FILTER}}` | Path filter, e.g. `/src/` |
| | `{{CONSOLE_LOG_ALTERNATIVE}}` | Alternative message, e.g. `Use the Logger service instead of console.log` |
| **analytics-reminder.sh** | `{{SCREEN_FILE_PATTERN}}` | Regex for screen/page files. React Native: `/(app\|screens)/.*\.tsx$`. Next.js: `/app/.*/page\.tsx$`. Empty to disable. |
| | `{{ANALYTICS_REMINDER_MESSAGE}}` | Reminder text, or empty to disable |
| **stop-guard.sh** | `{{STOP_TEST_CMD}}` | Shell test command string, e.g. `npm run test:silent` |
| | `{{STOP_BUILD_CMD}}` | Shell build command string, e.g. `npm run build` |
| **test-before-pr.sh** | `{{PR_TEST_CMD}}` | Shell test command string, e.g. `npm run test:silent` |
| | `{{PR_BUILD_CMD}}` | Shell build/typecheck command, e.g. `npx tsc --noEmit`. Empty to skip. |

**Important**: For Python hook files, placeholders are replaced with Python literals (no quotes around lists/tuples). For shell hook files, values go inside existing double quotes. When a value should be empty/disabled, use empty string `""` for shell or `[]`/`()` for Python.

**Step 4: Wire ALL hooks into settings.json**

Wire every configured hook into `.claude/settings.json`. Group by event and matcher:

**PreToolUse — Bash matcher** (add to existing or create):
1. `bash-guard.sh` — blocks `rm -rf`, force-push, destructive DB commands
2. `test-before-pr.sh` (timeout: 120) — blocks `gh pr create` unless tests + build pass

**PreToolUse — Write|Edit matcher** (add to existing or create):
3. `file-guard.sh` — architecture layer boundary enforcement

**PostToolUse — Write|Edit matcher** (create new):
4. `lint-on-write.py` — auto-format after file edits
5. `ts-typecheck-on-write.py` (timeout: 60) — run tsc after TS edits
6. `test-after-edit.py` (timeout: 120) — run tests after source edits (has 30s cooldown)
7. `analytics-reminder.sh` — remind about analytics for new screens/pages

**Stop** (add to existing or create):
8. `stop-guard.sh` — verification checklist before stopping (once per 24h)
9. `auto-commit-on-stop.sh` — WIP auto-commit on session end

**Wiring rules:**
- Add to **existing** matcher arrays when the event+matcher already exists in settings.json
- Create new matcher entries when they don't exist
- Preserve all existing hooks (like `pre-commit-validation.py`, `command-logger.py`, `sensitive-file-guard.py`, `read-counter.py`, `cost-tracker.py`)
- Set `timeout` for hooks that run external commands (typecheck, test, PR gate)

If the codebase has a clear architecture pattern (DDD, MVC, etc.), generate `code-analysis/references/project-checks.md` with architecture-specific grep commands tailored to the detected source directory and patterns.

**Step 6: Prune irrelevant skills**

Based on detected tech stack, identify skills that are not applicable to this project. For each irrelevant skill, ask the user whether to disable it.

Irrelevant skill detection rules:
- `fci` (Fix CI) — skip if no CI config detected
- `cc-linear` — skip if no Linear integration detected
- `codex-cli` — skip if user doesn't use Codex
- `cursor-cli` — skip if user doesn't use Cursor
- `gemini-cli` — skip if user doesn't use Gemini CLI
- `parallelization` — skip if project is too small (< 5 source files)

To disable a skill: rename `SKILL.md` to `SKILL.md.disabled` in the skill's directory. This prevents Claude Code from loading it while preserving the file for re-enabling later.

Present as a single AskUserQuestion with multiSelect:
```
question: "These skills may not be relevant to your project. Which ones should we disable?"
options: [list of detected irrelevant skills with reasons]
multiSelect: true
```

### Phase 4: Verification

After all files are updated:

1. Run: `grep -r '{{' .claude/skills/ .claude/agents/ .claude/hooks/ --include='*.md' --include='*.sh' --include='*.py' | head -30`
2. If any `{{PLACEHOLDER}}` variables remain, report them to the user
3. Show a summary of all changes made (skills, agents, AND hooks)

## Output

Print a completion summary:
```
Setup complete!

Tech stack: [LANGUAGE] + [FRAMEWORK] + [ORM]
Architecture: [ARCHITECTURE]
Files configured: X skills, Y agents, Z hooks
Skills disabled: [list or "none"]

Hooks wired (active in settings.json):
  PreToolUse:Bash
  ├── bash-guard.sh             — blocks rm -rf, force-push, destructive DB
  └── test-before-pr.sh         — tests + build before gh pr create
  PreToolUse:Write|Edit
  └── file-guard.sh             — architecture layer enforcement
  PostToolUse:Write|Edit
  ├── lint-on-write.py          — auto-format after edits
  ├── ts-typecheck-on-write.py  — tsc after TS edits
  ├── test-after-edit.py        — tests after source edits (30s cooldown)
  └── analytics-reminder.sh     — analytics reminder for new screens
  Stop
  ├── stop-guard.sh             — verification checklist (once/24h)
  └── auto-commit-on-stop.sh    — WIP auto-commit on session end

Next steps:
- Run /sr to test the code review pipeline
- Run /ct to test task decomposition
- Edit .claude/skills/coding-conventions/SKILL.md to fine-tune conventions
```

## Re-running Setup

If the user runs `/setup` again on an already-configured repo:
1. Grep for `{{` in `.claude/` — if none found, the workflow is already configured
2. Ask: "This workflow is already configured. What would you like to do?"
   - "Reconfigure everything" — re-detect codebase, show current vs. new values, confirm changes, overwrite
   - "Update specific values" — ask which variables to change, edit only those files
   - "Cancel"

## Constraints

- NEVER delete user-customized content outside of `{{PLACEHOLDER}}` regions
- Always show what will change before writing
- All values are written directly into files — no intermediate config files
- Support monorepos by asking which workspace to configure (or configure all)
- If architecture is not detected, leave architecture sections with helpful generic content rather than empty placeholders
