import { Director, Movie } from '../models/index.js';

/**
 * GET /api/directors - Liste tous les réalisateurs
 */
export const getAllDirectors = async (req, res) => {
  try {
    const { page = 0, limit = 20, sort = 'nom' } = req.query;

    // Construction du tri
    const sortOptions = {};
    if (sort === 'nombre_films') {
      sortOptions.nombre_films = -1;
    } else {
      sortOptions.nom = 1;
    }

    // Récupération avec pagination
    const directors = await Director.find()
      .sort(sortOptions)
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Director.countDocuments();

    const directorsWithLinks = directors.map(director => ({
      ...director.toObject(),
      _links: {
        self: { href: `/api/directors/${director.id}` },
        movies: { href: `/api/movies?director_id=${director.id}` }
      }
    }));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      directors: directorsWithLinks,
      _links: {
        self: { href: `/api/directors?page=${page}&limit=${limit}` },
        ...(parseInt(page) > 0 && {
          prev: { href: `/api/directors?page=${parseInt(page) - 1}&limit=${limit}` }
        }),
        ...(parseInt(page) < Math.ceil(total / parseInt(limit)) - 1 && {
          next: { href: `/api/directors?page=${parseInt(page) + 1}&limit=${limit}` }
        })
      }
    });
  } catch (error) {
    console.error('Erreur dans getAllDirectors:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réalisateurs' });
  }
};

/**
 * GET /api/directors/:id - Récupère un réalisateur spécifique
 */
export const getDirectorById = async (req, res) => {
  try {
    const director = await Director.findOne({ id: req.params.id });

    if (!director) {
      return res.status(404).json({ error: 'Réalisateur non trouvé' });
    }

    // Récupérer les films du réalisateur
    const movies = await Movie.find({ director_id: director.id });

    res.json({
      ...director.toObject(),
      movies: movies.map(m => ({
        id: m.id,
        titre: m.titre,
        annee: m.annee,
        _links: {
          self: { href: `/api/movies/${m.id}` }
        }
      })),
      _links: {
        self: { href: `/api/directors/${director.id}` },
        movies: { href: `/api/movies?director_id=${director.id}` },
        update: { href: `/api/directors/${director.id}`, method: 'PUT' },
        delete: { href: `/api/directors/${director.id}`, method: 'DELETE' },
        all: { href: '/api/directors' }
      }
    });
  } catch (error) {
    console.error('Erreur dans getDirectorById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du réalisateur' });
  }
};

/**
 * POST /api/directors - Crée un nouveau réalisateur
 */
export const createDirector = async (req, res) => {
  try {
    // Générer un nouvel ID
    const directors = await Director.find().sort({ id: -1 }).limit(1);
    const lastId = directors.length > 0 ? directors[0].id : 'dir_000';
    const numericPart = parseInt(lastId.split('_')[1]) + 1;
    const newId = `dir_${String(numericPart).padStart(3, '0')}`;

    const newDirector = new Director({
      id: newId,
      ...req.body,
      nombre_films: 0
    });

    await newDirector.save();

    res.status(201).json({
      ...newDirector.toObject(),
      _links: {
        self: { href: `/api/directors/${newDirector.id}` },
        all: { href: '/api/directors' }
      }
    });
  } catch (error) {
    console.error('Erreur dans createDirector:', error);
    res.status(500).json({ error: 'Erreur lors de la création du réalisateur' });
  }
};

/**
 * PUT /api/directors/:id - Met à jour un réalisateur
 */
export const updateDirector = async (req, res) => {
  try {
    const director = await Director.findOne({ id: req.params.id });

    if (!director) {
      return res.status(404).json({ error: 'Réalisateur non trouvé' });
    }

    // Ne pas permettre la modification du nombre de films manuellement
    delete req.body.nombre_films;

    Object.assign(director, req.body);
    await director.save();

    res.json({
      ...director.toObject(),
      _links: {
        self: { href: `/api/directors/${director.id}` },
        all: { href: '/api/directors' }
      }
    });
  } catch (error) {
    console.error('Erreur dans updateDirector:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du réalisateur' });
  }
};

/**
 * DELETE /api/directors/:id - Supprime un réalisateur
 */
export const deleteDirector = async (req, res) => {
  try {
    const director = await Director.findOne({ id: req.params.id });

    if (!director) {
      return res.status(404).json({ error: 'Réalisateur non trouvé' });
    }

    // Vérifier qu'aucun film ne référence ce réalisateur
    const movieCount = await Movie.countDocuments({ director_id: director.id });

    if (movieCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer ce réalisateur',
        reason: `${movieCount} film(s) sont associés à ce réalisateur`
      });
    }

    await Director.deleteOne({ id: req.params.id });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur dans deleteDirector:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du réalisateur' });
  }
};
