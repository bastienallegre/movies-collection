import express from 'express';
import { readData } from '../utils/dataManager.js';
import { generateStatsLinks, generateDirectorLinks, generateGenreLinks } from '../utils/hateoas.js';

const router = express.Router();

// GET /api/stats - Récupère les statistiques de la collection
router.get('/', (req, res) => {
  const movies = readData('movies');
  const directors = readData('directors');
  const genres = readData('genres');
  const collections = readData('collections');
  
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
  
  // Top genres (top 5)
  const genreStats = {};
  movies.forEach(movie => {
    if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
      movie.genre_ids.forEach(genreId => {
        genreStats[genreId] = (genreStats[genreId] || 0) + 1;
      });
    }
  });
  
  const top_genres = Object.entries(genreStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genreId, count]) => {
      const genre = genres.find(g => g.id === genreId);
      return genre ? {
        genre: {
          id: genre.id,
          nom: genre.nom,
          _links: generateGenreLinks(genre)
        },
        count
      } : null;
    })
    .filter(item => item !== null);
  
  // Top réalisateurs (top 5)
  const directorStats = {};
  movies.forEach(movie => {
    if (movie.director_id) {
      directorStats[movie.director_id] = (directorStats[movie.director_id] || 0) + 1;
    }
  });
  
  const top_directors = Object.entries(directorStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([directorId, count]) => {
      const director = directors.find(d => d.id === directorId);
      return director ? {
        director: {
          id: director.id,
          nom: director.nom,
          prenom: director.prenom,
          _links: generateDirectorLinks(director)
        },
        count
      } : null;
    })
    .filter(item => item !== null);
  
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
    duree_totale_visionnage,
    total_collections: collections.length,
    total_genres: genres.length,
    total_directors: directors.length,
    top_genres,
    top_directors,
    _links: generateStatsLinks()
  };
  
  res.json(stats);
});

export default router;
