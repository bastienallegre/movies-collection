import { Genre, Movie } from '../models/index.js';

/**
 * GET /api/genres - Liste tous les genres
 */
export const getAllGenres = async (req, res) => {
  try {
    const { page = 0, limit = 20 } = req.query;

    // Tri par nombre de films décroissant par défaut
    const genres = await Genre.find()
      .sort({ nombre_films: -1 })
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Genre.countDocuments();

    const genresWithLinks = genres.map(genre => ({
      ...genre.toObject(),
      _links: {
        self: { href: `/api/genres/${genre.id}` },
        movies: { href: `/api/movies?genre_id=${genre.id}` }
      }
    }));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      genres: genresWithLinks,
      _links: {
        self: { href: `/api/genres?page=${page}&limit=${limit}` },
        ...(parseInt(page) > 0 && {
          prev: { href: `/api/genres?page=${parseInt(page) - 1}&limit=${limit}` }
        }),
        ...(parseInt(page) < Math.ceil(total / parseInt(limit)) - 1 && {
          next: { href: `/api/genres?page=${parseInt(page) + 1}&limit=${limit}` }
        })
      }
    });
  } catch (error) {
    console.error('Erreur dans getAllGenres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des genres' });
  }
};

/**
 * GET /api/genres/:id - Récupère un genre spécifique
 */
export const getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findOne({ id: req.params.id });

    if (!genre) {
      return res.status(404).json({ error: 'Genre non trouvé' });
    }

    // Récupérer les films du genre
    const movies = await Movie.find({ genre_ids: genre.id });

    res.json({
      ...genre.toObject(),
      movies: movies.map(m => ({
        id: m.id,
        titre: m.titre,
        annee: m.annee,
        _links: {
          self: { href: `/api/movies/${m.id}` }
        }
      })),
      _links: {
        self: { href: `/api/genres/${genre.id}` },
        movies: { href: `/api/movies?genre_id=${genre.id}` },
        update: { href: `/api/genres/${genre.id}`, method: 'PUT' },
        delete: { href: `/api/genres/${genre.id}`, method: 'DELETE' },
        all: { href: '/api/genres' }
      }
    });
  } catch (error) {
    console.error('Erreur dans getGenreById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du genre' });
  }
};

/**
 * POST /api/genres - Crée un nouveau genre
 */
export const createGenre = async (req, res) => {
  try {
    // Vérifier si le genre existe déjà
    const existingGenre = await Genre.findOne({ nom: req.body.nom });
    if (existingGenre) {
      return res.status(400).json({ error: 'Ce genre existe déjà' });
    }

    // Générer un nouvel ID
    const genres = await Genre.find().sort({ id: -1 }).limit(1);
    const lastId = genres.length > 0 ? genres[0].id : 'gen_000';
    const numericPart = parseInt(lastId.split('_')[1]) + 1;
    const newId = `gen_${String(numericPart).padStart(3, '0')}`;

    const newGenre = new Genre({
      id: newId,
      ...req.body,
      nombre_films: 0
    });

    await newGenre.save();

    res.status(201).json({
      ...newGenre.toObject(),
      _links: {
        self: { href: `/api/genres/${newGenre.id}` },
        all: { href: '/api/genres' }
      }
    });
  } catch (error) {
    console.error('Erreur dans createGenre:', error);
    res.status(500).json({ error: 'Erreur lors de la création du genre' });
  }
};

/**
 * PUT /api/genres/:id - Met à jour un genre
 */
export const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findOne({ id: req.params.id });

    if (!genre) {
      return res.status(404).json({ error: 'Genre non trouvé' });
    }

    // Vérifier l'unicité du nom si changé
    if (req.body.nom && req.body.nom !== genre.nom) {
      const existingGenre = await Genre.findOne({ nom: req.body.nom });
      if (existingGenre) {
        return res.status(400).json({ error: 'Ce nom de genre existe déjà' });
      }
    }

    // Ne pas permettre la modification du nombre de films manuellement
    delete req.body.nombre_films;

    Object.assign(genre, req.body);
    await genre.save();

    res.json({
      ...genre.toObject(),
      _links: {
        self: { href: `/api/genres/${genre.id}` },
        all: { href: '/api/genres' }
      }
    });
  } catch (error) {
    console.error('Erreur dans updateGenre:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du genre' });
  }
};

/**
 * DELETE /api/genres/:id - Supprime un genre
 */
export const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findOne({ id: req.params.id });

    if (!genre) {
      return res.status(404).json({ error: 'Genre non trouvé' });
    }

    // Vérifier qu'aucun film ne référence ce genre
    const movieCount = await Movie.countDocuments({ genre_ids: genre.id });

    if (movieCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer ce genre',
        reason: `${movieCount} film(s) sont associés à ce genre`
      });
    }

    await Genre.deleteOne({ id: req.params.id });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur dans deleteGenre:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du genre' });
  }
};
