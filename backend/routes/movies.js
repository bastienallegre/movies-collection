import express from 'express';
const router = express.Router();

// Données temporaires en mémoire (à remplacer par une vraie BDD plus tard)
let movies = [
  {
    id: '1',
    titre: 'Inception',
    annee: 2010,
    realisateur: 'Christopher Nolan',
    genres: ['Science-Fiction', 'Thriller'],
    duree: 148,
    statut: 'vu',
    note: 9.5,
    commentaire: 'Chef-d\'œuvre absolu ! Les niveaux de rêves sont fascinants.',
    affiche_url: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    date_ajout: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    titre: 'Interstellar',
    annee: 2014,
    realisateur: 'Christopher Nolan',
    genres: ['Science-Fiction', 'Drame'],
    duree: 169,
    statut: 'vu',
    note: 9.0,
    commentaire: 'Émotionnellement puissant avec une science incroyable.',
    affiche_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    date_ajout: new Date('2024-01-20').toISOString()
  },
  {
    id: '3',
    titre: 'Dune',
    annee: 2021,
    realisateur: 'Denis Villeneuve',
    genres: ['Science-Fiction', 'Aventure'],
    duree: 155,
    statut: 'a_voir',
    date_ajout: new Date('2024-02-01').toISOString()
  }
];

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
  
  res.json(movies[index]);
});

// DELETE /api/movies/:id - Supprime un film
router.delete('/:id', (req, res) => {
  const index = movies.findIndex(m => m.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Film non trouvé' });
  }
  
  movies.splice(index, 1);
  
  res.json({ message: 'Film supprimé avec succès' });
});

export default router;