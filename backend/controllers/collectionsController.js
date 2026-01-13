import { Collection, Movie } from '../models/index.js';

/**
 * GET /api/collections - Liste toutes les collections
 */
export const getAllCollections = async (req, res) => {
  try {
    const { page = 0, limit = 20 } = req.query;

    // Tri par date de création décroissant
    const collections = await Collection.find()
      .sort({ date_creation: -1 })
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Collection.countDocuments();

    const collectionsWithLinks = collections.map(collection => ({
      ...collection.toObject(),
      _links: {
        self: { href: `/api/collections/${collection.id}` },
        movies: { href: `/api/movies?collection_id=${collection.id}` }
      }
    }));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      collections: collectionsWithLinks,
      _links: {
        self: { href: `/api/collections?page=${page}&limit=${limit}` },
        ...(parseInt(page) > 0 && {
          prev: { href: `/api/collections?page=${parseInt(page) - 1}&limit=${limit}` }
        }),
        ...(parseInt(page) < Math.ceil(total / parseInt(limit)) - 1 && {
          next: { href: `/api/collections?page=${parseInt(page) + 1}&limit=${limit}` }
        })
      }
    });
  } catch (error) {
    console.error('Erreur dans getAllCollections:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des collections' });
  }
};

/**
 * GET /api/collections/:id - Récupère une collection spécifique
 */
export const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findOne({ id: req.params.id });

    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    // Récupérer les films de la collection
    const movies = await Movie.find({ id: { $in: collection.movie_ids } });

    res.json({
      ...collection.toObject(),
      movies: movies.map(m => ({
        id: m.id,
        titre: m.titre,
        annee: m.annee,
        affiche_url: m.affiche_url,
        _links: {
          self: { href: `/api/movies/${m.id}` }
        }
      })),
      _links: {
        self: { href: `/api/collections/${collection.id}` },
        movies: { href: `/api/movies?collection_id=${collection.id}` },
        update: { href: `/api/collections/${collection.id}`, method: 'PUT' },
        delete: { href: `/api/collections/${collection.id}`, method: 'DELETE' },
        addMovie: { href: `/api/collections/${collection.id}/movies`, method: 'POST' },
        all: { href: '/api/collections' }
      }
    });
  } catch (error) {
    console.error('Erreur dans getCollectionById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la collection' });
  }
};

/**
 * POST /api/collections - Crée une nouvelle collection
 */
export const createCollection = async (req, res) => {
  try {
    // Générer un nouvel ID
    const collections = await Collection.find().sort({ id: -1 }).limit(1);
    const lastId = collections.length > 0 ? collections[0].id : 'col_000';
    const numericPart = parseInt(lastId.split('_')[1]) + 1;
    const newId = `col_${String(numericPart).padStart(3, '0')}`;

    // Vérifier que les films existent si fournis
    if (req.body.movie_ids && req.body.movie_ids.length > 0) {
      const movies = await Movie.find({ id: { $in: req.body.movie_ids } });
      if (movies.length !== req.body.movie_ids.length) {
        return res.status(400).json({ error: 'Un ou plusieurs films n\'existent pas' });
      }
    }

    const newCollection = new Collection({
      id: newId,
      ...req.body,
      date_creation: new Date(),
      nombre_films: req.body.movie_ids ? req.body.movie_ids.length : 0
    });

    await newCollection.save();

    res.status(201).json({
      ...newCollection.toObject(),
      _links: {
        self: { href: `/api/collections/${newCollection.id}` },
        all: { href: '/api/collections' }
      }
    });
  } catch (error) {
    console.error('Erreur dans createCollection:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la collection' });
  }
};

/**
 * PUT /api/collections/:id - Met à jour une collection
 */
export const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ id: req.params.id });

    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    // Vérifier que les films existent si fournis
    if (req.body.movie_ids) {
      const movies = await Movie.find({ id: { $in: req.body.movie_ids } });
      if (movies.length !== req.body.movie_ids.length) {
        return res.status(400).json({ error: 'Un ou plusieurs films n\'existent pas' });
      }
      req.body.nombre_films = req.body.movie_ids.length;
    }

    Object.assign(collection, req.body);
    await collection.save();

    res.json({
      ...collection.toObject(),
      _links: {
        self: { href: `/api/collections/${collection.id}` },
        all: { href: '/api/collections' }
      }
    });
  } catch (error) {
    console.error('Erreur dans updateCollection:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la collection' });
  }
};

/**
 * DELETE /api/collections/:id - Supprime une collection
 */
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ id: req.params.id });

    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    await Collection.deleteOne({ id: req.params.id });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur dans deleteCollection:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la collection' });
  }
};

/**
 * POST /api/collections/:id/movies - Ajoute un film à une collection
 */
export const addMovieToCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ id: req.params.id });

    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    const { movie_id } = req.body;

    if (!movie_id) {
      return res.status(400).json({ error: 'movie_id est requis' });
    }

    // Vérifier que le film existe
    const movie = await Movie.findOne({ id: movie_id });
    if (!movie) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Vérifier si le film n'est pas déjà dans la collection
    if (collection.movie_ids.includes(movie_id)) {
      return res.status(400).json({ error: 'Ce film est déjà dans la collection' });
    }

    // Ajouter le film
    collection.movie_ids.push(movie_id);
    collection.nombre_films = collection.movie_ids.length;
    await collection.save();

    res.json({
      ...collection.toObject(),
      _links: {
        self: { href: `/api/collections/${collection.id}` },
        all: { href: '/api/collections' }
      }
    });
  } catch (error) {
    console.error('Erreur dans addMovieToCollection:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du film à la collection' });
  }
};

/**
 * DELETE /api/collections/:id/movies/:movieId - Retire un film d'une collection
 */
export const removeMovieFromCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ id: req.params.id });

    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    const { movieId } = req.params;

    // Vérifier si le film est dans la collection
    if (!collection.movie_ids.includes(movieId)) {
      return res.status(404).json({ error: 'Ce film n\'est pas dans la collection' });
    }

    // Retirer le film
    collection.movie_ids = collection.movie_ids.filter(id => id !== movieId);
    collection.nombre_films = collection.movie_ids.length;
    await collection.save();

    res.json({
      ...collection.toObject(),
      _links: {
        self: { href: `/api/collections/${collection.id}` },
        all: { href: '/api/collections' }
      }
    });
  } catch (error) {
    console.error('Erreur dans removeMovieFromCollection:', error);
    res.status(500).json({ error: 'Erreur lors du retrait du film de la collection' });
  }
};
