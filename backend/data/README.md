# Structure des Données - Movies Collection API

## Fichiers de données

### 1. **directors.json** (11 réalisateurs)
Contient les informations complètes sur les réalisateurs.

**Structure :**
```json
{
  "id": "dir_001",                    // ID unique
  "nom": "Nolan",
  "prenom": "Christopher",
  "date_naissance": "1970-07-30",
  "nationalite": "Britannique",
  "biographie": "...",
  "photo_url": "https://...",
  "nombre_films": 3                   // Compteur automatique
}
```

**Réalisateurs inclus :**
- Christopher Nolan (3 films)
- Denis Villeneuve, Francis Ford Coppola, Quentin Tarantino
- Lana & Lilly Wachowski, Robert Zemeckis, Ridley Scott
- Peter Jackson, David Fincher, Bong Joon-ho

---

### 2. **genres.json** (9 genres)
Liste normalisée des genres de films.

**Structure :**
```json
{
  "id": "gen_001",                    // ID unique
  "nom": "Science-Fiction",
  "description": "Films explorant...",
  "nombre_films": 5                   // Compteur automatique
}
```

**Genres inclus :**
- Science-Fiction (5 films)
- Thriller (5 films)
- Drame (7 films)
- Crime (4 films)
- Action, Aventure (3 films chacun)
- Romance, Fantaisie, Comédie (1 film chacun)

---

### 3. **collections.json** (5 collections)
Collections personnalisées de films organisées par thème.

**Structure :**
```json
{
  "id": "col_001",                           // ID unique
  "nom": "Chefs-d'œuvre de Christopher Nolan",
  "description": "...",
  "is_public": true,                         // Visible publiquement ?
  "date_creation": "2024-01-15T10:00:00.000Z",
  "nombre_films": 3,
  "movie_ids": ["mov_001", "mov_002", "mov_006"]  // Relations many-to-many
}
```

**Collections incluses :**
1. **Chefs-d'œuvre de Christopher Nolan** (3 films) - Public
2. **Science-Fiction Incontournables** (4 films) - Public
3. **Films à revoir absolument** (2 films) - Privée
4. **Thrillers psychologiques** (3 films) - Public
5. **Épopées à grand spectacle** (2 films) - Public

---

### 4. **movies_v2.json** (12 films)
Version normalisée des films avec références aux autres entités.

**Structure :**
```json
{
  "id": "mov_001",                           // ID unique
  "titre": "Inception",
  "annee": 2010,
  "director_id": "dir_001",                  // Référence au réalisateur
  "genre_ids": ["gen_001", "gen_002"],       // Références aux genres (many-to-many)
  "duree": 148,
  "synopsis": "...",
  "statut": "vu",                            // a_voir | vu | en_cours
  "note": 9.5,                               // 0-10 (optionnel)
  "commentaire": "...",
  "affiche_url": "https://...",
  "tmdb_id": 27205,                          // ID The Movie Database
  "tags": ["mindfuck", "chef-d'oeuvre"],
  "date_ajout": "2024-01-15T00:00:00.000Z",
  "date_visionnage": "2024-01-18T20:30:00.000Z"  // Si statut = "vu"
}
```

**Films inclus :**
- 8 films "vus" avec notes et commentaires
- 3 films "à voir"
- 1 film "en cours"

---

## Relations entre les entités

```
Directors (1) ----< (N) Movies (N) >---- (N) Genres
                         |
                         | (N)
                         |
                         v
                       (N) Collections
```

### Relations :
- **Director → Movies** : One-to-Many (1 réalisateur → plusieurs films)
- **Movies → Genres** : Many-to-Many (1 film → plusieurs genres)
- **Movies → Collections** : Many-to-Many (1 film → plusieurs collections)
