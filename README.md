
# Movies Collection — API et backend

Ce dépôt contient une API REST simple pour gérer une collection de films. Elle fournit des endpoints pour les films, les réalisateurs, les genres, les collections et des statistiques basiques. L'API est développée avec Node.js et Express, et intègre un système d'authentification JWT.

## Caractéristiques principales

- **Authentification JWT** : Système de connexion/inscription avec tokens sécurisés
- Endpoints CRUD pour : films (`/api/movies`), réalisateurs (`/api/directors`), genres (`/api/genres`) et collections (`/api/collections`)
- Routes protégées : Création, modification et suppression nécessitent une authentification
- Recherche par titre, filtres (genre, réalisateur, collection), tri et pagination
- HATEOAS : les ressources retournées contiennent des liens d'action pour faciliter la navigation
- **Documentation interactive Swagger UI** disponible sur `/api-docs`
- Base de données MongoDB pour le stockage des données

## Prérequis

- Node.js 18+ (ou une version compatible avec la syntaxe ES modules)
- npm
- MongoDB (ou utiliser Docker Compose)

## 🔐 Authentification

Le projet utilise JWT (JSON Web Token) pour l'authentification. 

### Endpoints d'authentification

- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter et obtenir un token
- `GET /api/auth/me` - Obtenir son profil (nécessite authentification)
- `PUT /api/auth/password` - Changer son mot de passe (nécessite authentification)

### Routes protégées

Les actions suivantes nécessitent un token JWT valide dans le header `Authorization: Bearer <token>` :

- ✅ **POST** (création) de films, réalisateurs, genres ou collections
- ✅ **PUT** (modification) de films, réalisateurs, genres ou collections
- ✅ **DELETE** (suppression) de films, réalisateurs, genres ou collections

Les routes en **lecture seule** (GET) restent publiques et accessibles sans authentification.

## Installation

1. Ouvrez un terminal à la racine du projet.
2. Installez les dépendances du backend :

```bash
cd backend
npm install
```

## Lancement

```bash
npm run start
```

Par défaut le serveur écoute sur le port indiqué par la variable d'environnement `PORT`, ou sur `3000` si non défini. Après démarrage vous verrez une sortie indiquant l'URL, par exemple : `http://localhost:3000`.

## Documentation de l'API

Une documentation interactive complète est disponible via **Swagger UI** :

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

Cette interface vous permet de :

- Consulter tous les endpoints disponibles
- Voir les schémas de données détaillés
- Tester directement les requêtes API depuis votre navigateur
- Découvrir tous les paramètres, filtres et options de tri
- Visualiser des exemples de requêtes et réponses

La documentation est automatiquement générée depuis le fichier `movies_api_spec.yaml` (spécification OpenAPI 3.0.2).

## Points d'entrée et routes principales

Racine de l'API : GET /

Endpoints principaux exposés :

- Films :
	- GET /api/movies — lister les films (filtres : `status`, `genre_id`, `director_id`, `collection_id`, tri: `sort`, `order`, pagination: `page`, `limit`)
	- GET /api/movies/search?q=... — recherche par titre
	- GET /api/movies/:id — récupérer le détail d'un film (inclut réalisateur, genres, collections)
	- POST /api/movies — créer un film (champs : `titre`, `annee`, `director_id`, `genre_ids`, ...)
	- PUT /api/movies/:id — mettre à jour un film
	- DELETE /api/movies/:id — supprimer un film

- Réalisateurs :
	- GET /api/directors — lister
	- GET /api/directors/:id — récupérer
	- GET /api/directors/:id/movies — lister les films d'un réalisateur
	- POST /api/directors — créer (`nom`, `prenom` requis)
	- PUT /api/directors/:id — mettre à jour
	- DELETE /api/directors/:id — supprimer (impossible si des films sont associés)

- Genres :
	- GET /api/genres — lister
	- GET /api/genres/:id — récupérer
	- GET /api/genres/:id/movies — lister les films d'un genre
	- POST /api/genres — créer (`nom` requis)
	- PUT /api/genres/:id — mettre à jour
	- DELETE /api/genres/:id — supprimer (impossible si le genre est utilisé par des films)

- Collections :
	- GET /api/collections — lister
	- GET /api/collections/:id — récupérer
	- (les opérations sur collections suivent la même logique que ci-dessus)

- Statistiques :
	- GET /api/stats — endpoints pour récupérer des statistiques (implémentation dans `backend/routes/stats.js`)

Chaque réponse JSON contient des liens HATEOAS utiles (`_links`) pour naviguer ou effectuer des actions connexes.

## Structure des données

Les fichiers de données se trouvent dans `backend/data/` et sont des JSON simples (ex : `movies.json`, `directors.json`, `genres.json`, `collections.json`).

Champs importants pour `movies` (extrait) :
- id : identifiant (ex: `mov_001`)
- titre : titre du film
- annee : année de sortie
- director_id : id du réalisateur
- genre_ids : tableau d'ids de genres
- statut : `a_voir`, `vu`, etc.
- note, commentaire, date_ajout, date_visionnage, affiche_url, tmdb_id, tags

Les autres collections (`directors`, `genres`, `collections`) possèdent des structures simples avec `id`, `nom`/`nom/prenom`, et des compteurs comme `nombre_films`.

## Utilitaires et gestion des données

- `backend/utils/dataManager.js` : utilitaires pour lire/écrire les fichiers JSON, générer des IDs, et opérations utilitaires (recherche par id, compter films, ...).
- `backend/utils/hateoas.js` : génération des liens HATEOAS pour chaque ressource.

## Méthodologie de développement

### 1. Spécification OpenAPI en premier

La première étape a été de créer la **documentation OpenAPI** (`movies_api_spec.yaml`) avant d'écrire une ligne de code du serveur Express. Cette spécification définit :
- Tous les endpoints et leurs méthodes HTTP
- Les schémas de données (films, réalisateurs, genres, collections)
- Les paramètres de requête (filtres, tri, pagination)
- Les codes de statut HTTP et les réponses attendues
- Les exemples de requêtes et réponses

### 2. Développement basé sur la spécification

Une fois la spécification OpenAPI complète, le serveur Express a été développé en suivant cette documentation comme contrat. Les routes, contrôleurs et modèles ont été implémentés pour respecter ce qui avait été défini dans la spec.

### Pourquoi cette approche ?

Cette méthodologie "Design-First" présente plusieurs avantages majeurs :

- **Plus naturel et logique** : Il est plus intuitif de d'abord définir *ce qu'on doit faire* (les besoins, les endpoints, les données) avant de le faire, plutôt que de coder quelque chose et de le décrire après coup.

- **Meilleure planification** : Définir l'API en amont force à réfléchir à la structure complète, aux cas d'usage et à la cohérence de l'ensemble avant de se perdre dans l'implémentation.

- **Validation continue** : Le code peut être vérifié en permanence par rapport à la spécification, garantissant la conformité.

- **Évite les incohérences** : L'approche inverse (Code-First) conduit souvent à une documentation partielle, imprécise ou désynchronisée du code réel.

```