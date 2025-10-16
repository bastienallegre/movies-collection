import express from 'express';
import {
  readData,
  writeData,
  generateId,
  findById,
  findIndexById,
  idExists,
  updateCollectionMovieCount
} from '../utils/dataManager.js';
import {
  generateCollectionLinks,
  generateMovieLinks,
  generatePaginationLinks
} from '../utils/hateoas.js';

const router = express.Router();

// GET /api/collections - Liste toutes les collections
router.get('/', (req, res) => {
  const { page = 0, limit = 20 } = req.query;
  
  let collections = readData('collections');
  
  // Tri par date de création décroissant
  collections.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
  
  // Pagination
  const startIndex = parseInt(page) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedCollections = collections.slice(startIndex, endIndex);
  
  // Ajouter les liens HATEOAS
  const collectionsWithLinks = paginatedCollections.map(collection => ({
    ...collection,
    _links: generateCollectionLinks(collection)
  }));
  
  res.json({
    total: collections.length,
    page: parseInt(page),
    limit: parseInt(limit),
    collections: collectionsWithLinks,
    _links: generatePaginationLinks('/api/collections', parseInt(page), parseInt(limit), collections.length)
  });
});

// GET /api/collections/:id - Récupère une collection spécifique
router.get('/:id', (req, res) => {
  const collections = readData('collections');
  const collection = findById(collections, req.params.id);
  
  if (!collection) {
    return res.status(404).json({ error: 'Collection non trouvée' });
  }
  
  // Ajouter les films complets de la collection
  const movies = readData('movies');
  const collectionMovies = collection.movie_ids 
    ? movies.filter(m => collection.movie_ids.includes(m.id))
    : [];
  
  const collectionWithMovies = {
    ...collection,
    movies: collectionMovies.map(movie => ({
      ...movie,
      _links: generateMovieLinks(movie)
    })),
    _links: generateCollectionLinks(collection)
  };
  
  res.json(collectionWithMovies);
});

// GET /api/collections/:id/movies - Liste les films d'une collection
router.get('/:id/movies', (req, res) => {
  const { page = 0, limit = 20 } = req.query;
  
  const collections = readData('collections');
  const collection = findById(collections, req.params.id);
  
  if (!collection) {
    return res.status(404).json({ error: 'Collection non trouvée' });
  }
  
  const movies = readData('movies');
  const collectionMovies = collection.movie_ids 
    ? movies.filter(m => collection.movie_ids.includes(m.id))
    : [];
  
  // Pagination
  const startIndex = parseInt(page) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedMovies = collectionMovies.slice(startIndex, endIndex);
  
  // Ajouter les liens HATEOAS
  const moviesWithLinks = paginatedMovies.map(movie => ({
    ...movie,
    _links: generateMovieLinks(movie)
  }));
  
  res.json({
    total: collectionMovies.length,
    page: parseInt(page),
    limit: parseInt(limit),
    movies: moviesWithLinks,
    _links: {
      self: { href: `/api/collections/${req.params.id}/movies`, method: 'GET' },
      collection: { href: `/api/collections/${req.params.id}`, method: 'GET' }
    }
  });
});

// POST /api/collections - Crée une nouvelle collection
router.post('/', (req, res) => {
  const { nom } = req.body;
  
  // Validation
  if (!nom) {
    return res.status(400).json({
      error: 'Le nom de la collection est requis'
    });
  }
  
  const collections = readData('collections');
  
  const newCollection = {
    id: generateId('col', collections),
    nom,
    description: req.body.description || null,
    is_public: req.body.is_public !== undefined ? req.body.is_public : false,
    date_creation: new Date().toISOString(),
    nombre_films: 0,
    movie_ids: []
  };
  
  collections.push(newCollection);
  writeData('collections', collections);
  
  // Ajouter les liens HATEOAS
  const collectionWithLinks = {
    ...newCollection,
    _links: generateCollectionLinks(newCollection)
  };
  
  res.status(201).json(collectionWithLinks);
});

// POST /api/collections/:id/movies - Ajoute un film à la collection
router.post('/:id/movies', (req, res) => {
  const { movie_id } = req.body;
  
  if (!movie_id) {
    return res.status(400).json({
      error: 'Le movie_id est requis'
    });
  }
  
  // Vérifier que le film existe
  if (!idExists('movies', movie_id)) {
    return res.status(404).json({
      error: 'Film non trouvé',
      code: 'MOVIE_NOT_FOUND'
    });
  }
  
  const collections = readData('collections');
  const index = findIndexById(collections, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Collection non trouvée' });
  }
  
  // Initialiser movie_ids si nécessaire
  if (!collections[index].movie_ids) {
    collections[index].movie_ids = [];
  }
  
  // Vérifier si le film est déjà dans la collection
  if (collections[index].movie_ids.includes(movie_id)) {
    return res.status(400).json({
      error: 'Ce film est déjà dans la collection',
      code: 'MOVIE_ALREADY_IN_COLLECTION'
    });
  }
  
  // Ajouter le film
  collections[index].movie_ids.push(movie_id);
  collections[index].nombre_films = collections[index].movie_ids.length;
  
  writeData('collections', collections);
  
  res.json({
    message: 'Film ajouté à la collection avec succès',
    _links: {
      collection: { href: `/api/collections/${req.params.id}`, method: 'GET' },
      movie: { href: `/api/movies/${movie_id}`, method: 'GET' }
    }
  });
});

// DELETE /api/collections/:id/movies/:movie_id - Retire un film de la collection
router.delete('/:id/movies/:movie_id', (req, res) => {
  const collections = readData('collections');
  const index = findIndexById(collections, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Collection non trouvée' });
  }
  
  if (!collections[index].movie_ids) {
    collections[index].movie_ids = [];
  }
  
  const movieIndex = collections[index].movie_ids.indexOf(req.params.movie_id);
  
  if (movieIndex === -1) {
    return res.status(404).json({
      error: 'Ce film n\'est pas dans cette collection',
      code: 'MOVIE_NOT_IN_COLLECTION'
    });
  }
  
  // Retirer le film
  collections[index].movie_ids.splice(movieIndex, 1);
  collections[index].nombre_films = collections[index].movie_ids.length;
  
  writeData('collections', collections);
  
  res.status(204).send();
});

// PUT /api/collections/:id - Met à jour une collection
router.put('/:id', (req, res) => {
  const collections = readData('collections');
  const index = findIndexById(collections, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Collection non trouvée' });
  }
  
  // Mise à jour (préserver l'ID, date_creation, movie_ids et nombre_films)
  collections[index] = {
    ...collections[index],
    ...req.body,
    id: req.params.id,
    date_creation: collections[index].date_creation,
    movie_ids: collections[index].movie_ids,
    nombre_films: collections[index].nombre_films
  };
  
  writeData('collections', collections);
  
  // Ajouter les liens HATEOAS
  const collectionWithLinks = {
    ...collections[index],
    _links: generateCollectionLinks(collections[index])
  };
  
  res.json(collectionWithLinks);
});

// DELETE /api/collections/:id - Supprime une collection
router.delete('/:id', (req, res) => {
  const collections = readData('collections');
  const index = findIndexById(collections, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Collection non trouvée' });
  }
  
  collections.splice(index, 1);
  writeData('collections', collections);
  
  res.status(204).send();
});

export default router;
