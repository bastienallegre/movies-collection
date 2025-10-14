import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Obtenir le chemin du répertoire actuel en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier JSON
const moviesFilePath = path.join(__dirname, '../data/movies.json');

// Fonction pour lire les films depuis le fichier JSON
function readMovies() {
  try {
    const data = fs.readFileSync(moviesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier movies.json:', error);
    return [];
  }
}

// GET /api/stats - Récupère les statistiques de la collection
router.get('/', (req, res) => {
  const movies = readMovies();
  
  // Calcul des statistiques
  const total_films = movies.length;
  const films_vus = movies.filter(m => m.statut === 'vu').length;
  const films_a_voir = movies.filter(m => m.statut === 'a_voir').length;
  const films_en_cours = movies.filter(m => m.statut === 'en_cours').length;
  
  // Note moyenne des films vus
  const filmsAvecNote = movies.filter(m => m.statut === 'vu' && m.note);
  const note_moyenne = filmsAvecNote.length > 0
    ? Math.round((filmsAvecNote.reduce((sum, m) => sum + m.note, 0) / filmsAvecNote.length) * 10) / 10
    : 0;
  
  // Genres préférés (top 5)
  const genresCount = {};
  movies.forEach(movie => {
    if (movie.genres && Array.isArray(movie.genres)) {
      movie.genres.forEach(genre => {
        genresCount[genre] = (genresCount[genre] || 0) + 1;
      });
    }
  });
  
  const genres_preferes = Object.entries(genresCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Durée totale de visionnage (films vus uniquement)
  const duree_totale_visionnage = movies
    .filter(m => m.statut === 'vu' && m.duree)
    .reduce((sum, m) => sum + m.duree, 0);
  
  const stats = {
    total_films,
    films_vus,
    films_a_voir,
    films_en_cours,
    note_moyenne,
    genres_preferes,
    duree_totale_visionnage
  };
  
  res.json(stats);
});

export default router;
