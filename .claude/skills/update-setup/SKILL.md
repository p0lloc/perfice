---
name: update-setup
description: >-
  Pull upstream workflow changes from claudops into your local .claude/ folder.
  Fetches the latest from the remote repo, shows what changed, asks what to update,
  and warns about conflicts with local customizations. Only touches upstream-tracked
  files — your custom local skills, agents, and hooks are never modified or removed.
  Use when asked to 'update setup', 'pull workflow changes', 'sync claude config',
  'update workflows', 'update skills', 'check for updates', or 'update-setup'.
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Write
  - Edit
  - AskUserQuestion
  - Agent
---

# Update Setup — Upstream Sync Wizard

> **Announcement**: "Checking for upstream workflow updates from **claudops**…"

Sync the local `.claude/` folder with the latest changes from the upstream claudops repository. Shows a categorized changelog, warns about conflicts, and lets the user cherry-pick what to update.

## Core Principle — Upstream-Only Scope

**This skill only tracks files that exist in the upstream claudops repo.** Users may have their own custom skills, agents, hooks, and config files in `.claude/` — these are NEVER touched, modified, flagged, or removed. The comparison is strictly: "for each file that upstream ships, what's the local state?"

- If upstream has `skills/dbg/SKILL.md` and local also has it → compare for changes
- If local has `skills/my-custom-tool/SKILL.md` that upstream doesn't → **ignore completely**, don't even mention it
- If upstream removes `skills/fci/SKILL.md` that local still has → flag as "removed upstream" — the user decides whether to delete their local copy
- New upstream files that don't exist locally → offer to add them

## Constants

- **Upstream repo**: `https://github.com/alexandrbasis/claudops`
- **Upstream branch**: `main`
- **Local path**: `.claude/` in the current working directory
- **Temp clone dir**: `/tmp/claudops-upstream-sync`

## Process

### Phase 1: Fetch Upstream

1. Remove any stale temp dir: `rm -rf /tmp/claudops-upstream-sync`
2. Shallow clone the upstream repo:
   ```bash
   git clone --depth 1 --single-branch --branch main \
     https://github.com/alexandrbasis/claudops.git \
     /tmp/claudops-upstream-sync 2>&1 | tail -5
   ```
3. Confirm clone succeeded. If not, report the error and stop.

### Phase 2: Categorize Changes (Upstream-Driven)

Compare **only upstream files** against their local counterparts. Local-only files are completely ignored.

Launch **1 general-purpose Agent** with this prompt:

```
You are comparing an upstream workflow template against a local customized copy.
Your job is to identify what changed UPSTREAM and how it relates to local state.

UPSTREAM: /tmp/claudops-upstream-sync/.claude/
LOCAL:    {CWD}/.claude/

## CRITICAL SCOPE RULE
Only iterate over UPSTREAM files. Never flag, mention, or categorize local-only files.
The user may have custom skills, agents, hooks that don't exist upstream — those are theirs and must be invisible to this comparison.

## Steps

1. List ALL files in upstream .claude/ (using Glob "**/*" under the upstream path)

2. For EACH upstream file, determine its status:

   a. **Skip entirely** — don't process these:
      - .claude/settings.json and .claude/settings.local.json (always local config)
      - .claude/hooks/logs/* (runtime state)
      - Any .gitkeep files
      - CLAUDE.md (project-level config, always local)

   b. **Check if it exists locally at the same relative path**:

      - **Does NOT exist locally** → categorize as **NEW**
        - But first check: does local have the same file with a `.disabled` suffix?
          (e.g., upstream has `skills/fci/SKILL.md`, local has `skills/fci/SKILL.md.disabled`)
          If so, categorize as **DISABLED_LOCALLY** instead of NEW — the user intentionally turned it off.

      - **Exists locally** → compare them:
        1. Run: diff <upstream_file> <local_file> | head -120
        2. If identical → **UNCHANGED**
        3. If different, determine the nature of the difference:

           **For skills (coding-conventions/SKILL.md, review-conventions/SKILL.md) and agent files that contain {{PLACEHOLDER}} patterns upstream:**
           - Read both files fully
           - If upstream has {{PLACEHOLDER}} patterns and the ONLY differences are that local has filled in those placeholders with actual values → **PLACEHOLDER_ONLY** (skip — not a real change)
           - If upstream has structural changes BEYOND placeholder differences (new sections added, sections removed, instructions rewritten, new rules, changed logic) → **MODIFIED**
           - When determining this: ignore whitespace differences and minor formatting. Focus on whether the INSTRUCTIONS or STRUCTURE changed.

           **For all other files (hooks, scripts, templates, docs, non-convention skills):**
           - Same placeholder logic applies for hook/agent files with {{PLACEHOLDER}} patterns
           - For files without placeholders: any diff = **MODIFIED**

3. To detect upstream DELETIONS: This is trickier because we only have a snapshot.
   Use a heuristic: check if upstream's skills/README.md mentions skills by name.
   Then check if local has skills/agents/hooks that WERE in a previous upstream version but are now gone.
   Actually, simpler approach: just compare the **folder names** under key directories:
   - List folder names under upstream `skills/`, `agents/`, `hooks/`, `docs/templates/`
   - List folder names under local versions of the same directories
   - Any folder that exists locally AND matches a name pattern typical of upstream skills (not custom user additions) but is MISSING from upstream → flag as **POSSIBLY_REMOVED_UPSTREAM**
   - Since we can't be 100% sure, always present these as suggestions, not definitive removals
   NOTE: Err on the side of NOT flagging. If uncertain whether something is an upstream file or a user's custom file, skip it. Only flag obvious cases where the file/folder name exactly matches a known upstream pattern.

## Output Format

Return a structured report in this EXACT format:

### NEW FILES (available upstream, not present locally)
- `path/to/file.md` — [1-line description of what this file does based on reading it]
...

### MODIFIED FILES (structural changes beyond placeholder fills)
- `path/to/file.md` — [1-line summary of what changed]
  WHAT CHANGED: [2-3 line description of the meaningful upstream difference]
  CONFLICT RISK: [none|low|high] — [reason]
  - none: upstream changed, local is still template/unmodified
  - low: upstream changed instructions/structure, local only has placeholder fills
  - high: both upstream AND local have custom changes that may conflict
...

### REMOVED UPSTREAM (was a standard upstream file, now gone)
- `path/to/file.md` — [what this was]
  REPLACEMENT: [if upstream replaced it with something else, note the new file]
...

### DISABLED LOCALLY (upstream has it, local has it .disabled)
- `path/to/file.md` — [note: upstream version may have updates]
...

### UNCHANGED
- [count] files identical to upstream

### PLACEHOLDER-ONLY DIFFERENCES (skipped — not real changes)
- [count] files differ only in filled placeholder values

If a category has no entries, write "(none)" under it.
```

### Phase 3: Present Changes to User

After the Agent returns, parse its report and present a clean changelog:

```
## Upstream Updates Available

### New files ([count])
[list each with description]

### Modified files ([count])
[list each with change summary and conflict risk]

### Removed upstream ([count])
[list each, with replacement note if applicable]

### Disabled locally with upstream updates ([count])
[list — inform user the upstream version changed but they'd disabled it]
```

If ALL categories are empty (only UNCHANGED + PLACEHOLDER_ONLY): announce **"Your workflow is up to date with upstream. No changes needed."** and stop.

Then use **AskUserQuestion** with multi-select to let the user choose what to apply:

**Question 1** (if there are new files): "Which new files do you want to add?"
- Options: each new file as a selectable option + "All new files" + "None"

**Question 2** (if there are modified files): "Which modified files do you want to update?"
- Options: each modified file with conflict risk in description + "All modified files" + "None"
- For HIGH conflict risk files, add a warning prefix and explanation in description

**Question 3** (if there are removed upstream): "These files were removed upstream. Delete them locally?"
- Options: each file + "All" + "Keep all (don't delete)"

**Question 4** (if there are disabled-with-updates): "These files are disabled locally but have upstream updates. What to do?"
- Options: "Update the .disabled copies (keep disabled)" + "Re-enable with latest upstream version" + "Skip"

### Phase 4: Conflict Detection & Preview

For each MODIFIED file the user selected:

1. **CONFLICT RISK = high**: Show a preview before applying:
   - Read the upstream version (first 80 lines)
   - Read the local version (first 80 lines)
   - Explain what specifically changed upstream vs what the user customized locally
   - Use AskUserQuestion: "This file has local customizations. How should we handle `{filename}`?"
     - "Replace with upstream version (will lose local changes)"
     - "Merge: keep my local values, adopt upstream's new structure"
     - "Skip this file"

2. **CONFLICT RISK = low or none**: Queue for direct copy.

### Phase 5: Apply Selected Updates

For each approved change:

**New files**: Create parent directories if needed, then copy:
```bash
mkdir -p .claude/$(dirname {path}) && cp /tmp/claudops-upstream-sync/.claude/{path} .claude/{path}
```

**Modified files — replace mode**: Copy upstream over local:
```bash
cp /tmp/claudops-upstream-sync/.claude/{path} .claude/{path}
```

**Modified files — merge mode**: Use an Agent to intelligently merge:
```
Merge the upstream structural changes into the local file while preserving local customized values.

UPSTREAM (new structure): [full content of upstream file]
LOCAL (customized values): [full content of local file]

Rules:
- Keep ALL local filled-in values (anything that replaced a {{PLACEHOLDER}})
- Adopt new sections, rewritten instructions, removed sections, and logic changes from upstream
- If upstream added new {{PLACEHOLDER}} variables not present in local, keep them as-is — the user will run /setup to fill them
- If upstream renamed a placeholder, carry the local value to the new name
- Preserve the file's frontmatter structure (YAML header in skills/agents)
- Write the merged result directly to the local file path
```

**Deleted files**: Remove from local:
```bash
rm .claude/{path}
```
If removing the last file in a directory, also remove the empty directory.

**Disabled files with updates**: Copy upstream file to the `.disabled` path:
```bash
cp /tmp/claudops-upstream-sync/.claude/{path} .claude/{path}.disabled
```

### Phase 6: Post-Update Checks

1. **Placeholder scan**: Check if any newly added or merged files contain unfilled `{{PLACEHOLDER}}` patterns:
   ```bash
   grep -rl '{{' .claude/skills/ .claude/agents/ .claude/hooks/ --include='*.md' --include='*.py' --include='*.sh' 2>/dev/null | head -20
   ```
   If found, list the files and announce: "These files contain `{{PLACEHOLDER}}` variables. Run `/setup` to configure them for your project."

2. **New hooks check**: If any new hook files were added under `.claude/hooks/`:
   - Read `.claude/settings.json`
   - Check if the new hooks are referenced anywhere in the hooks configuration
   - If not, announce which hooks need wiring and suggest running `/setup` or adding them manually.

3. **Conflicting instructions check**: If modified files include skill or agent definitions:
   - Scan for instructions that might contradict other local skills
   - Example: if an updated skill now says "always use X" but a local custom skill says "never use X"
   - If detected, warn the user about the potential conflict with specific file paths

4. **Cleanup**: Remove the temp directory:
   ```bash
   rm -rf /tmp/claudops-upstream-sync
   ```

### Phase 7: Summary

```
## Update Complete

**Applied:**
- [count] new files added
- [count] files updated
- [count] files removed
- [count] disabled files refreshed

**Action needed:**
- [count] files have unfilled {{PLACEHOLDER}} variables — run `/setup`
- [count] new hooks need wiring into settings.json — run `/setup`

**Skipped:**
- [count] files skipped by user choice
- [count] local-only files untouched (your custom additions)
```

## Edge Cases

- **No changes found**: Announce "Your workflow is up to date." and stop after Phase 3.
- **Clone fails**: Report the git error, suggest checking network connectivity or GitHub access.
- **Local .claude/ doesn't exist**: Tell the user to clone the workflow repo first, or run `/setup` from scratch.
- **Major update detected**: If more than 5 files are MODIFIED with HIGH conflict risk, warn this is a major upstream update. Suggest reviewing the upstream repo's recent commits first: `cd /tmp/claudops-upstream-sync && git log --oneline -20`.
- **Renamed skills/agents**: If upstream removed a file AND added a similarly-named one, flag it as a rename and offer to migrate.
- **Binary/non-text files**: Skip diffing, just check existence and file size.
