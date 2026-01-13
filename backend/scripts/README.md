# Scripts de migration

Ce dossier contient les scripts utilitaires pour gérer la migration des données vers MongoDB.

## Scripts disponibles

### migrate.js
Migre les données JSON vers MongoDB.

**Utilisation:**
```bash
npm run migrate
```

**Ce qu'il fait:**
1. Se connecte à MongoDB
2. Supprime les données existantes dans la base
3. Importe les données depuis les fichiers JSON:
   - `directors.json` → Collection `directors`
   - `genres.json` → Collection `genres`
   - `collections.json` → Collection `collections`
   - `movies.json` → Collection `movies`
4. Vérifie l'intégrité des données (relations entre films/réalisateurs/genres)
5. Affiche des statistiques

**Prérequis:**
- MongoDB doit être démarré (localement ou via Docker)
- Le fichier `.env` doit contenir `MONGODB_URI`

### clean.js
Nettoie complètement la base de données MongoDB.

**Utilisation:**
```bash
npm run db:clean
```

**⚠️ ATTENTION:** Cette commande supprime TOUTES les données de la base !

## Configuration

Les scripts utilisent les variables d'environnement du fichier `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/movies_db
```

## Ordre d'exécution recommandé

1. **Premier lancement:**
   ```bash
   # Démarrer MongoDB (si local)
   mongod
   
   # Migrer les données
   npm run migrate
   ```

2. **Réinitialiser la base:**
   ```bash
   npm run db:clean
   npm run migrate
   ```

## Développement

Pour modifier ces scripts:
1. Les fichiers source sont dans `backend/scripts/`
2. Les modèles Mongoose sont dans `backend/models/`
3. La connexion MongoDB est gérée par `backend/config/database.js`
