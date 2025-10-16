import express from 'express';
import {
  readData,
  writeData,
  generateId,
  findById,
  findIndexById,
  updateGenreMovieCount
} from '../utils/dataManager.js';
import {
  generateGenreLinks,
  generateMovieLinks,
  generatePaginationLinks
} from '../utils/hateoas.js';

const router = express.Router();

// GET /api/genres - Liste tous les genres
router.get('/', (req, res) => {
  const { page = 0, limit = 20 } = req.query;
  
  let genres = readData('genres');
  
  // Tri par nombre de films décroissant par défaut
  genres.sort((a, b) => (b.nombre_films || 0) - (a.nombre_films || 0));
  
  // Pagination
  const startIndex = parseInt(page) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedGenres = genres.slice(startIndex, endIndex);
  
  // Ajouter les liens HATEOAS
  const genresWithLinks = paginatedGenres.map(genre => ({
    ...genre,
    _links: generateGenreLinks(genre)
  }));
  
  res.json({
    total: genres.length,
    page: parseInt(page),
    limit: parseInt(limit),
    genres: genresWithLinks,
    _links: generatePaginationLinks('/api/genres', parseInt(page), parseInt(limit), genres.length)
  });
});

// GET /api/genres/:id - Récupère un genre spécifique
router.get('/:id', (req, res) => {
  const genres = readData('genres');
  const genre = findById(genres, req.params.id);
  
  if (!genre) {
    return res.status(404).json({ error: 'Genre non trouvé' });
  }
  
  // Ajouter les liens HATEOAS
  const genreWithLinks = {
    ...genre,
    _links: generateGenreLinks(genre)
  };
  
  res.json(genreWithLinks);
});

// GET /api/genres/:id/movies - Liste les films d'un genre
router.get('/:id/movies', (req, res) => {
  const { page = 0, limit = 20 } = req.query;
  
  const genres = readData('genres');
  const genre = findById(genres, req.params.id);
  
  if (!genre) {
    return res.status(404).json({ error: 'Genre non trouvé' });
  }
  
  const movies = readData('movies');
  const genreMovies = movies.filter(m => 
    m.genre_ids && m.genre_ids.includes(req.params.id)
  );
  
  // Pagination
  const startIndex = parseInt(page) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedMovies = genreMovies.slice(startIndex, endIndex);
  
  // Ajouter les liens HATEOAS
  const moviesWithLinks = paginatedMovies.map(movie => ({
    ...movie,
    _links: generateMovieLinks(movie)
  }));
  
  res.json({
    total: genreMovies.length,
    page: parseInt(page),
    limit: parseInt(limit),
    movies: moviesWithLinks,
    _links: {
      self: { href: `/api/genres/${req.params.id}/movies`, method: 'GET' },
      genre: { href: `/api/genres/${req.params.id}`, method: 'GET' }
    }
  });
});

// POST /api/genres - Crée un nouveau genre
router.post('/', (req, res) => {
  const { nom } = req.body;
  
  // Validation
  if (!nom) {
    return res.status(400).json({
      error: 'Le nom du genre est requis'
    });
  }
  
  const genres = readData('genres');
  
  // Vérifier si le genre existe déjà
  const existingGenre = genres.find(g => g.nom.toLowerCase() === nom.toLowerCase());
  if (existingGenre) {
    return res.status(400).json({
      error: 'Un genre avec ce nom existe déjà',
      code: 'GENRE_ALREADY_EXISTS'
    });
  }
  
  const newGenre = {
    id: generateId('gen', genres),
    nom,
    description: req.body.description || null,
    nombre_films: 0
  };
  
  genres.push(newGenre);
  writeData('genres', genres);
  
  // Ajouter les liens HATEOAS
  const genreWithLinks = {
    ...newGenre,
    _links: generateGenreLinks(newGenre)
  };
  
  res.status(201).json(genreWithLinks);
});

// PUT /api/genres/:id - Met à jour un genre
router.put('/:id', (req, res) => {
  const genres = readData('genres');
  const index = findIndexById(genres, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Genre non trouvé' });
  }
  
  // Mise à jour (préserver l'ID et nombre_films)
  genres[index] = {
    ...genres[index],
    ...req.body,
    id: req.params.id,
    nombre_films: genres[index].nombre_films
  };
  
  writeData('genres', genres);
  
  // Ajouter les liens HATEOAS
  const genreWithLinks = {
    ...genres[index],
    _links: generateGenreLinks(genres[index])
  };
  
  res.json(genreWithLinks);
});

// DELETE /api/genres/:id - Supprime un genre
router.delete('/:id', (req, res) => {
  const genres = readData('genres');
  const index = findIndexById(genres, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Genre non trouvé' });
  }
  
  // Vérifier si le genre est utilisé par des films
  const movies = readData('movies');
  const isUsed = movies.some(m => m.genre_ids && m.genre_ids.includes(req.params.id));
  
  if (isUsed) {
    return res.status(400).json({
      error: 'Impossible de supprimer ce genre car il est utilisé par des films',
      code: 'GENRE_IN_USE'
    });
  }
  
  genres.splice(index, 1);
  writeData('genres', genres);
  
  res.status(204).send();
});

export default router;
