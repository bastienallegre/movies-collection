import express from 'express';
import {
  readData,
  writeData,
  generateId,
  findById,
  findIndexById,
  updateDirectorMovieCount
} from '../utils/dataManager.js';
import {
  generateDirectorLinks,
  generateMovieLinks,
  generatePaginationLinks
} from '../utils/hateoas.js';

const router = express.Router();

// GET /api/directors - Liste tous les réalisateurs
router.get('/', (req, res) => {
  const { page = 0, limit = 20, sort = 'nom' } = req.query;
  
  let directors = readData('directors');
  
  // Tri
  if (sort === 'nombre_films') {
    directors.sort((a, b) => (b.nombre_films || 0) - (a.nombre_films || 0));
  } else if (sort === 'nom') {
    directors.sort((a, b) => a.nom.localeCompare(b.nom));
  }
  
  // Pagination
  const startIndex = parseInt(page) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedDirectors = directors.slice(startIndex, endIndex);
  
  // Ajouter les liens HATEOAS
  const directorsWithLinks = paginatedDirectors.map(director => ({
    ...director,
    _links: generateDirectorLinks(director)
  }));
  
  res.json({
    total: directors.length,
    page: parseInt(page),
    limit: parseInt(limit),
    directors: directorsWithLinks,
    _links: generatePaginationLinks('/api/directors', parseInt(page), parseInt(limit), directors.length, { sort })
  });
});

// GET /api/directors/:id - Récupère un réalisateur spécifique
router.get('/:id', (req, res) => {
  const directors = readData('directors');
  const director = findById(directors, req.params.id);
  
  if (!director) {
    return res.status(404).json({ error: 'Réalisateur non trouvé' });
  }
  
  // Ajouter les liens HATEOAS
  const directorWithLinks = {
    ...director,
    _links: generateDirectorLinks(director)
  };
  
  res.json(directorWithLinks);
});

// GET /api/directors/:id/movies - Liste les films d'un réalisateur
router.get('/:id/movies', (req, res) => {
  const { page = 0, limit = 20 } = req.query;
  
  const directors = readData('directors');
  const director = findById(directors, req.params.id);
  
  if (!director) {
    return res.status(404).json({ error: 'Réalisateur non trouvé' });
  }
  
  const movies = readData('movies');
  const directorMovies = movies.filter(m => m.director_id === req.params.id);
  
  // Pagination
  const startIndex = parseInt(page) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedMovies = directorMovies.slice(startIndex, endIndex);
  
  // Ajouter les liens HATEOAS
  const moviesWithLinks = paginatedMovies.map(movie => ({
    ...movie,
    _links: generateMovieLinks(movie)
  }));
  
  res.json({
    total: directorMovies.length,
    page: parseInt(page),
    limit: parseInt(limit),
    movies: moviesWithLinks,
    _links: {
      self: { href: `/api/directors/${req.params.id}/movies`, method: 'GET' },
      director: { href: `/api/directors/${req.params.id}`, method: 'GET' }
    }
  });
});

// POST /api/directors - Crée un nouveau réalisateur
router.post('/', (req, res) => {
  const { nom, prenom } = req.body;
  
  // Validation
  if (!nom || !prenom) {
    return res.status(400).json({
      error: 'Le nom et le prénom sont requis'
    });
  }
  
  const directors = readData('directors');
  
  const newDirector = {
    id: generateId('dir', directors),
    nom,
    prenom,
    date_naissance: req.body.date_naissance || null,
    nationalite: req.body.nationalite || null,
    biographie: req.body.biographie || null,
    photo_url: req.body.photo_url || null,
    nombre_films: 0
  };
  
  directors.push(newDirector);
  writeData('directors', directors);
  
  // Ajouter les liens HATEOAS
  const directorWithLinks = {
    ...newDirector,
    _links: generateDirectorLinks(newDirector)
  };
  
  res.status(201).json(directorWithLinks);
});

// PUT /api/directors/:id - Met à jour un réalisateur
router.put('/:id', (req, res) => {
  const directors = readData('directors');
  const index = findIndexById(directors, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Réalisateur non trouvé' });
  }
  
  // Mise à jour (préserver l'ID et nombre_films)
  directors[index] = {
    ...directors[index],
    ...req.body,
    id: req.params.id,
    nombre_films: directors[index].nombre_films
  };
  
  writeData('directors', directors);
  
  // Ajouter les liens HATEOAS
  const directorWithLinks = {
    ...directors[index],
    _links: generateDirectorLinks(directors[index])
  };
  
  res.json(directorWithLinks);
});

// DELETE /api/directors/:id - Supprime un réalisateur
router.delete('/:id', (req, res) => {
  const directors = readData('directors');
  const index = findIndexById(directors, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Réalisateur non trouvé' });
  }
  
  // Vérifier si le réalisateur a des films
  const movies = readData('movies');
  const hasMovies = movies.some(m => m.director_id === req.params.id);
  
  if (hasMovies) {
    return res.status(400).json({
      error: 'Impossible de supprimer ce réalisateur car il a des films associés',
      code: 'DIRECTOR_HAS_MOVIES'
    });
  }
  
  directors.splice(index, 1);
  writeData('directors', directors);
  
  res.status(204).send();
});

export default router;
