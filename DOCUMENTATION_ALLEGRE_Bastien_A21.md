# Documentation Movies Collection

## Description de l'application

Movies Collection est une application web full-stack pour gérer une collection de films. L'application permet de gérer des films, des réalisateurs, des genres et des collections avec un système d'authentification sécurisé.

L'application est composée de deux parties : un backend Node.js avec Express qui expose une API REST et un frontend Angular pour l'interface utilisateur. Les données sont stockées dans une base de données MongoDB.

Fonctionnalités principales :
- Gestion complète des films (création, lecture, modification, suppression)
- Gestion des réalisateurs
- Gestion des genres
- Gestion des collections de films
- Authentification JWT (inscription, connexion)
- Documentation API interactive avec Swagger
- Interface MongoDB avec Mongo Express
- Routes HATEOAS pour faciliter la navigation dans l'API
- Recherche, filtres, tri et pagination

## Instructions pour démarrer l'application

### Prérequis
- Docker et Docker Compose installés sur votre machine

### Démarrage avec Docker (méthode recommandée)

> **⚠️ ATTENTION : NE PAS UTILISER `docker-compose` !**
> 
> Utilisez **`docker compose`** (sans tiret) à la place. Le projet n'est pas compatible avec l'ancienne version `docker-compose`.

Initialiser le projet et lancer tous les services :
```bash
./init.sh
docker compose up --build
```

Ou manuellement :
```bash
cp backend/.env.example backend/.env
docker compose up --build
```

### Arrêter l'application
```bash
docker compose down
```

### Arrêter et supprimer les données
```bash
docker compose down -v
```

## Utiliser l'application

### URLs disponibles

Une fois l'application démarrée, accédez à :
- Frontend Angular : http://localhost:4200
- Backend API : http://localhost:3000
- Documentation API Swagger : http://localhost:3000/api-docs
- Mongo Express (interface MongoDB) : http://localhost:8081

### Utiliser l'interface web

Accédez à http://localhost:4200 pour utiliser l'interface Angular. Vous pouvez :
- Parcourir les films, réalisateurs, genres et collections
- Vous inscrire et vous connecter
- Créer, modifier et supprimer des films (si connecté)
- Créer, modifier et supprimer des réalisateurs (si connecté)
- Créer, modifier et supprimer des genres (si connecté)
- Créer, modifier et supprimer des collections (si connecté)

### Tester l'API avec Swagger

Accédez à http://localhost:3000/api-docs pour la documentation interactive. Vous pouvez tester tous les endpoints directement depuis cette interface.

### Authentification cotée api

Créer un compte : allez sur http://localhost:4200/register ou faites une requête POST sur http://localhost:3000/api/auth/register avec un body JSON :
```json
{
  "username": "votre_username",
  "email": "votre@email.com",
  "password": "votre_mot_de_passe"
}
```

Se connecter : allez sur http://localhost:4200/login ou faites une requête POST sur http://localhost:3000/api/auth/login avec un body JSON :
```json
{
  "email": "votre@email.com",
  "password": "votre_mot_de_passe"
}
```

Le login retourne un token JWT à utiliser dans le header Authorization pour les requêtes protégées :
```
Authorization: Bearer <votre_token>
```

# Liens GitLAB

https://gricad-gitlab.univ-grenoble-alpes.fr/iut2-info-stud/2025-s5/mango/a2/allegreb/mango_project_movies_allegreb_a21
