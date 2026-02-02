# Pre-Commit Hooks - Guide d'utilisation

## 🎯 Objectif

Ce projet utilise **husky** et **lint-staged** pour garantir que tous les commits respectent les standards de code (formatage et lint) avant d'être validés.

## 🔧 Configuration

### Outils installés

- **husky** : Gère les hooks Git (notamment `pre-commit`)
- **lint-staged** : Exécute des commandes uniquement sur les fichiers stagés (ajoutés avec `git add`)

### Configuration actuelle

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

## 🚀 Fonctionnement

### Workflow automatique

1. Vous modifiez des fichiers TypeScript
2. Vous ajoutez vos modifications : `git add .`
3. Vous créez un commit : `git commit -m "votre message"`
4. **Automatiquement**, avant que le commit soit créé :
   - `biome check --write` formate et lint les fichiers `.ts` modifiés
5. Si tout se passe bien, le commit est créé
6. Si des erreurs subsistent (que Biome ne peut pas corriger), le commit est annulé

### Ce qui est vérifié

- **Formatage** : Biome applique les règles de formatage (indentation, guillemets, etc.)
- **Lint** : Biome vérifie la qualité du code et corrige ce qu'il peut
- **Imports** : Biome organise automatiquement les imports

### Fichiers concernés

Seuls les **fichiers TypeScript (*.ts) qui sont stagés** (ajoutés avec `git add`) sont vérifiés.

## 📝 Exemples d'utilisation

### Cas 1 : Tout se passe bien

```bash
$ git add src/domain/entities/city.ts
$ git commit -m "feat: add city entity"

✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

[main 1234567] feat: add city entity
 1 file changed, 20 insertions(+)
```

### Cas 2 : Erreurs corrigées automatiquement

```bash
$ git add src/domain/entities/city.ts
$ git commit -m "feat: add city entity"

✔ Preparing lint-staged...
⚠ Running tasks for staged files...
  ⚠ biome check --write — modified
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

[main 1234567] feat: add city entity
 1 file changed, 20 insertions(+)
```

Les fichiers ont été reformatés et auto-corrigés, puis le commit a été créé.

### Cas 3 : Erreurs non corrigeables

```bash
$ git add src/domain/entities/city.ts
$ git commit -m "feat: add city entity"

✔ Preparing lint-staged...
✖ Running tasks for staged files...
  ✖ biome check --write [FAILED]

✖ biome check found some errors. Please fix them and try again.

src/domain/entities/city.ts
  10:5  error  'unusedVariable' is defined but never used  lint/correctness/noUnusedVariables

✖ 1 problem (1 error, 0 warnings)

husky - pre-commit hook exited with code 1 (error)
```

Le commit est annulé. Vous devez corriger manuellement les erreurs, puis réessayer.

## 🛠️ Commandes utiles

### Lancer manuellement lint-staged

```bash
npx lint-staged
```

### Bypass le hook (déconseillé)

Si vous devez vraiment créer un commit sans passer par les hooks :

```bash
git commit -m "message" --no-verify
```

⚠️ **Attention** : Cette pratique est déconseillée car elle peut introduire du code non conforme dans le dépôt.

### Formater tous les fichiers

```bash
npm run format
```

### Linter tous les fichiers

```bash
npm run lint
```

## 📦 Installation (déjà fait)

Si vous clonez le projet, les hooks sont automatiquement installés lors de `npm install` grâce au script `prepare` :

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

## 🔍 Structure des fichiers

```
route-solver/
├── .husky/
│   └── pre-commit          # Hook exécuté avant chaque commit
├── package.json            # Configuration lint-staged
└── biome.json              # Configuration Biome
```

## ❓ FAQ

### Pourquoi mon commit prend-il du temps ?

Le hook vérifie et corrige automatiquement vos fichiers. Si vous avez beaucoup de fichiers stagés, cela peut prendre quelques secondes.

### Puis-je désactiver les hooks temporairement ?

Oui, utilisez `--no-verify` :

```bash
git commit -m "message" --no-verify
```

Mais c'est déconseillé pour les commits normaux.

### Les hooks s'appliquent-ils aux fichiers non stagés ?

Non, seuls les fichiers ajoutés avec `git add` sont vérifiés.

### Et pour les fichiers JavaScript (.js) ?

Actuellement, seuls les fichiers `.ts` sont configurés. Si besoin, on peut ajouter d'autres extensions dans `package.json`.

## 🎓 Références

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Biome Documentation](https://biomejs.dev/)
