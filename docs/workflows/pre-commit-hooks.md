# Pre-Commit Hooks

## Overview

This project uses **husky** and **lint-staged** to ensure all commits respect code standards (formatting and lint) before being validated.

## Installed Tools

- **husky**: Manages Git hooks (notably `pre-commit`)
- **lint-staged**: Executes commands only on staged files (added with `git add`)

## Current Configuration

```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

## How It Works

### Automatic Workflow

1. You modify TypeScript files
2. You add your changes: `git add .`
3. You create a commit: `git commit -m "your message"`
4. **Automatically**, before the commit is created:
   - `biome check --write` formats and lints the modified `.ts` files
5. If everything passes, the commit is created
6. If errors remain (that Biome cannot fix), the commit is cancelled

### What Is Checked

- **Formatting**: Biome applies formatting rules (indentation, quotes, etc.)
- **Lint**: Biome checks code quality and fixes what it can
- **Imports**: Biome automatically organizes imports

### Files Affected

Only **TypeScript files (*.ts) that are staged** (added with `git add`) are checked.

## Usage Examples

### Case 1: Everything Passes

```bash
$ git add src/domain/entities/city.ts
$ git commit -m "feat: add city entity"

Preparing lint-staged...
Running tasks for staged files...
Applying modifications from tasks...
Cleaning up temporary files...

[main 1234567] feat: add city entity
 1 file changed, 20 insertions(+)
```

### Case 2: Errors Fixed Automatically

```bash
$ git add src/domain/entities/city.ts
$ git commit -m "feat: add city entity"

Preparing lint-staged...
Running tasks for staged files...
  biome check --write — modified
Applying modifications from tasks...
Cleaning up temporary files...

[main 1234567] feat: add city entity
 1 file changed, 20 insertions(+)
```

Files were reformatted and auto-corrected, then the commit was created.

### Case 3: Uncorrectable Errors

```bash
$ git add src/domain/entities/city.ts
$ git commit -m "feat: add city entity"

Preparing lint-staged...
Running tasks for staged files...
  biome check --write [FAILED]

biome check found some errors. Please fix them and try again.

src/domain/entities/city.ts
  10:5  error  'unusedVariable' is defined but never used  lint/correctness/noUnusedVariables

1 problem (1 error, 0 warnings)

husky - pre-commit hook exited with code 1 (error)
```

The commit is cancelled. You must manually fix the errors, then try again.

## Useful Commands

### Run lint-staged Manually

```bash
npx lint-staged
```

### Bypass Hook (not recommended)

If you absolutely must create a commit without going through the hooks:

```bash
git commit -m "message" --no-verify
```

**Warning**: This practice is not recommended as it can introduce non-compliant code into the repository.

### Format All Files

```bash
npm run format
```

### Lint All Files

```bash
npm run lint
```

## Installation

When you clone the project, hooks are automatically installed during `npm install` thanks to the `prepare` script:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

## File Structure

```
route-solver/
├── .husky/
│   └── pre-commit          # Hook executed before each commit
├── package.json            # lint-staged configuration
└── biome.json              # Biome configuration
```

## New Developer Setup

When a new developer clones the project:

```bash
# 1. Clone the project
git clone <repo-url>
cd route-solver

# 2. Install dependencies
npm install
# Hooks are automatically installed via the "prepare" script

# 3. Done! Hooks are operational
git add .
git commit -m "test"  # Hooks run automatically
```

## Testing the Setup

To verify everything works:

```bash
# Test 1: Create a poorly formatted file
echo "const   test    =    'hello'  ;  " > test-formatting.ts

# Test 2: Add it to staging
git add test-formatting.ts

# Test 3: Commit
git commit -m "test: verify hooks"

# Test 4: Verify the file was reformatted
cat test-formatting.ts
# Should display: const test = 'hello';

# Cleanup
git reset HEAD~1
rm test-formatting.ts
```

## Benefits

| Benefit | Impact |
|---------|--------|
| **Automatic formatting** | No need for `npm run format` before each commit |
| **Auto-corrections** | ESLint fixes what it can automatically |
| **Fast** | Only modified files are checked |
| **Guaranteed quality** | Impossible to commit non-compliant code |
| **Time saved in PRs** | Fewer comments on formatting/style |
| **Team consistency** | All developers apply the same rules |

## FAQ

### Why does my commit take time?

The hook checks and automatically corrects your files. If you have many staged files, it may take a few seconds.

### Can I temporarily disable hooks?

Yes, use `--no-verify`:

```bash
git commit -m "message" --no-verify
```

But this is not recommended for normal commits.

### Do hooks apply to unstaged files?

No, only files added with `git add` are checked.

### What about JavaScript (.js) files?

Currently, only `.ts` files are configured. Other extensions can be added in `package.json` if needed.

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Biome Documentation](https://biomejs.dev/)
