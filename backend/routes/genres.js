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

// GET /api/genres - Liste tous les genres disponibles dans la collection
router.get('/', (req, res) => {
  const movies = readMovies();
  
  // Compter les films par genre
  const genresCount = {};
  
  movies.forEach(movie => {
    if (movie.genres && Array.isArray(movie.genres)) {
      movie.genres.forEach(genre => {
        genresCount[genre] = (genresCount[genre] || 0) + 1;
      });
    }
  });
  
  // Convertir en tableau et trier par count décroissant
  const genres = Object.entries(genresCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
  
  res.json(genres);
});

export default router;
