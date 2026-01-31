# Exemples de commandes Git selon le workflow

## 🌟 Démarrer une nouvelle feature

```bash
# 1. S'assurer d'être à jour avec main
git checkout main
git pull origin main

# 2. Créer une nouvelle branche feature
git checkout -b feature/RS-123-add-road-segment-endpoint

# Alternative avec alias
git co main
git pl origin main
git cob feature/RS-123-add-road-segment-endpoint
```

## 💾 Faire des commits

### Commit simple

```bash
# Ajouter les fichiers modifiés
git add src/application/use-cases/create-road-segment/
git add src/presentation/rest-api/controllers/create-road-segment.controller.ts

# Commit avec message descriptif
git commit -m "feat(api): add POST /road-segments endpoint"
```

### Commit avec description détaillée

```bash
git add .

git commit -m "feat(api): add POST /road-segments endpoint

Implement complete endpoint to create road segments between cities.

Features:
- Request/Response DTOs with validation
- Controller with comprehensive error handling
- Use case orchestration
- 12 unit tests
- 15 E2E tests

Follows hexagonal architecture principles.

Closes #123"
```

### Commit avec plusieurs fichiers

```bash
# Voir les changements
git status

# Ajouter spécifiquement
git add src/application/
git add src/presentation/
git add test/

# Commit
git commit -m "feat(api): add create road segment feature

- Add CreateRoadSegmentUseCase
- Add CreateRoadSegmentController
- Add comprehensive tests"
```

## 🔄 Pousser vers GitHub

### Premier push (créer la branche distante)

```bash
git push -u origin feature/RS-123-add-road-segment-endpoint

# Avec alias
git psu
```

### Pushes suivants

```bash
git push

# Avec alias
git ps
```

## 🔍 Gérer les reviews

### Voir les modifications demandées

```bash
# Récupérer les derniers changements de la branche
git pull origin feature/RS-123-add-road-segment-endpoint
```

### Faire les corrections

```bash
# Faire les modifications...

# Ajouter et commiter
git add .
git commit -m "fix(api): address review comments

- Improve error messages
- Add missing validation
- Update tests"

# Pousser
git push
```

### Amender le dernier commit (si review juste après)

```bash
# Faire les modifications...

# Ajouter au dernier commit
git add .
git commit --amend --no-edit

# Forcer le push (attention, seulement sur votre branche!)
git push --force-with-lease

# Avec alias
git can
git push --force-with-lease
```

## 🔄 Maintenir la branche à jour avec main

### Rebase sur main

```bash
# Récupérer les dernières modifications de main
git checkout main
git pull origin main

# Retourner sur votre branche
git checkout feature/RS-123-add-road-segment-endpoint

# Rebase sur main
git rebase main

# Si conflits, résoudre puis:
git add .
git rebase --continue

# Pousser (force nécessaire après rebase)
git push --force-with-lease
```

### Merge main dans votre branche (alternative au rebase)

```bash
git checkout feature/RS-123-add-road-segment-endpoint
git merge main

# Résoudre les conflits si nécessaire
# Puis commit
git add .
git commit -m "chore: merge main into feature branch"
git push
```

## ✅ Après le merge de la PR

### Nettoyer les branches locales

```bash
# Retour sur main
git checkout main

# Récupérer les dernières modifications
git pull origin main

# Supprimer la branche locale
git branch -d feature/RS-123-add-road-segment-endpoint

# Si la branche n'est pas fusionnée (forcer la suppression)
git branch -D feature/RS-123-add-road-segment-endpoint
```

### Nettoyer les branches distantes

```bash
# Lister les branches distantes
git branch -r

# Supprimer une branche distante
git push origin --delete feature/RS-123-add-road-segment-endpoint

# Nettoyer les références aux branches distantes supprimées
git remote prune origin
```

## 🐛 Corriger un bug (hotfix)

```bash
# Partir de main
git checkout main
git pull origin main

# Créer la branche hotfix
git checkout -b hotfix/RS-789-fix-validation-error

# Faire les corrections...
git add .
git commit -m "fix(api): correct validation error handling

Fix validation error that caused 500 instead of 400.

Fixes #789"

# Pousser et créer PR immédiatement
git push -u origin hotfix/RS-789-fix-validation-error

# Sur GitHub: créer PR avec label [HOTFIX]
# Merger rapidement après review
```

## 📝 Mettre à jour la documentation

```bash
# Créer la branche
git checkout -b docs/RS-567-update-api-docs

# Faire les modifications...
git add docs/
git commit -m "docs: update API documentation

Add documentation for:
- POST /road-segments endpoint
- Error responses
- Usage examples"

git push -u origin docs/RS-567-update-api-docs
```

## 🧪 Ajouter des tests

```bash
# Créer la branche
git checkout -b test/RS-890-add-missing-tests

# Ajouter les tests...
git add test/
git commit -m "test: add missing E2E tests for edge cases

- Test empty city names
- Test invalid distances
- Test concurrent requests"

git push -u origin test/RS-890-add-missing-tests
```

## 🔧 Refactoring

```bash
# Créer la branche
git checkout -b refactor/RS-234-extract-validation

# Faire le refactoring...
git add src/
git commit -m "refactor(domain): extract validation to dedicated service

Extract validation logic from controllers to ValidationService.
No functional changes, only code organization.

Improves maintainability and testability."

git push -u origin refactor/RS-234-extract-validation
```

## 🚨 Commandes utiles en cas de problème

### Annuler le dernier commit (garder les changements)

```bash
git reset --soft HEAD^
```

### Annuler le dernier commit (supprimer les changements)

```bash
git reset --hard HEAD^
```

### Annuler tous les changements non commités

```bash
git reset --hard HEAD
```

### Voir l'historique

```bash
# Simple
git log --oneline

# Graphique
git log --oneline --graph --decorate --all

# Avec alias
git lg
```

### Voir les différences

```bash
# Différences non staged
git diff

# Différences staged
git diff --staged

# Avec alias
git df
git dfs
```

### Stash (mettre de côté temporairement)

```bash
# Sauvegarder les changements
git stash

# Avec message
git stash save "WIP: working on validation"

# Lister les stash
git stash list

# Réappliquer le dernier stash
git stash pop

# Réappliquer un stash spécifique
git stash apply stash@{0}

# Supprimer tous les stash
git stash clear
```

### Cherry-pick (appliquer un commit spécifique)

```bash
# Récupérer le SHA du commit
git log --oneline

# Appliquer le commit
git cherry-pick <SHA>
```

### Revert (annuler un commit publié)

```bash
# Créer un nouveau commit qui annule un commit précédent
git revert <SHA>
```

## 📊 Vérifications avant de pousser

### Checklist rapide

```bash
# 1. Voir le statut
git status

# 2. Voir les différences
git diff

# 3. Exécuter les tests localement
npm run test:features
npm run test:e2e

# 4. Vérifier le linting
npm run lint

# 5. Compiler
npm run build

# 6. Si tout est OK, pousser
git push
```

## 🎯 Workflow complet - Exemple réel

```bash
# 1. Créer la branche
git checkout main
git pull origin main
git checkout -b feature/RS-123-add-road-segment-endpoint

# 2. Développer
# ... coder ...

# 3. Tester localement
npm run test:features
npm run test:e2e

# 4. Commiter
git add src/ test/
git commit -m "feat(api): add POST /road-segments endpoint

Implement complete endpoint with validation and tests.

Closes #123"

# 5. Pousser
git push -u origin feature/RS-123-add-road-segment-endpoint

# 6. Sur GitHub: créer la PR avec le template
# Title: [FEATURE] Add POST /road-segments endpoint to create road segments

# 7. Review et corrections
# ... faire les modifications demandées ...
git add .
git commit -m "fix(api): address review comments"
git push

# 8. Après merge
git checkout main
git pull origin main
git branch -d feature/RS-123-add-road-segment-endpoint

# 9. Prêt pour la prochaine feature!
```

## 💡 Conseils et astuces

### Voir uniquement les fichiers modifiés

```bash
git status -s
git st  # avec alias
```

### Voir les dernières modifications

```bash
git log -1 HEAD --stat
git last  # avec alias
```

### Comparer deux branches

```bash
git diff main..feature/RS-123-add-road-segment-endpoint
```

### Voir qui a modifié une ligne

```bash
git blame <fichier>
```

### Rechercher dans l'historique

```bash
# Rechercher dans les messages de commit
git log --grep="validation"

# Rechercher dans le code
git log -S"CreateRoadSegmentUseCase"
```

### Créer une branche à partir d'un commit spécifique

```bash
git checkout -b new-branch <SHA>
```

### Récupérer un fichier depuis une autre branche

```bash
git checkout other-branch -- path/to/file
```
