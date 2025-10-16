import express from 'express';
import {
  readData,
  writeData,
  generateId,
  findById,
  findIndexById,
  idExists,
  updateDirectorMovieCount,
  updateGenreMovieCount
} from '../utils/dataManager.js';
import {
  generateMovieLinks,
  generateDirectorLinks,
  generateGenreLinks,
  generatePaginationLinks
} from '../utils/hateoas.js';

const router = express.Router();

// GET /api/movies - Liste tous les films
router.get('/', (req, res) => {
  const { status, genre_id, director_id, collection_id, sort, order = 'desc', page = 0, limit = 20 } = req.query;
  
  let movies = readData('movies');
  
  // Filtre par statut
  if (status) {
    movies = movies.filter(m => m.statut === status);
  }
  
  // Filtre par genre
  if (genre_id) {
    movies = movies.filter(m => m.genre_ids && m.genre_ids.includes(genre_id));
  }
  
  // Filtre par réalisateur
  if (director_id) {
    movies = movies.filter(m => m.director_id === director_id);
  }
  
  // Filtre par collection
  if (collection_id) {
    const collections = readData('collections');
    const collection = findById(collections, collection_id);
    if (collection && collection.movie_ids) {
      movies = movies.filter(m => collection.movie_ids.includes(m.id));
    } else {
      movies = [];
    }
  }
  
  // Tri
  if (sort) {
    movies.sort((a, b) => {
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
  const paginatedMovies = movies.slice(startIndex, endIndex);
  
  // Ajouter les liens HATEOAS
  const moviesWithLinks = paginatedMovies.map(movie => ({
    ...movie,
    _links: generateMovieLinks(movie)
  }));
  
  const queryParams = {};
  if (status) queryParams.status = status;
  if (genre_id) queryParams.genre_id = genre_id;
  if (director_id) queryParams.director_id = director_id;
  if (collection_id) queryParams.collection_id = collection_id;
  if (sort) queryParams.sort = sort;
  if (order) queryParams.order = order;
  
  res.json({
    total: movies.length,
    page: parseInt(page),
    limit: parseInt(limit),
    movies: moviesWithLinks,
    _links: generatePaginationLinks('/api/movies', parseInt(page), parseInt(limit), movies.length, queryParams)
  });
});

// GET /api/movies/search - Recherche par titre
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Le paramètre "q" est requis' });
  }
  
  const movies = readData('movies');
  const results = movies.filter(m => 
    m.titre.toLowerCase().includes(q.toLowerCase())
  );
  
  // Ajouter les liens HATEOAS
  const resultsWithLinks = results.map(movie => ({
    ...movie,
    _links: generateMovieLinks(movie)
  }));
  
  res.json({
    total: results.length,
    movies: resultsWithLinks,
    _links: {
      self: { href: `/api/movies/search?q=${encodeURIComponent(q)}`, method: 'GET' }
    }
  });
});

// GET /api/movies/:id - Récupère un film spécifique
router.get('/:id', (req, res) => {
  const movies = readData('movies');
  const movie = findById(movies, req.params.id);
  
  if (!movie) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  // Enrichir avec les données du réalisateur
  const directors = readData('directors');
  const director = movie.director_id ? findById(directors, movie.director_id) : null;
  
  // Enrichir avec les données des genres
  const genres = readData('genres');
  const movieGenres = movie.genre_ids 
    ? genres.filter(g => movie.genre_ids.includes(g.id)).map(g => ({
        ...g,
        _links: generateGenreLinks(g)
      }))
    : [];
  
  // Enrichir avec les collections
  const collections = readData('collections');
  const movieCollections = collections
    .filter(c => c.movie_ids && c.movie_ids.includes(movie.id))
    .map(c => ({
      id: c.id,
      nom: c.nom,
      _links: {
        self: { href: `/api/collections/${c.id}`, method: 'GET' }
      }
    }));
  
  const movieDetail = {
    ...movie,
    director: director ? {
      ...director,
      _links: generateDirectorLinks(director)
    } : null,
    genres: movieGenres,
    collections: movieCollections,
    _links: {
      self: { href: `/api/movies/${movie.id}`, method: 'GET', rel: 'self' },
      update: { href: `/api/movies/${movie.id}`, method: 'PUT', rel: 'update' },
      delete: { href: `/api/movies/${movie.id}`, method: 'DELETE', rel: 'delete' }
    }
  };
  
  res.json(movieDetail);
});

// POST /api/movies - Ajoute un nouveau film
router.post('/', (req, res) => {
  const { titre, annee, director_id } = req.body;
  
  // Validation basique
  if (!titre || !annee) {
    return res.status(400).json({ 
      error: 'Le titre et l\'année sont requis' 
    });
  }
  
  // Vérifier que le réalisateur existe (si fourni)
  if (director_id && !idExists('directors', director_id)) {
    return res.status(400).json({
      error: 'Le réalisateur spécifié n\'existe pas',
      code: 'DIRECTOR_NOT_FOUND'
    });
  }
  
  // Vérifier que tous les genres existent (si fournis)
  if (req.body.genre_ids && Array.isArray(req.body.genre_ids)) {
    const genres = readData('genres');
    for (const genreId of req.body.genre_ids) {
      if (!genres.find(g => g.id === genreId)) {
        return res.status(400).json({
          error: `Le genre ${genreId} n'existe pas`,
          code: 'GENRE_NOT_FOUND'
        });
      }
    }
  }
  
  const movies = readData('movies');
  
  const newMovie = {
    id: generateId('mov', movies),
    titre,
    annee,
    director_id: director_id || null,
    genre_ids: req.body.genre_ids || [],
    duree: req.body.duree || null,
    synopsis: req.body.synopsis || null,
    statut: req.body.statut || 'a_voir',
    note: req.body.note || null,
    commentaire: req.body.commentaire || null,
    affiche_url: req.body.affiche_url || null,
    tmdb_id: req.body.tmdb_id || null,
    tags: req.body.tags || [],
    date_ajout: new Date().toISOString(),
    date_visionnage: req.body.date_visionnage || null
  };
  
  movies.push(newMovie);
  writeData('movies', movies);
  
  // Mettre à jour les compteurs
  if (director_id) updateDirectorMovieCount(director_id);
  if (req.body.genre_ids) {
    req.body.genre_ids.forEach(genreId => updateGenreMovieCount(genreId));
  }
  
  // Ajouter les liens HATEOAS
  const movieWithLinks = {
    ...newMovie,
    _links: generateMovieLinks(newMovie)
  };
  
  res.status(201).json(movieWithLinks);
});

// PUT /api/movies/:id - Met à jour un film
router.put('/:id', (req, res) => {
  const movies = readData('movies');
  const index = findIndexById(movies, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  const oldMovie = movies[index];
  
  // Vérifier que le réalisateur existe (si fourni)
  if (req.body.director_id && !idExists('directors', req.body.director_id)) {
    return res.status(400).json({
      error: 'Le réalisateur spécifié n\'existe pas',
      code: 'DIRECTOR_NOT_FOUND'
    });
  }
  
  // Vérifier que tous les genres existent (si fournis)
  if (req.body.genre_ids && Array.isArray(req.body.genre_ids)) {
    const genres = readData('genres');
    for (const genreId of req.body.genre_ids) {
      if (!genres.find(g => g.id === genreId)) {
        return res.status(400).json({
          error: `Le genre ${genreId} n'existe pas`,
          code: 'GENRE_NOT_FOUND'
        });
      }
    }
  }
  
  movies[index] = {
    ...oldMovie,
    ...req.body,
    id: req.params.id, // S'assure que l'ID ne change pas
    date_ajout: oldMovie.date_ajout // Préserver la date d'ajout
  };
  
  writeData('movies', movies);
  
  // Mettre à jour les compteurs si nécessaire
  if (oldMovie.director_id) updateDirectorMovieCount(oldMovie.director_id);
  if (movies[index].director_id && movies[index].director_id !== oldMovie.director_id) {
    updateDirectorMovieCount(movies[index].director_id);
  }
  
  // Mettre à jour les compteurs de genres
  const oldGenreIds = oldMovie.genre_ids || [];
  const newGenreIds = movies[index].genre_ids || [];
  const allGenreIds = [...new Set([...oldGenreIds, ...newGenreIds])];
  allGenreIds.forEach(genreId => updateGenreMovieCount(genreId));
  
  // Ajouter les liens HATEOAS
  const movieWithLinks = {
    ...movies[index],
    _links: generateMovieLinks(movies[index])
  };
  
  res.json(movieWithLinks);
});

// DELETE /api/movies/:id - Supprime un film
router.delete('/:id', (req, res) => {
  const movies = readData('movies');
  const index = findIndexById(movies, req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  const movie = movies[index];
  
  // Retirer le film des collections
  const collections = readData('collections');
  let collectionsModified = false;
  collections.forEach(collection => {
    if (collection.movie_ids && collection.movie_ids.includes(req.params.id)) {
      collection.movie_ids = collection.movie_ids.filter(id => id !== req.params.id);
      collection.nombre_films = collection.movie_ids.length;
      collectionsModified = true;
    }
  });
  if (collectionsModified) {
    writeData('collections', collections);
  }
  
  movies.splice(index, 1);
  writeData('movies', movies);
  
  // Mettre à jour les compteurs
  if (movie.director_id) updateDirectorMovieCount(movie.director_id);
  if (movie.genre_ids) {
    movie.genre_ids.forEach(genreId => updateGenreMovieCount(genreId));
  }
  
  res.status(204).send();
});

export default router;