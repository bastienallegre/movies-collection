// Imports
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Import des routes
import moviesRoutes from './routes/movies.js';
import statsRoutes from './routes/stats.js';
import genresRoutes from './routes/genres.js';
import directorsRoutes from './routes/directors.js';
import collectionsRoutes from './routes/collections.js';

// Configuration de dotenv
dotenv.config();

// Initialisation de l'app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permet les requêtes depuis le frontend
app.use(express.json()); // Parse le JSON dans les requêtes
app.use(express.urlencoded({ extended: true })); // Parse les données de formulaires

// Middleware de logging (optionnel mais utile)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Movies Collection',
    version: '1.0.0',
    documentation: 'https://github.com/bastienallegre/movies-collection',
    endpoints: {
      movies: '/api/movies',
      directors: '/api/directors',
      genres: '/api/genres',
      collections: '/api/collections',
      stats: '/api/stats'
    },
    features: [
      'HATEOAS (Hypermedia As The Engine Of Application State)',
      'Normalisation des données (directors, genres, collections)',
      'Filtres avancés et pagination',
      'Relations many-to-many',
      'Statistiques enrichies'
    ]
  });
});

// Routes de l'API
app.use('/api/movies', moviesRoutes);
app.use('/api/directors', directorsRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/stats', statsRoutes);

// Route 404 - Pas trouvé
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api/movies`);
});