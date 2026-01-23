# Movies Collection - Guide de démarrage rapide

## Lancement simplifié avec Docker

### Option 1 : Tout automatique (recommandé)

```bash
# 1. Initialiser le projet (créer le fichier .env)
./init.sh

# 2. Lancer tout le projet
docker-compose up --build
```

### Option 2 : Commandes manuelles

```bash
# 1. Créer le fichier .env
cp backend/.env.example backend/.env

# 2. Lancer avec Docker
docker-compose up --build
```

## URLs disponibles

Une fois le projet lancé, vous pouvez accéder à :

- **Frontend Angular** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **Documentation API (Swagger)** : http://localhost:3000/api-docs
- **Mongo Express** (interface MongoDB) : http://localhost:8081

## Authentification JWT

Le projet intègre un système d'authentification par token JWT (JSON Web Token).

### Endpoints d'authentification

- **POST /api/auth/register** - Créer un compte
- **POST /api/auth/login** - Se connecter
- **GET /api/auth/me** - Obtenir son profil (authentifié)
- **PUT /api/auth/password** - Changer son mot de passe (authentifié)

### Routes protégées

Les actions suivantes nécessitent une authentification (token JWT) :
- **Créer** un film, réalisateur, genre ou collection
- **Modifier** un film, réalisateur, genre ou collection
- **Supprimer** un film, réalisateur, genre ou collection

Les routes en **lecture seule** (GET) restent publiques.

### Utilisation dans le frontend

1. **Inscription** : Allez sur http://localhost:4200/register
2. **Connexion** : Allez sur http://localhost:4200/login
3. Le token est automatiquement ajouté à toutes vos requêtes

### Variables d'environnement

Dans `backend/.env` :
```bash
# Changez ces valeurs en production
JWT_SECRET=CodeSecretTrés123456789
JWT_EXPIRES_IN=7d
```

## Commandes utiles

### Arrêter le projet
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (base de données)
```bash
docker-compose down -v
```

### Voir les logs
```bash
docker-compose logs -f
```

### Voir les logs d'un service spécifique
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Reconstruire les images
```bash
docker-compose up --build
```

### Relancer la migration des données
```bash
docker-compose exec backend npm run migrate
```