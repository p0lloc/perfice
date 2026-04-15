# Project-Specific Analysis Checks

Detailed commands for project-specific code analysis. Read this when analyzing the project codebase.

## Generic Codebase Metrics

These checks work for any project.

```bash
# Total source file count
find client/src -type f -name "*.ts" -o -name "*.svelte" 2>/dev/null | wc -l

# Test file count
find client/tests -type f -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l

# Lines of code (source, excluding tests)
find client/src -type f -name "*.ts" -o -name "*.svelte" | xargs wc -l 2>/dev/null | tail -1

# Dependency count
cat client/package.json 2>/dev/null | jq '.dependencies | length'
```

## Error Handling Patterns

```bash
# Raw Error throws (should use domain exceptions instead)
grep -rn "throw new Error(" client/src --include="*.ts" --include="*.svelte" \
  | grep -v "node_modules\|spec\|test"

# Empty catch blocks (swallowed errors)
grep -rn "catch.*{" client/src --include="*.ts" --include="*.svelte" \
  | grep -v "node_modules\|spec\|test"

# TODO/FIXME/HACK markers
grep -rn "TODO\|FIXME\|HACK\|XXX" client/src --include="*.ts" --include="*.svelte" \
  | grep -v "node_modules\|__pycache__"
```

## Configuration & Security

```bash
# Hardcoded secrets (potential)
grep -rn "password\|secret\|api_key\|apikey\|token" client/src --include="*.ts" --include="*.svelte" \
  | grep -v "node_modules\|test\|spec\|\.env\.example\|__pycache__"

# Environment variable usage
grep -rn "process\.env\|import\.meta\.env" client/src --include="*.ts" --include="*.svelte" \
  | grep -v "node_modules\|__pycache__"

# Config files present
ls client/package.json client/tsconfig.json client/vite.config.ts client/svelte.config.js 2>/dev/null
```

## Architecture Layer Checks

```bash
# File distribution across top-level directories
for dir in client/src/*/; do
  echo "$(basename "$dir"): $(find "$dir" -type f | wc -l) files"
done

# Circular dependency risk: files importing from parent directories
grep -rn "from '\.\.\/" client/src --include="*.ts" --include="*.svelte" 2>/dev/null | head -20

# Model layer purity: check for forbidden imports in model/
grep -rn "@perfice/db\|@perfice/stores\|@perfice/views\|@perfice/services" client/src/model/ --include="*.ts" 2>/dev/null
```

## Schema / Data Model Health

```bash
# Database schema files
find client/src/db -type f -name "*.ts" 2>/dev/null | head -20

# Migration count
grep -rn "migration\|migrate" client/src/db --include="*.ts" 2>/dev/null | wc -l
```

## Project-Specific Checks

```bash
# Svelte component count
find client/src -name "*.svelte" 2>/dev/null | wc -l

# Store count (reactive state)
find client/src/stores -name "*.ts" 2>/dev/null | wc -l

# Service count (business logic)
find client/src/services -name "*.ts" 2>/dev/null | wc -l

# Go server service count
find server -name "*.go" -not -path "*/vendor/*" 2>/dev/null | wc -l

# Dexie collection definitions
grep -rn "class.*extends.*Dexie\|db\." client/src/db --include="*.ts" 2>/dev/null | head -10

# gRPC proto definitions
find server -name "*.proto" 2>/dev/null
```
