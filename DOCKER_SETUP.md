# 📦 Configuration Docker - Résumé des changements

## ✅ Fichiers créés/modifiés

### Nouveaux fichiers Docker

1. **`docker-compose.yml`** - Configuration complète pour lancer tout le projet
   - Service MongoDB avec healthcheck
   - Service Mongo Express (interface web)
   - Service Backend avec migration automatique
   - Service Frontend Angular
   - Volumes persistants pour MongoDB
   - Réseau Docker pour la communication entre services

2. **`backend/Dockerfile`** - Image Docker pour le backend Node.js
   - Base : Node 18 Alpine (léger)
   - Installation automatique des dépendances
   - Exposition du port 3000

3. **`frontend/Dockerfile`** - Image Docker pour le frontend Angular
   - Base : Node 18 Alpine (léger)
   - Installation automatique des dépendances
   - Exposition du port 4200

4. **`.dockerignore`** - Fichiers à exclure lors du build Docker
5. **`backend/.dockerignore`** - Idem pour le backend
6. **`frontend/.dockerignore`** - Idem pour le frontend

### Scripts et documentation

7. **`init.sh`** - Script d'initialisation (crée le .env automatiquement)
8. **`QUICK_START.md`** - Guide de démarrage rapide
9. **`LANCEMENT.md`** - Instructions ultra-simplifiées

### Fichiers modifiés

10. **`backend/.env`** - Configuration mise à jour pour Docker
    - `MONGODB_URI=mongodb://mongodb:27017/movies_db` (nom du service Docker)

11. **`backend/.env.example`** - Template mis à jour avec les deux options
    - Configuration Docker (par défaut)
    - Configuration locale (commentée)

## 🎯 Fonctionnalités ajoutées

### 1. Lancement automatique complet
```bash
docker-compose up --build
```
Lance TOUT le projet :
- ✅ MongoDB
- ✅ Mongo Express
- ✅ Backend (+ installation deps + migration)
- ✅ Frontend (+ installation deps)

### 2. Migration automatique des données
Le backend exécute automatiquement `npm run migrate` au démarrage
→ Les données JSON sont importées dans MongoDB

### 3. Hot Reload (rechargement automatique)
- Les dossiers locaux sont montés dans les conteneurs
- Toute modification du code est immédiatement prise en compte
- Backend : nodemon
- Frontend : ng serve

### 4. Healthchecks
MongoDB a un healthcheck qui assure que :
- Le backend attend que MongoDB soit prêt
- Pas d'erreur de connexion au démarrage

### 5. Isolation réseau
Tous les services communiquent via un réseau Docker privé
→ Sécurité et isolation

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│  │          │    │          │    │          │        │
│  │ Frontend │◄───┤ Backend  │◄───┤ MongoDB  │        │
│  │  :4200   │    │  :3000   │    │  :27017  │        │
│  │          │    │          │    │          │        │
│  └──────────┘    └──────────┘    └────┬─────┘        │
│                                        │              │
│                                   ┌────▼─────┐        │
│                                   │  Mongo   │        │
│                                   │ Express  │        │
│                                   │  :8081   │        │
│                                   └──────────┘        │
└─────────────────────────────────────────────────────────┘
```

## 📊 Variables d'environnement importantes

### Backend
- `MONGODB_URI` : URI de connexion MongoDB
  - Docker : `mongodb://mongodb:27017/movies_db`
  - Local : `mongodb://localhost:27017/movies_db`
- `PORT` : Port du serveur (3000)
- `FRONTEND_URL` : URL du frontend pour CORS

### Frontend
- Pas de configuration spécifique requise
- Se connecte au backend via `http://localhost:3000`

## 🚀 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `docker-compose up --build` | Lance tout le projet (build + start) |
| `docker-compose up` | Lance le projet (sans rebuild) |
| `docker-compose down` | Arrête tous les services |
| `docker-compose down -v` | Arrête et supprime les volumes (DB) |
| `docker-compose logs -f` | Affiche tous les logs |
| `docker-compose logs -f backend` | Logs du backend uniquement |
| `docker-compose ps` | Liste les services en cours |
| `docker-compose exec backend npm run migrate` | Relance la migration |

## ⚙️ Personnalisation

### Changer les ports

Modifie `docker-compose.yml` :

```yaml
services:
  backend:
    ports:
      - "NOUVEAU_PORT:3000"  # Exemple: "5000:3000"
```

### Utiliser MongoDB local au lieu de Docker

1. Modifie `backend/.env` :
   ```env
   MONGODB_URI=mongodb://localhost:27017/movies_db
   ```

2. Lance seulement backend et frontend :
   ```bash
   docker-compose up backend frontend
   ```

## 🎉 Résultat

Maintenant, **une seule commande** suffit pour lancer tout le projet :

```bash
docker-compose up --build
```

Toute la complexité est cachée :
- ✅ Pas besoin d'installer Node.js
- ✅ Pas besoin d'installer MongoDB
- ✅ Pas besoin de lancer plusieurs terminaux
- ✅ Pas besoin de migrer manuellement
- ✅ Pas besoin d'installer les dépendances npm

**C'est automatique !** 🚀
