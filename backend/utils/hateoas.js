/**
 * Utilitaires pour générer les liens HATEOAS
 */

const BASE_URL = '/api';

/**
 * Génère un objet link HATEOAS
 * @param {string} href - L'URL du lien
 * @param {string} method - La méthode HTTP (GET, POST, PUT, DELETE)
 * @param {string} rel - La relation du lien (self, update, delete, etc.)
 * @returns {Object} L'objet link
 */
export function createLink(href, method = 'GET', rel = null) {
  const link = { href, method };
  if (rel) {
    link.rel = rel;
  }
  return link;
}

/**
 * Génère les liens HATEOAS pour un film
 * @param {Object} movie - Le film
 * @returns {Object} Les liens HATEOAS
 */
export function generateMovieLinks(movie) {
  const links = {
    self: createLink(`${BASE_URL}/movies/${movie.id}`, 'GET', 'self'),
    update: createLink(`${BASE_URL}/movies/${movie.id}`, 'PUT', 'update'),
    delete: createLink(`${BASE_URL}/movies/${movie.id}`, 'DELETE', 'delete')
  };

  if (movie.director_id) {
    links.director = createLink(`${BASE_URL}/directors/${movie.director_id}`, 'GET', 'director');
  }

  if (movie.genre_ids && movie.genre_ids.length > 0) {
    links.genres = movie.genre_ids.map(genreId =>
      createLink(`${BASE_URL}/genres/${genreId}`, 'GET', 'genre')
    );
  }

  return links;
}

/**
 * Génère les liens HATEOAS pour un réalisateur
 * @param {Object} director - Le réalisateur
 * @returns {Object} Les liens HATEOAS
 */
export function generateDirectorLinks(director) {
  return {
    self: createLink(`${BASE_URL}/directors/${director.id}`, 'GET', 'self'),
    movies: createLink(`${BASE_URL}/directors/${director.id}/movies`, 'GET', 'movies'),
    update: createLink(`${BASE_URL}/directors/${director.id}`, 'PUT', 'update'),
    delete: createLink(`${BASE_URL}/directors/${director.id}`, 'DELETE', 'delete')
  };
}

/**
 * Génère les liens HATEOAS pour un genre
 * @param {Object} genre - Le genre
 * @returns {Object} Les liens HATEOAS
 */
export function generateGenreLinks(genre) {
  return {
    self: createLink(`${BASE_URL}/genres/${genre.id}`, 'GET', 'self'),
    movies: createLink(`${BASE_URL}/genres/${genre.id}/movies`, 'GET', 'movies'),
    update: createLink(`${BASE_URL}/genres/${genre.id}`, 'PUT', 'update'),
    delete: createLink(`${BASE_URL}/genres/${genre.id}`, 'DELETE', 'delete')
  };
}

/**
 * Génère les liens HATEOAS pour une collection
 * @param {Object} collection - La collection
 * @returns {Object} Les liens HATEOAS
 */
export function generateCollectionLinks(collection) {
  return {
    self: createLink(`${BASE_URL}/collections/${collection.id}`, 'GET', 'self'),
    movies: createLink(`${BASE_URL}/collections/${collection.id}/movies`, 'GET', 'movies'),
    add_movie: createLink(`${BASE_URL}/collections/${collection.id}/movies`, 'POST', 'add_movie'),
    update: createLink(`${BASE_URL}/collections/${collection.id}`, 'PUT', 'update'),
    delete: createLink(`${BASE_URL}/collections/${collection.id}`, 'DELETE', 'delete')
  };
}

/**
 * Génère les liens de pagination
 * @param {string} baseUrl - L'URL de base
 * @param {number} page - La page actuelle
 * @param {number} limit - Nombre d'éléments par page
 * @param {number} total - Nombre total d'éléments
 * @param {Object} queryParams - Paramètres de requête supplémentaires
 * @returns {Object} Les liens de pagination
 */
export function generatePaginationLinks(baseUrl, page, limit, total, queryParams = {}) {
  const totalPages = Math.ceil(total / limit);
  const links = {};

  // Construction de la query string
  const buildUrl = (pageNum) => {
    const params = new URLSearchParams({ page: pageNum, limit, ...queryParams });
    return `${baseUrl}?${params.toString()}`;
  };

  // Self
  links.self = createLink(buildUrl(page), 'GET', 'self');

  // First
  links.first = createLink(buildUrl(0), 'GET', 'first');

  // Previous
  if (page > 0) {
    links.prev = createLink(buildUrl(page - 1), 'GET', 'prev');
  }

  // Next
  if (page < totalPages - 1) {
    links.next = createLink(buildUrl(page + 1), 'GET', 'next');
  }

  // Last
  links.last = createLink(buildUrl(totalPages - 1), 'GET', 'last');

  return links;
}

/**
 * Génère les liens pour les statistiques
 * @returns {Object} Les liens HATEOAS
 */
export function generateStatsLinks() {
  return {
    self: createLink(`${BASE_URL}/stats`, 'GET', 'self'),
    movies: createLink(`${BASE_URL}/movies`, 'GET', 'movies'),
    directors: createLink(`${BASE_URL}/directors`, 'GET', 'directors'),
    genres: createLink(`${BASE_URL}/genres`, 'GET', 'genres'),
    collections: createLink(`${BASE_URL}/collections`, 'GET', 'collections')
  };
}

export default {
  createLink,
  generateMovieLinks,
  generateDirectorLinks,
  generateGenreLinks,
  generateCollectionLinks,
  generatePaginationLinks,
  generateStatsLinks
};
