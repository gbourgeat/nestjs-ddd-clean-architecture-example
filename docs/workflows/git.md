# Git Workflow and Conventions

## Branch Strategy

### Main Branches

#### main

- **Protection**: Protected branch
- **Role**: Production code, stable and tested
- **Rules**:
  - No direct push
  - Merge only via Pull Request
  - Requires at least 1 approval
  - CI/CD must pass (all tests)
  - Branch must be up to date with base

#### develop (optional for larger projects)

- **Role**: Integration branch for features in progress
- **Rules**: Less strict than `main`, but requires PR

### Working Branches

#### Naming Convention

```
<type>/<ticket-id>-<short-description>
```

**Branch types:**

| Type | Usage | Examples |
|------|-------|----------|
| `feature/` | New functionality | `feature/RS-123-add-road-segment-endpoint` |
| `fix/` | Bug fix | `fix/RS-456-validation-error-handling` |
| `hotfix/` | Urgent production fix | `hotfix/RS-789-critical-security-patch` |
| `refactor/` | Refactoring without functional change | `refactor/RS-234-improve-controller-structure` |
| `docs/` | Documentation only | `docs/RS-567-api-documentation` |
| `test/` | Adding/modifying tests | `test/RS-890-e2e-coverage` |
| `chore/` | Maintenance tasks | `chore/RS-345-update-dependencies` |
| `perf/` | Performance optimizations | `perf/RS-678-optimize-pathfinding` |

**Description format:**

- All lowercase
- Words separated by hyphens `-`
- Maximum 50 characters
- Descriptive and explicit
- No special characters (except `-`)

## Commit Conventions

### Conventional Commits Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting, semicolons, etc. |
| `refactor` | Refactoring |
| `perf` | Performance improvement |
| `test` | Adding/modifying tests |
| `build` | Build system, dependencies |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |
| `revert` | Reverting a commit |

### Scope (optional)

The scope specifies the affected part of the project:

- `api` - REST API
- `domain` - Domain layer
- `infra` - Infrastructure
- `db` - Database
- `tests` - Tests
- `docs` - Documentation
- `deps` - Dependencies

### Commit Examples

**Simple:**

```bash
feat(api): add POST /road-segments endpoint
fix(domain): validate city names before creating segment
docs: update API documentation for road segments
test(e2e): add create road segment E2E tests
```

**With body:**

```bash
feat(api): add POST /road-segments endpoint

Implement complete endpoint to create road segments between cities.
Includes:
- Request/Response DTOs with validation
- Controller with error handling
- Use case orchestration
- 12 unit tests + 15 E2E tests

Closes #123
```

**Breaking change:**

```bash
feat(api)!: change road segment ID format

BREAKING CHANGE: Road segment IDs are now sorted alphabetically
(e.g., "lyon__paris" instead of "paris__lyon")

Closes #456
```

## Pull Requests

### PR Naming Convention

```
[<TYPE>] <Clear and concise description>
```

**PR types:**

| Type | Description | Label |
|------|-------------|-------|
| `[FEATURE]` | New functionality | `feature` |
| `[FIX]` | Bug fix | `bug` |
| `[HOTFIX]` | Urgent fix | `hotfix` |
| `[REFACTOR]` | Refactoring | `refactor` |
| `[DOCS]` | Documentation | `documentation` |
| `[TEST]` | Tests | `test` |
| `[CHORE]` | Maintenance | `chore` |
| `[PERF]` | Performance | `performance` |

**PR title examples:**

```
[FEATURE] Add POST /road-segments endpoint to create road segments
[FIX] Handle empty city names in validation
[HOTFIX] Fix SQL injection vulnerability in city search
[REFACTOR] Extract validation logic to separate service
```

## Main Branch Protection

### GitHub Configuration

**Settings > Branches > Branch protection rules for `main`:**

**Require a pull request before merging**

- Require approvals: `1` (or more depending on team size)
- Dismiss stale pull request approvals when new commits are pushed

**Require status checks to pass before merging**

- Require branches to be up to date before merging
- Required status checks: `build`, `test:unit`, `test:integration`, `test:e2e`, `lint`, `coverage`

**Require conversation resolution before merging**

- All comments must be resolved

**Allow force pushes** - DISABLED

**Allow deletions** - DISABLED

## Complete Workflow

### 1. Create a New Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/RS-123-add-road-segment-endpoint
```

### 2. Develop and Commit

```bash
# Development...

# Staging
git add src/

# Commit with convention
git commit -m "feat(api): add POST /road-segments endpoint

Implement complete endpoint to create road segments.
Includes validation, error handling, and comprehensive tests.

Closes #123"
```

### 3. Push and Create PR

```bash
# First push
git push -u origin feature/RS-123-add-road-segment-endpoint

# Subsequent pushes
git push
```

Then on GitHub:

1. Click "Compare & pull request"
2. Fill in the PR template
3. Assign reviewers
4. Add appropriate labels
5. Link the associated issue

### 4. Review and Merge

**For the author:**

- Respond to comments
- Make requested changes
- Push changes (PR updates automatically)
- Request re-review if necessary

**For the reviewer:**

- Complete review (code, tests, architecture)
- Leave constructive comments
- Approve or request changes
- Once approved, the author can merge

**Merge:**

- Recommended: **Squash and merge**
  - Keeps clean history
  - One commit per feature
- Alternative: **Rebase and merge**
  - Keeps all commits
  - Linear history

### 5. After Merge

```bash
# Return to main
git checkout main
git pull origin main

# Delete local branch
git branch -d feature/RS-123-add-road-segment-endpoint

# Remote branch is automatically deleted if configured on GitHub
```

## Essential Commands

### Status and Information

```bash
git status              # See modifications
git status -s           # Short version
git diff                # See changes
git log --oneline       # History
```

### Branches

```bash
git branch              # List branches
git checkout <branch>   # Change branch
git checkout -b <name>  # Create and switch
git branch -d <name>    # Delete local
```

### Commits

```bash
git add .               # Add all
git add <file>          # Add a file
git commit -m "msg"     # Commit
git commit --amend      # Modify last
```

### Synchronization

```bash
git pull                # Fetch and merge
git push                # Push
git push -u origin <br> # First push
git fetch               # Fetch without merging
```

### Rebase and Merge

```bash
git rebase main         # Rebase on main
git rebase --continue   # Continue after conflict
git merge main          # Merge main into branch
```

### Rollbacks

```bash
git reset --soft HEAD^  # Undo commit (keep changes)
git reset --hard HEAD^  # Undo commit (discard changes)
git reset --hard HEAD   # Discard all changes
git stash               # Set aside
git stash pop           # Retrieve
```

## Conflict Resolution

### During Rebase

```bash
# 1. Resolve conflicts in files
# 2. Add resolved files
git add .

# 3. Continue rebase
git rebase --continue

# 4. Push (force required)
git push --force-with-lease
```

### During Merge

```bash
# 1. Resolve conflicts
# 2. Add files
git add .

# 3. Commit
git commit -m "chore: resolve merge conflicts"

# 4. Push
git push
```

## Pre-Push Checklist

```bash
# Tests
npm run test:features
npm run test:e2e

# Linting
npm run lint

# Build
npm run build

# If everything passes
git push
```

## Best Practices

### Commits

**Do:**

- Make atomic commits (one logical change = one commit)
- Write clear and descriptive commit messages
- Use imperative present tense ("add" not "added")
- Reference issues in commits
- Separate subject from body with a blank line

**Don't:**

- Make commits too large (multiple features)
- Write "WIP", "fix", "update" without context
- Commit local configuration files
- Commit secrets or credentials
- Make commits with failing tests

### Pull Requests

**Do:**

- Keep PRs small and focused
- Include tests with each PR
- Update documentation if necessary
- Respond quickly to comments
- Test manually before requesting review
- Link associated issues

**Don't:**

- Create PRs over 500 lines
- Mix multiple features in one PR
- Ignore reviewer comments
- Force merge without approval
- Merge without passing tests

### Reviews

**Do:**

- Make constructive and kind reviews
- Test code locally if possible
- Check architecture and patterns
- Suggest improvements
- Approve quickly if code is good

**Don't:**

- Make non-constructive comments
- Approve without looking at code
- Request changes for personal preferences
- Block a PR for minor details

## Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
    # Commits
    c = commit
    cm = commit -m
    ca = commit --amend
    can = commit --amend --no-edit

    # Branches
    co = checkout
    cob = checkout -b
    br = branch
    brd = branch -d

    # Status and logs
    st = status -sb
    lg = log --oneline --graph --decorate --all
    last = log -1 HEAD --stat

    # Pull and push
    pl = pull
    ps = push
    psu = push -u origin HEAD

    # Rebase
    rb = rebase
    rbi = rebase -i
    rbc = rebase --continue

    # Stash
    stash-all = stash save --include-untracked

    # Diff
    df = diff
    dfs = diff --staged

    # Reset
    unstage = reset HEAD --
    undo = reset --soft HEAD^
```

## Recommended Git Configuration

```bash
# User information
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Editor
git config --global core.editor "code --wait"

# Colors
git config --global color.ui auto

# Default pull (rebase)
git config --global pull.rebase true

# Default push (current branch)
git config --global push.default current
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)
