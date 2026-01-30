# 🔒 Choix des Ports - Stratégie Anti-Conflit

## 📋 Ports utilisés

| Environnement | Port hôte | Raison du choix |
|---------------|-----------|-----------------|
| **Développement** | `54320` | Port sûr, dérivé de 5432 + suffixe 0 |
| **Tests E2E** | `54321` | Port sûr, dérivé de 5432 + suffixe 1 |
| **Tests Intégration** | `54322` | Port sûr, dérivé de 5432 + suffixe 2 |

## ❓ Pourquoi pas 5432, 5433, 5434 ?

### Problèmes potentiels avec les ports standards

| Port | Service | Risque de conflit |
|------|---------|-------------------|
| **5432** | PostgreSQL local | ⚠️ **ÉLEVÉ** - Port par défaut de PostgreSQL |
| **5433** | PostgreSQL secondaire | ⚠️ **MOYEN** - Souvent utilisé pour des instances multiples |
| **5434** | PostgreSQL tertiaire | ⚠️ **MOYEN** - Utilisé dans certains setups |
| **3306** | MySQL | ⚠️ **ÉLEVÉ** - Conflit avec MySQL local |
| **27017** | MongoDB | ⚠️ **ÉLEVÉ** - Conflit avec MongoDB local |
| **6379** | Redis | ⚠️ **ÉLEVÉ** - Conflit avec Redis local |

### Avantages des ports 54320-54322

✅ **Hors de la plage standard** (0-49151) mais dans la plage enregistrée  
✅ **Mémorisables** : 5432 + 0/1/2 (facile à retenir)  
✅ **Non utilisés** par les services système courants  
✅ **Groupés** : Faciles à identifier comme liés au projet  
✅ **Safe** : Aucun conflit connu avec des services populaires  

## 🎯 Scénarios couverts

### Scénario 1 : PostgreSQL local installé
```bash
# PostgreSQL local tourne sur 5432
sudo systemctl status postgresql
# ✅ Pas de conflit avec nos conteneurs Docker (54320, 54321, 54322)
```

### Scénario 2 : Plusieurs projets Docker
```bash
# Projet A utilise 5432, 5433
# Projet B utilise notre configuration 54320, 54321, 54322
# ✅ Aucun conflit entre les projets
```

### Scénario 3 : Environnements parallèles
```bash
# Développement (54320) + E2E (54321) + Intégration (54322)
npm run docker:dev:up
npm run docker:e2e:up
npm run docker:integration:up
# ✅ Les 3 environnements coexistent sans problème
```

## 🔍 Vérification des ports disponibles

Avant de démarrer, vous pouvez vérifier que les ports sont libres :

```bash
# Linux / macOS
lsof -i :54320
lsof -i :54321
lsof -i :54322

# Si vide = port disponible
```

```bash
# Avec netstat
netstat -tuln | grep -E "54320|54321|54322"

# Si vide = port disponible
```

```bash
# Avec ss (moderne)
ss -tuln | grep -E "54320|54321|54322"

# Si vide = port disponible
```

## 📊 Comparaison avec d'autres approches

| Approche | Ports | Avantages | Inconvénients |
|----------|-------|-----------|---------------|
| **Ports standards** | 5432, 5433, 5434 | Familiers | Conflits fréquents avec PostgreSQL local |
| **Ports aléatoires** | 12345, 23456, 34567 | Pas de conflit | Difficiles à retenir |
| **Ports très hauts** | 65001, 65002, 65003 | Toujours libres | Pas de relation avec le service |
| **Notre choix** ✅ | **54320, 54321, 54322** | Mémorisables, sûrs, logiques | Aucun |

## 🔄 Migration depuis les anciens ports

Si vous utilisiez les ports 5432, 5433, 5434 :

### Mise à jour automatique

```bash
# 1. Arrêter les anciens conteneurs
docker-compose down

# 2. Le nouveau système utilise automatiquement les nouveaux ports
npm run docker:dev:up
```

### Mise à jour manuelle du .env

```bash
# Ancien .env
DATABASE_PORT=5432

# Nouveau .env
DATABASE_PORT=54320
```

## 📝 Bonnes pratiques

### ✅ À faire

- Utiliser les ports configurés (54320-54322)
- Vérifier la disponibilité avant le démarrage
- Documenter les ports dans l'équipe

### ❌ À éviter

- Ne pas modifier les ports sans coordination
- Ne pas utiliser des ports < 1024 (privilèges root requis)
- Ne pas utiliser des ports déjà occupés par des services système

## 🆘 Dépannage

### "Port already in use"

```bash
# 1. Identifier le processus utilisant le port
lsof -i :54320

# 2. Arrêter le processus si nécessaire
# Si c'est un ancien conteneur :
docker ps -a | grep route-solver
docker stop <container_id>
docker rm <container_id>

# 3. Redémarrer
npm run docker:dev:up
```

### Changer les ports (si vraiment nécessaire)

Si les ports 54320-54322 sont vraiment occupés, vous pouvez les modifier :

1. Éditer `docker-compose.dev.yml`, `docker-compose.e2e.yml`, etc.
2. Changer la partie gauche du mapping : `"NOUVEAU_PORT:5432"`
3. Mettre à jour tous les fichiers `.env*`

**Exemple :**
```yaml
ports:
  - '55320:5432'  # Au lieu de 54320:5432
```

## 📚 Ressources

- [IANA Service Name and Transport Protocol Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/)
- [Wikipedia - List of TCP and UDP port numbers](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers)

---

**Résumé :** Les ports 54320-54322 offrent le meilleur compromis entre mémorisation, sécurité et absence de conflits pour un projet de développement multi-environnements.
