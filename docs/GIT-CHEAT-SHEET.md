# Git Workflow - Cheat Sheet

## 🚀 Quick Reference

### Convention de nommage des branches

```
<type>/<ticket-id>-<description>
```

**Types:**
- `feature/` - Nouvelle fonctionnalité
- `fix/` - Correction de bug
- `hotfix/` - Correction urgente
- `refactor/` - Refactoring
- `docs/` - Documentation
- `test/` - Tests
- `chore/` - Maintenance
- `perf/` - Performance

**Exemples:**
```
feature/RS-123-add-road-segment-endpoint
fix/RS-456-handle-empty-city-names
hotfix/RS-789-critical-security-patch
docs/RS-567-api-documentation
```

### Convention de commits (Conventional Commits)

```
<type>(<scope>): <description>
```

**Types:**
- `feat` ✨ - Nouvelle fonctionnalité
- `fix` 🐛 - Correction de bug
- `docs` 📝 - Documentation
- `refactor` ♻️ - Refactoring
- `test` ✅ - Tests
- `chore` 🔧 - Maintenance
- `perf` ⚡️ - Performance

**Exemples:**
```bash
feat(api): add POST /road-segments endpoint
fix(domain): validate city names before creating segment
docs: update API documentation
test(e2e): add create road segment tests
chore(deps): update nestjs to v11
```

### Convention de Pull Requests

```
[<TYPE>] <Description>
```

**Types:**
- `[FEATURE]` - Nouvelle fonctionnalité
- `[FIX]` - Correction de bug
- `[HOTFIX]` - Correction urgente
- `[REFACTOR]` - Refactoring
- `[DOCS]` - Documentation
- `[TEST]` - Tests
- `[CHORE]` - Maintenance

**Exemples:**
```
[FEATURE] Add POST /road-segments endpoint to create road segments
[FIX] Handle empty city names in validation
[HOTFIX] Fix SQL injection vulnerability in city search
```

## 📋 Workflow en 5 étapes

### 1. Créer une branche

```bash
git checkout main
git pull origin main
git checkout -b feature/RS-123-description
```

### 2. Développer et commiter

```bash
# Développer...
git add .
git commit -m "feat(api): add feature X"
```

### 3. Pousser

```bash
git push -u origin feature/RS-123-description
```

### 4. Créer la PR sur GitHub

- Titre: `[FEATURE] Description`
- Remplir le template
- Assigner des reviewers

### 5. Après le merge

```bash
git checkout main
git pull origin main
git branch -d feature/RS-123-description
```

## 🔧 Commandes essentielles

### Status et informations

```bash
git status              # Voir les modifications
git status -s           # Version courte
git diff                # Voir les changements
git log --oneline       # Historique
```

### Branches

```bash
git branch              # Lister les branches
git checkout <branch>   # Changer de branche
git checkout -b <name>  # Créer et changer
git branch -d <name>    # Supprimer locale
```

### Commits

```bash
git add .               # Ajouter tout
git add <file>          # Ajouter un fichier
git commit -m "msg"     # Commiter
git commit --amend      # Modifier le dernier
```

### Synchronisation

```bash
git pull                # Récupérer et merger
git push                # Pousser
git push -u origin <br> # Premier push
git fetch               # Récupérer sans merger
```

### Rebase et merge

```bash
git rebase main         # Rebaser sur main
git rebase --continue   # Continuer après conflit
git merge main          # Merger main dans la branche
```

### Annulations

```bash
git reset --soft HEAD^  # Annuler commit (garder changements)
git reset --hard HEAD^  # Annuler commit (supprimer changements)
git reset --hard HEAD   # Annuler tous les changements
git stash               # Mettre de côté
git stash pop           # Récupérer
```

## ✅ Checklist avant de pousser

```bash
# Tests
npm run test:features
npm run test:e2e

# Linting
npm run lint

# Build
npm run build

# Si tout passe
git push
```

## 🚨 En cas de conflit

### Lors d'un rebase

```bash
# 1. Résoudre les conflits dans les fichiers
# 2. Ajouter les fichiers résolus
git add .

# 3. Continuer le rebase
git rebase --continue

# 4. Pousser (force nécessaire)
git push --force-with-lease
```

### Lors d'un merge

```bash
# 1. Résoudre les conflits
# 2. Ajouter les fichiers
git add .

# 3. Commiter
git commit -m "chore: resolve merge conflicts"

# 4. Pousser
git push
```

## 🎯 Règles d'or

1. ✅ Toujours partir de `main` à jour
2. ✅ Faire des commits atomiques et descriptifs
3. ✅ Tester avant de pousser
4. ✅ Garder les PR petites (< 500 lignes)
5. ✅ Répondre aux reviews rapidement
6. ❌ Ne jamais pousser directement sur `main`
7. ❌ Ne jamais commiter de secrets/credentials
8. ❌ Ne jamais forcer un push sur `main`

## 📚 Pour aller plus loin

Consultez la documentation complète:
- `docs/GIT-WORKFLOW.md` - Documentation complète
- `docs/GIT-COMMANDS-EXAMPLES.md` - Exemples détaillés
- `.github/PULL_REQUEST_TEMPLATE.md` - Template de PR

---

💡 **Astuce:** Créez des alias Git pour gagner du temps !
Voir la section "Configuration Git Locale" dans `docs/GIT-WORKFLOW.md`
