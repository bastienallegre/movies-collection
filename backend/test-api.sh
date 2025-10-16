#!/bin/bash

# Script de test de l'API Movies Collection v2.0
# Ce script teste tous les endpoints principaux de l'API

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════════"
echo "  TESTS DE L'API MOVIES COLLECTION V2.0"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Route racine
echo -e "${BLUE}Test 1: GET /${NC}"
curl -s http://localhost:3000/ | jq '.'
echo ""

# Test 2: Liste des films
echo -e "${BLUE}Test 2: GET /api/movies${NC}"
curl -s "$BASE_URL/movies?limit=3" | jq '.total, .movies[0].titre, ._links.self.href'
echo ""

# Test 3: Détail d'un film
echo -e "${BLUE}Test 3: GET /api/movies/mov_001 (avec HATEOAS)${NC}"
curl -s "$BASE_URL/movies/mov_001" | jq '{titre, director: .director.nom, genres: [.genres[].nom], _links: ._links | keys}'
echo ""

# Test 4: Liste des réalisateurs
echo -e "${BLUE}Test 4: GET /api/directors${NC}"
curl -s "$BASE_URL/directors?limit=3" | jq '.total, .directors[0] | {nom, prenom, nombre_films}'
echo ""

# Test 5: Films d'un réalisateur (Christopher Nolan)
echo -e "${BLUE}Test 5: GET /api/directors/dir_001/movies${NC}"
curl -s "$BASE_URL/directors/dir_001/movies" | jq '{total, films: [.movies[].titre]}'
echo ""

# Test 6: Liste des genres
echo -e "${BLUE}Test 6: GET /api/genres${NC}"
curl -s "$BASE_URL/genres?limit=5" | jq '.genres[] | {nom, nombre_films}'
echo ""

# Test 7: Films d'un genre (Science-Fiction)
echo -e "${BLUE}Test 7: GET /api/genres/gen_001/movies${NC}"
curl -s "$BASE_URL/genres/gen_001/movies" | jq '{total, films: [.movies[].titre]}'
echo ""

# Test 8: Liste des collections
echo -e "${BLUE}Test 8: GET /api/collections${NC}"
curl -s "$BASE_URL/collections?limit=3" | jq '.collections[] | {nom, nombre_films, is_public}'
echo ""

# Test 9: Films d'une collection
echo -e "${BLUE}Test 9: GET /api/collections/col_001/movies${NC}"
curl -s "$BASE_URL/collections/col_001/movies" | jq '{total, films: [.movies[].titre]}'
echo ""

# Test 10: Statistiques
echo -e "${BLUE}Test 10: GET /api/stats${NC}"
curl -s "$BASE_URL/stats" | jq '{
  total_films,
  films_vus,
  note_moyenne,
  total_directors,
  total_genres,
  total_collections,
  top_genre: .top_genres[0].genre.nom
}'
echo ""

# Test 11: Recherche de films
echo -e "${BLUE}Test 11: GET /api/movies/search?q=inception${NC}"
curl -s "$BASE_URL/movies/search?q=inception" | jq '{total, films: [.movies[].titre]}'
echo ""

# Test 12: Filtres avancés (films de Nolan dans le genre Science-Fiction)
echo -e "${BLUE}Test 12: GET /api/movies?director_id=dir_001&genre_id=gen_001${NC}"
curl -s "$BASE_URL/movies?director_id=dir_001&genre_id=gen_001" | jq '{total, films: [.movies[].titre]}'
echo ""

# Test 13: Créer un nouveau réalisateur
echo -e "${BLUE}Test 13: POST /api/directors${NC}"
NEW_DIRECTOR=$(curl -s -X POST "$BASE_URL/directors" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Spielberg",
    "prenom": "Steven",
    "nationalite": "Américaine",
    "biographie": "Test"
  }')
echo "$NEW_DIRECTOR" | jq '{id, nom, prenom, _links: ._links | keys}'
NEW_DIRECTOR_ID=$(echo "$NEW_DIRECTOR" | jq -r '.id')
echo ""

# Test 14: Créer un nouveau genre
echo -e "${BLUE}Test 14: POST /api/genres${NC}"
NEW_GENRE=$(curl -s -X POST "$BASE_URL/genres" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Western",
    "description": "Films se déroulant dans l'\''Ouest américain"
  }')
echo "$NEW_GENRE" | jq '{id, nom, nombre_films}'
NEW_GENRE_ID=$(echo "$NEW_GENRE" | jq -r '.id')
echo ""

# Test 15: Créer un nouveau film
echo -e "${BLUE}Test 15: POST /api/movies${NC}"
NEW_MOVIE=$(curl -s -X POST "$BASE_URL/movies" \
  -H "Content-Type: application/json" \
  -d "{
    \"titre\": \"Test Film\",
    \"annee\": 2024,
    \"director_id\": \"$NEW_DIRECTOR_ID\",
    \"genre_ids\": [\"$NEW_GENRE_ID\"],
    \"duree\": 120,
    \"statut\": \"a_voir\"
  }")
echo "$NEW_MOVIE" | jq '{id, titre, director_id, genre_ids}'
NEW_MOVIE_ID=$(echo "$NEW_MOVIE" | jq -r '.id')
echo ""

# Test 16: Créer une nouvelle collection
echo -e "${BLUE}Test 16: POST /api/collections${NC}"
NEW_COLLECTION=$(curl -s -X POST "$BASE_URL/collections" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test Collection",
    "description": "Collection de test",
    "is_public": false
  }')
echo "$NEW_COLLECTION" | jq '{id, nom, nombre_films}'
NEW_COLLECTION_ID=$(echo "$NEW_COLLECTION" | jq -r '.id')
echo ""

# Test 17: Ajouter un film à une collection
echo -e "${BLUE}Test 17: POST /api/collections/$NEW_COLLECTION_ID/movies${NC}"
curl -s -X POST "$BASE_URL/collections/$NEW_COLLECTION_ID/movies" \
  -H "Content-Type: application/json" \
  -d "{\"movie_id\": \"$NEW_MOVIE_ID\"}" | jq '.'
echo ""

# Test 18: Vérifier la collection mise à jour
echo -e "${BLUE}Test 18: GET /api/collections/$NEW_COLLECTION_ID${NC}"
curl -s "$BASE_URL/collections/$NEW_COLLECTION_ID" | jq '{nom, nombre_films, films: [.movies[].titre]}'
echo ""

# Test 19: Supprimer le film de la collection
echo -e "${BLUE}Test 19: DELETE /api/collections/$NEW_COLLECTION_ID/movies/$NEW_MOVIE_ID${NC}"
curl -s -X DELETE "$BASE_URL/collections/$NEW_COLLECTION_ID/movies/$NEW_MOVIE_ID"
echo -e "${GREEN}Film retiré de la collection${NC}"
echo ""

# Test 20: Nettoyage - Supprimer les données de test
echo -e "${BLUE}Test 20: Nettoyage des données de test${NC}"
curl -s -X DELETE "$BASE_URL/collections/$NEW_COLLECTION_ID" > /dev/null
echo -e "${GREEN}✓ Collection supprimée${NC}"
curl -s -X DELETE "$BASE_URL/movies/$NEW_MOVIE_ID" > /dev/null
echo -e "${GREEN}✓ Film supprimé${NC}"
curl -s -X DELETE "$BASE_URL/genres/$NEW_GENRE_ID" > /dev/null
echo -e "${GREEN}✓ Genre supprimé${NC}"
curl -s -X DELETE "$BASE_URL/directors/$NEW_DIRECTOR_ID" > /dev/null
echo -e "${GREEN}✓ Réalisateur supprimé${NC}"
echo ""

echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN} Tous les tests sont terminés !${NC}"
echo "═══════════════════════════════════════════════════════"
