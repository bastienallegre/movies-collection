import { Movie, Director, Genre, Collection } from '../models/index.js';

/**
 * GET /api/movies - Liste tous les films avec filtres et pagination
 */
export const getAllMovies = async (req, res) => {
  try {
    const {
      status,
      genre_id,
      director_id,
      collection_id,
      sort = 'date_ajout',
      order = 'desc',
      page = 0,
      limit = 20,
      search
    } = req.query;

    // Construction de la requête de filtrage
    const query = {};

    if (status) {
      query.statut = status;
    }

    if (genre_id) {
      query.genre_ids = genre_id;
    }

    if (director_id) {
      query.director_id = director_id;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Filtre par collection
    if (collection_id) {
      const collection = await Collection.findOne({ id: collection_id });
      if (collection && collection.movie_ids) {
        query.id = { $in: collection.movie_ids };
      } else {
        // Collection vide ou inexistante
        return res.json({
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          movies: [],
          _links: {}
        });
      }
    }

    // Construction du tri
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sort]: sortOrder };

    // Exécution de la requête avec pagination
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    // Enrichir avec les liens HATEOAS (on le fera après)
    const moviesWithLinks = movies.map(movie => ({
      ...movie.toObject(),
      _links: {
        self: { href: `/api/movies/${movie.id}` },
        director: { href: `/api/directors/${movie.director_id}` },
        genres: movie.genre_ids.map(gid => ({ href: `/api/genres/${gid}` }))
      }
    }));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      movies: moviesWithLinks,
      _links: {
        self: { href: `/api/movies?page=${page}&limit=${limit}` },
        ...(parseInt(page) > 0 && {
          prev: { href: `/api/movies?page=${parseInt(page) - 1}&limit=${limit}` }
        }),
        ...(parseInt(page) < Math.ceil(total / parseInt(limit)) - 1 && {
          next: { href: `/api/movies?page=${parseInt(page) + 1}&limit=${limit}` }
        })
      }
    });
  } catch (error) {
    console.error('Erreur dans getAllMovies:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des films' });
  }
};

/**
 * GET /api/movies/:id - Récupère un film spécifique
 */
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findOne({ id: req.params.id });

    if (!movie) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Enrichir avec les informations du réalisateur et des genres
    const director = await Director.findOne({ id: movie.director_id });
    const genres = await Genre.find({ id: { $in: movie.genre_ids } });

    const movieWithDetails = {
      ...movie.toObject(),
      director: director ? {
        id: director.id,
        nom: director.nom,
        prenom: director.prenom,
        _links: {
          self: { href: `/api/directors/${director.id}` }
        }
      } : null,
      genres: genres.map(g => ({
        id: g.id,
        nom: g.nom,
        _links: {
          self: { href: `/api/genres/${g.id}` }
        }
      })),
      _links: {
        self: { href: `/api/movies/${movie.id}` },
        update: { href: `/api/movies/${movie.id}`, method: 'PUT' },
        delete: { href: `/api/movies/${movie.id}`, method: 'DELETE' },
        all: { href: '/api/movies' }
      }
    };

    res.json(movieWithDetails);
  } catch (error) {
    console.error('Erreur dans getMovieById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du film' });
  }
};

/**
 * POST /api/movies - Crée un nouveau film
 */
export const createMovie = async (req, res) => {
  try {
    // Générer un nouvel ID
    const movies = await Movie.find().sort({ id: -1 }).limit(1);
    const lastId = movies.length > 0 ? movies[0].id : 'mov_000';
    const numericPart = parseInt(lastId.split('_')[1]) + 1;
    const newId = `mov_${String(numericPart).padStart(3, '0')}`;

    // Vérifier que le réalisateur existe
    if (req.body.director_id) {
      const director = await Director.findOne({ id: req.body.director_id });
      if (!director) {
        return res.status(400).json({ error: 'Réalisateur non trouvé' });
      }
    }

    // Vérifier que les genres existent
    if (req.body.genre_ids && req.body.genre_ids.length > 0) {
      const genres = await Genre.find({ id: { $in: req.body.genre_ids } });
      if (genres.length !== req.body.genre_ids.length) {
        return res.status(400).json({ error: 'Un ou plusieurs genres n\'existent pas' });
      }
    }

    // Créer le film
    const newMovie = new Movie({
      id: newId,
      ...req.body,
      date_ajout: new Date()
    });

    await newMovie.save();

    // Mettre à jour le compteur du réalisateur
    if (newMovie.director_id) {
      await Director.findOneAndUpdate(
        { id: newMovie.director_id },
        { $inc: { nombre_films: 1 } }
      );
    }

    // Mettre à jour les compteurs des genres
    if (newMovie.genre_ids && newMovie.genre_ids.length > 0) {
      await Genre.updateMany(
        { id: { $in: newMovie.genre_ids } },
        { $inc: { nombre_films: 1 } }
      );
    }

    res.status(201).json({
      ...newMovie.toObject(),
      _links: {
        self: { href: `/api/movies/${newMovie.id}` },
        all: { href: '/api/movies' }
      }
    });
  } catch (error) {
    console.error('Erreur dans createMovie:', error);
    res.status(500).json({ error: 'Erreur lors de la création du film' });
  }
};

/**
 * PUT /api/movies/:id - Met à jour un film
 */
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ id: req.params.id });

    if (!movie) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Sauvegarder les anciennes valeurs pour mettre à jour les compteurs
    const oldDirectorId = movie.director_id;
    const oldGenreIds = [...movie.genre_ids];

    // Vérifier le nouveau réalisateur s'il a changé
    if (req.body.director_id && req.body.director_id !== oldDirectorId) {
      const director = await Director.findOne({ id: req.body.director_id });
      if (!director) {
        return res.status(400).json({ error: 'Réalisateur non trouvé' });
      }
    }

    // Vérifier les nouveaux genres s'ils ont changé
    if (req.body.genre_ids) {
      const genres = await Genre.find({ id: { $in: req.body.genre_ids } });
      if (genres.length !== req.body.genre_ids.length) {
        return res.status(400).json({ error: 'Un ou plusieurs genres n\'existent pas' });
      }
    }

    // Mettre à jour le film
    Object.assign(movie, req.body);
    await movie.save();

    // Mettre à jour les compteurs de réalisateurs si changé
    if (req.body.director_id && req.body.director_id !== oldDirectorId) {
      await Director.findOneAndUpdate(
        { id: oldDirectorId },
        { $inc: { nombre_films: -1 } }
      );
      await Director.findOneAndUpdate(
        { id: req.body.director_id },
        { $inc: { nombre_films: 1 } }
      );
    }

    // Mettre à jour les compteurs de genres si changé
    if (req.body.genre_ids) {
      const removedGenres = oldGenreIds.filter(id => !req.body.genre_ids.includes(id));
      const addedGenres = req.body.genre_ids.filter(id => !oldGenreIds.includes(id));

      if (removedGenres.length > 0) {
        await Genre.updateMany(
          { id: { $in: removedGenres } },
          { $inc: { nombre_films: -1 } }
        );
      }

      if (addedGenres.length > 0) {
        await Genre.updateMany(
          { id: { $in: addedGenres } },
          { $inc: { nombre_films: 1 } }
        );
      }
    }

    res.json({
      ...movie.toObject(),
      _links: {
        self: { href: `/api/movies/${movie.id}` },
        all: { href: '/api/movies' }
      }
    });
  } catch (error) {
    console.error('Erreur dans updateMovie:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du film' });
  }
};

/**
 * DELETE /api/movies/:id - Supprime un film
 */
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ id: req.params.id });

    if (!movie) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Supprimer le film des collections
    await Collection.updateMany(
      { movie_ids: movie.id },
      {
        $pull: { movie_ids: movie.id },
        $inc: { nombre_films: -1 }
      }
    );

    // Mettre à jour les compteurs
    if (movie.director_id) {
      await Director.findOneAndUpdate(
        { id: movie.director_id },
        { $inc: { nombre_films: -1 } }
      );
    }

    if (movie.genre_ids && movie.genre_ids.length > 0) {
      await Genre.updateMany(
        { id: { $in: movie.genre_ids } },
        { $inc: { nombre_films: -1 } }
      );
    }

    await Movie.deleteOne({ id: req.params.id });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur dans deleteMovie:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du film' });
  }
};
