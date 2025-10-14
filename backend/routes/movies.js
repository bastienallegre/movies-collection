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

// Fonction pour sauvegarder les films dans le fichier JSON
function saveMovies(movies) {
  try {
    fs.writeFileSync(moviesFilePath, JSON.stringify(movies, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier movies.json:', error);
  }
}

// Charger les données au démarrage
let movies = readMovies();

// GET /api/movies - Liste tous les films
router.get('/', (req, res) => {
  const { status, genre, sort, order = 'desc', page = 0, limit = 20 } = req.query;
  
  let filteredMovies = [...movies];
  
  // Filtre par statut
  if (status) {
    filteredMovies = filteredMovies.filter(m => m.statut === status);
  }
  
  // Filtre par genre
  if (genre) {
    filteredMovies = filteredMovies.filter(m => 
      m.genres && m.genres.includes(genre)
    );
  }
  
  // Tri
  if (sort) {
    filteredMovies.sort((a, b) => {
      let comparison = 0;
      
      switch(sort) {
        case 'titre':
          comparison = a.titre.localeCompare(b.titre);
          break;
        case 'annee':
          comparison = (a.annee || 0) - (b.annee || 0);
          break;
        case 'note':
          comparison = (a.note || 0) - (b.note || 0);
          break;
        case 'date_ajout':
          comparison = new Date(a.date_ajout) - new Date(b.date_ajout);
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  }
  
  // Pagination
  const startIndex = parseInt(page) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
  
  res.json({
    total: filteredMovies.length,
    page: parseInt(page),
    limit: parseInt(limit),
    movies: paginatedMovies
  });
});

// GET /api/movies/search - Recherche par titre
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Le paramètre "q" est requis' });
  }
  
  const results = movies.filter(m => 
    m.titre.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    total: results.length,
    movies: results
  });
});

// GET /api/movies/:id - Récupère un film spécifique
router.get('/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  
  if (!movie) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  res.json(movie);
});

// POST /api/movies - Ajoute un nouveau film
router.post('/', (req, res) => {
  const { titre, annee } = req.body;
  
  // Validation basique
  if (!titre || !annee) {
    return res.status(400).json({ 
      error: 'Le titre et l\'année sont requis' 
    });
  }
  
  const newMovie = {
    id: Date.now().toString(),
    ...req.body,
    date_ajout: new Date().toISOString(),
    statut: req.body.statut || 'a_voir'
  };
  
  movies.push(newMovie);
  saveMovies(movies); // Sauvegarder dans le fichier JSON
  
  res.status(201).json(newMovie);
});

// PUT /api/movies/:id - Met à jour un film
router.put('/:id', (req, res) => {
  const index = movies.findIndex(m => m.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  movies[index] = {
    ...movies[index],
    ...req.body,
    id: req.params.id // S'assure que l'ID ne change pas
  };
  
  saveMovies(movies); // Sauvegarder dans le fichier JSON
  
  res.json(movies[index]);
});

// DELETE /api/movies/:id - Supprime un film
router.delete('/:id', (req, res) => {
  const index = movies.findIndex(m => m.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  movies.splice(index, 1);
  saveMovies(movies); // Sauvegarder dans le fichier JSON
  
  res.json({ message: 'Film supprimé avec succès' });
});

export default router;