# Git Workflow & Branch Strategy

## 📋 Vue d'ensemble

Ce document décrit la stratégie Git et GitHub adoptée pour ce projet, incluant les conventions de nommage des branches, des commits et des Pull Requests.

## 🌳 Stratégie de Branches

### Branches Principales

#### `main`
- **Protection** : Branche protégée
- **Rôle** : Code de production, stable et testé
- **Règles** :
  - ❌ Pas de push direct
  - ✅ Merge uniquement via Pull Request
  - ✅ Requiert au moins 1 approbation
  - ✅ CI/CD doit passer (tous les tests)
  - ✅ Branche à jour avec la base requise

#### `develop` (optionnel pour projets plus grands)
- **Rôle** : Branche d'intégration pour les features en cours
- **Règles** : Moins stricte que `main`, mais requiert PR

### Branches de Travail

#### Convention de Nommage

```
<type>/<ticket-id>-<description-courte>
```

**Types de branches :**

| Type | Usage | Exemples |
|------|-------|----------|
| `feature/` | Nouvelle fonctionnalité | `feature/RS-123-add-road-segment-endpoint` |
| `fix/` | Correction de bug | `fix/RS-456-validation-error-handling` |
| `hotfix/` | Correction urgente en prod | `hotfix/RS-789-critical-security-patch` |
| `refactor/` | Refactoring sans changement fonctionnel | `refactor/RS-234-improve-controller-structure` |
| `docs/` | Documentation uniquement | `docs/RS-567-api-documentation` |
| `test/` | Ajout/modification de tests | `test/RS-890-e2e-coverage` |
| `chore/` | Tâches de maintenance | `chore/RS-345-update-dependencies` |
| `perf/` | Optimisations de performance | `perf/RS-678-optimize-pathfinding` |

**Format de la description :**
- Tout en minuscules
- Mots séparés par des tirets `-`
- Maximum 50 caractères
- Descriptif et explicite
- Pas de caractères spéciaux (sauf `-`)

**Exemples complets :**
```bash
feature/RS-123-create-road-segment-endpoint
fix/RS-456-handle-empty-city-names
hotfix/RS-789-sql-injection-vulnerability
refactor/RS-234-extract-validation-logic
docs/RS-567-swagger-documentation
test/RS-890-add-integration-tests
chore/RS-345-upgrade-nestjs-to-v11
perf/RS-678-cache-pathfinding-results
```

## 📝 Commits

### Convention : Conventional Commits

Format :
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Types de Commits

| Type | Description | Emoji (optionnel) |
|------|-------------|-------------------|
| `feat` | Nouvelle fonctionnalité | ✨ |
| `fix` | Correction de bug | 🐛 |
| `docs` | Documentation | 📝 |
| `style` | Formatage, point-virgules, etc. | 💄 |
| `refactor` | Refactoring | ♻️ |
| `perf` | Amélioration de performance | ⚡️ |
| `test` | Ajout/modification de tests | ✅ |
| `build` | Système de build, dépendances | 🔧 |
| `ci` | Configuration CI/CD | 👷 |
| `chore` | Tâches de maintenance | 🔨 |
| `revert` | Annulation d'un commit | ⏪ |

#### Scope (optionnel)

Le scope précise la partie du projet affectée :
- `api` - API REST
- `domain` - Couche domaine
- `infra` - Infrastructure
- `db` - Base de données
- `tests` - Tests
- `docs` - Documentation
- `deps` - Dépendances

#### Exemples de Commits

**Simple :**
```bash
feat(api): add POST /road-segments endpoint
fix(domain): validate city names before creating segment
docs: update API documentation for road segments
test(e2e): add create road segment E2E tests
```

**Avec body :**
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

**Breaking change :**
```bash
feat(api)!: change road segment ID format

BREAKING CHANGE: Road segment IDs are now sorted alphabetically
(e.g., "lyon__paris" instead of "paris__lyon")

Closes #456
```

## 🔄 Pull Requests

### Convention de Nommage

Format :
```
[<TYPE>] <Description claire et concise>
```

**Types de PR :**

| Type | Description | Label |
|------|-------------|-------|
| `[FEATURE]` | Nouvelle fonctionnalité | `feature` |
| `[FIX]` | Correction de bug | `bug` |
| `[HOTFIX]` | Correction urgente | `hotfix` |
| `[REFACTOR]` | Refactoring | `refactor` |
| `[DOCS]` | Documentation | `documentation` |
| `[TEST]` | Tests | `test` |
| `[CHORE]` | Maintenance | `chore` |
| `[PERF]` | Performance | `performance` |

**Exemples de titres de PR :**
```
[FEATURE] Add POST /road-segments endpoint to create road segments
[FIX] Handle empty city names in validation
[HOTFIX] Fix SQL injection vulnerability in city search
[REFACTOR] Extract validation logic to separate service
[DOCS] Update API documentation with new endpoints
[TEST] Add E2E tests for road segment creation
[CHORE] Update dependencies to latest versions
[PERF] Optimize pathfinding algorithm with caching
```

### Template de Pull Request

Créez `.github/PULL_REQUEST_TEMPLATE.md` :

```markdown
## 📋 Description

<!-- Décrivez clairement les changements apportés -->

## 🎯 Type de changement

- [ ] 🚀 Feature (nouvelle fonctionnalité)
- [ ] 🐛 Fix (correction de bug)
- [ ] 🔥 Hotfix (correction urgente)
- [ ] ♻️ Refactor (refactoring)
- [ ] 📝 Documentation
- [ ] ✅ Tests
- [ ] 🔧 Chore (maintenance)
- [ ] ⚡️ Performance

## 🔗 Issue liée

Closes #<numéro>

## ✨ Changements

<!-- Liste détaillée des modifications -->

- 
- 
- 

## 🏗️ Architecture

<!-- Si applicable, décrivez l'impact sur l'architecture -->

**Couches affectées :**
- [ ] Domain
- [ ] Application
- [ ] Infrastructure
- [ ] Presentation

## ✅ Checklist

- [ ] Le code compile sans erreurs
- [ ] Les tests passent (unit + integration + e2e)
- [ ] La couverture de tests est maintenue/améliorée
- [ ] La documentation est à jour
- [ ] Le code suit les conventions du projet
- [ ] Les règles de l'architecture hexagonale sont respectées
- [ ] Les commits suivent la convention Conventional Commits
- [ ] J'ai testé manuellement les changements

## 📸 Screenshots / Logs

<!-- Si applicable, ajoutez des captures d'écran ou logs -->

## 🧪 Tests

**Tests ajoutés/modifiés :**
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests E2E

**Couverture :**
- Avant : XX%
- Après : XX%

## 📚 Documentation

- [ ] README mis à jour si nécessaire
- [ ] Documentation API mise à jour
- [ ] Commentaires ajoutés dans le code si nécessaire
- [ ] Documentation technique créée/mise à jour

## 🔍 Review Checklist (pour les reviewers)

- [ ] Le code est lisible et maintenable
- [ ] Les tests sont suffisants et pertinents
- [ ] L'architecture est respectée
- [ ] Les performances ne sont pas dégradées
- [ ] La sécurité est assurée
- [ ] Les erreurs sont bien gérées
```

## 🔐 Protection de la Branche Main

### Configuration GitHub

**Settings → Branches → Branch protection rules pour `main` :**

#### Règles Recommandées

✅ **Require a pull request before merging**
- Require approvals: `1` (ou plus selon la taille de l'équipe)
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners (optionnel)

✅ **Require status checks to pass before merging**
- Require branches to be up to date before merging
- Status checks requis :
  - `build` - Compilation réussie
  - `test:unit` - Tests unitaires
  - `test:integration` - Tests d'intégration
  - `test:e2e` - Tests E2E
  - `lint` - Linting
  - `coverage` - Couverture de tests minimale

✅ **Require conversation resolution before merging**
- Tous les commentaires doivent être résolus

✅ **Require signed commits** (optionnel mais recommandé)

✅ **Require linear history** (optionnel)
- Force le rebase ou squash merge

✅ **Include administrators**
- Les règles s'appliquent aussi aux admins

❌ **Allow force pushes** - DÉSACTIVÉ

❌ **Allow deletions** - DÉSACTIVÉ

### Configuration CODEOWNERS

Créez `.github/CODEOWNERS` :

```
# Global owners
* @votre-username

# Domain layer - Requires architecture review
/src/domain/ @votre-username @lead-architect

# Infrastructure - Requires infrastructure review
/src/infrastructure/ @votre-username @lead-architect

# CI/CD configuration
/.github/ @votre-username @devops-lead
```

## 🔄 Workflow Complet

### 1. Créer une nouvelle branche

```bash
# Mise à jour de main
git checkout main
git pull origin main

# Créer la branche de feature
git checkout -b feature/RS-123-add-road-segment-endpoint
```

### 2. Développer et commiter

```bash
# Développement...

# Staging
git add src/

# Commit avec convention
git commit -m "feat(api): add POST /road-segments endpoint

Implement complete endpoint to create road segments.
Includes validation, error handling, and comprehensive tests.

Closes #123"
```

### 3. Pousser et créer une PR

```bash
# Premier push
git push -u origin feature/RS-123-add-road-segment-endpoint

# Pushes suivants
git push
```

Puis sur GitHub :
1. Cliquer sur "Compare & pull request"
2. Remplir le template de PR
3. Assigner des reviewers
4. Ajouter des labels appropriés
5. Lier l'issue associée

### 4. Review et Merge

**Pour l'auteur :**
- Répondre aux commentaires
- Faire les modifications demandées
- Pousser les changements (la PR se met à jour automatiquement)
- Demander une re-review si nécessaire

**Pour le reviewer :**
- Faire une review complète (code, tests, architecture)
- Laisser des commentaires constructifs
- Approuver ou demander des changements
- Une fois approuvé, l'auteur peut merger

**Merge :**
- Option recommandée : **Squash and merge**
  - Garde un historique propre
  - Un seul commit par feature
- Alternative : **Rebase and merge**
  - Garde tous les commits
  - Historique linéaire

### 5. Après le merge

```bash
# Retour sur main
git checkout main
git pull origin main

# Supprimer la branche locale
git branch -d feature/RS-123-add-road-segment-endpoint

# La branche distante est automatiquement supprimée si configuré sur GitHub
```

## 📊 Labels GitHub Recommandés

Créez ces labels dans votre repository :

| Label | Couleur | Description |
|-------|---------|-------------|
| `feature` | `#0E8A16` | Nouvelle fonctionnalité |
| `bug` | `#D73A4A` | Bug à corriger |
| `hotfix` | `#B60205` | Correction urgente |
| `refactor` | `#FBCA04` | Refactoring |
| `documentation` | `#0075CA` | Documentation |
| `test` | `#1D76DB` | Tests |
| `chore` | `#D4C5F9` | Maintenance |
| `performance` | `#FF6B6B` | Performance |
| `breaking-change` | `#B60205` | Breaking change |
| `needs-review` | `#FBCA04` | En attente de review |
| `work-in-progress` | `#FEF2C0` | Travail en cours |
| `ready-to-merge` | `#0E8A16` | Prêt à merger |
| `blocked` | `#D73A4A` | Bloqué |
| `good-first-issue` | `#7057FF` | Bon pour les débutants |
| `help-wanted` | `#008672` | Aide souhaitée |

## 🎯 Bonnes Pratiques

### Commits

✅ **DO:**
- Faire des commits atomiques (un changement logique = un commit)
- Écrire des messages de commit clairs et descriptifs
- Utiliser le présent de l'impératif ("add" pas "added")
- Référencer les issues dans les commits
- Séparer le sujet du corps par une ligne vide

❌ **DON'T:**
- Faire des commits trop gros (plusieurs features)
- Écrire "WIP", "fix", "update" sans contexte
- Commiter des fichiers de configuration locale
- Commiter des secrets ou credentials
- Faire des commits avec des tests qui échouent

### Pull Requests

✅ **DO:**
- Garder les PR petites et focalisées
- Inclure des tests avec chaque PR
- Mettre à jour la documentation si nécessaire
- Répondre rapidement aux commentaires
- Tester manuellement avant de demander une review
- Lier les issues associées

❌ **DON'T:**
- Créer des PR de plus de 500 lignes
- Mélanger plusieurs features dans une PR
- Ignorer les commentaires des reviewers
- Forcer le merge sans approbation
- Merger sans que les tests passent

### Reviews

✅ **DO:**
- Faire des reviews constructives et bienveillantes
- Tester le code localement si possible
- Vérifier l'architecture et les patterns
- Suggérer des améliorations
- Approuver rapidement si le code est bon

❌ **DON'T:**
- Faire des commentaires non constructifs
- Approuver sans regarder le code
- Demander des changements pour des préférences personnelles
- Bloquer une PR pour des détails mineurs

## 🔧 Configuration Git Locale

### Alias Recommandés

Ajoutez dans `~/.gitconfig` :

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
    
    # Status et logs
    st = status -sb
    lg = log --oneline --graph --decorate --all
    last = log -1 HEAD --stat
    
    # Pull et push
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

### Configuration Recommandée

```bash
# Informations utilisateur
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# Éditeur
git config --global core.editor "code --wait"

# Diff et merge tool
git config --global merge.tool vscode
git config --global diff.tool vscode

# Couleurs
git config --global color.ui auto

# Pull par défaut (rebase)
git config --global pull.rebase true

# Push par défaut (current branch)
git config --global push.default current

# Commit signing (optionnel)
git config --global commit.gpgsign true
```

## 📚 Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)
