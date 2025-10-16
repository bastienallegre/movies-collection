import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins vers les fichiers de données
const DATA_DIR = path.join(__dirname, '../data');
const FILES = {
  movies: path.join(DATA_DIR, 'movies.json'),
  directors: path.join(DATA_DIR, 'directors.json'),
  genres: path.join(DATA_DIR, 'genres.json'),
  collections: path.join(DATA_DIR, 'collections.json')
};

/**
 * Lit les données depuis un fichier JSON
 * @param {string} filename - Nom du fichier (movies, directors, genres, collections)
 * @returns {Array} Les données du fichier
 */
export function readData(filename) {
  try {
    const filePath = FILES[filename];
    if (!filePath) {
      throw new Error(`Fichier inconnu: ${filename}`);
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filename}:`, error.message);
    return [];
  }
}

/**
 * Écrit les données dans un fichier JSON
 * @param {string} filename - Nom du fichier (movies, directors, genres, collections)
 * @param {Array} data - Les données à écrire
 * @returns {boolean} True si succès, false sinon
 */
export function writeData(filename, data) {
  try {
    const filePath = FILES[filename];
    if (!filePath) {
      throw new Error(`Fichier inconnu: ${filename}`);
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'écriture de ${filename}:`, error.message);
    return false;
  }
}

/**
 * Génère un nouvel ID unique pour une entité
 * @param {string} prefix - Préfixe de l'ID (mov, dir, gen, col)
 * @param {Array} existingData - Données existantes pour vérifier l'unicité
 * @returns {string} Le nouvel ID
 */
export function generateId(prefix, existingData) {
  const existingIds = existingData.map(item => item.id);
  let counter = 1;
  let newId;
  
  do {
    newId = `${prefix}_${String(counter).padStart(3, '0')}`;
    counter++;
  } while (existingIds.includes(newId));
  
  return newId;
}

/**
 * Trouve un élément par son ID
 * @param {Array} data - Les données
 * @param {string} id - L'ID à rechercher
 * @returns {Object|null} L'élément trouvé ou null
 */
export function findById(data, id) {
  return data.find(item => item.id === id) || null;
}

/**
 * Trouve l'index d'un élément par son ID
 * @param {Array} data - Les données
 * @param {string} id - L'ID à rechercher
 * @returns {number} L'index de l'élément ou -1 si non trouvé
 */
export function findIndexById(data, id) {
  return data.findIndex(item => item.id === id);
}

/**
 * Vérifie si un ID existe dans un dataset
 * @param {string} filename - Nom du fichier (movies, directors, genres, collections)
 * @param {string} id - L'ID à vérifier
 * @returns {boolean} True si l'ID existe
 */
export function idExists(filename, id) {
  const data = readData(filename);
  return data.some(item => item.id === id);
}

/**
 * Met à jour le compteur nombre_films pour un réalisateur
 * @param {string} directorId - L'ID du réalisateur
 */
export function updateDirectorMovieCount(directorId) {
  const directors = readData('directors');
  const movies = readData('movies');
  
  const directorIndex = findIndexById(directors, directorId);
  if (directorIndex !== -1) {
    const count = movies.filter(m => m.director_id === directorId).length;
    directors[directorIndex].nombre_films = count;
    writeData('directors', directors);
  }
}

/**
 * Met à jour le compteur nombre_films pour un genre
 * @param {string} genreId - L'ID du genre
 */
export function updateGenreMovieCount(genreId) {
  const genres = readData('genres');
  const movies = readData('movies');
  
  const genreIndex = findIndexById(genres, genreId);
  if (genreIndex !== -1) {
    const count = movies.filter(m => 
      m.genre_ids && m.genre_ids.includes(genreId)
    ).length;
    genres[genreIndex].nombre_films = count;
    writeData('genres', genres);
  }
}

/**
 * Met à jour le compteur nombre_films pour une collection
 * @param {string} collectionId - L'ID de la collection
 */
export function updateCollectionMovieCount(collectionId) {
  const collections = readData('collections');
  
  const collectionIndex = findIndexById(collections, collectionId);
  if (collectionIndex !== -1) {
    const collection = collections[collectionIndex];
    collection.nombre_films = collection.movie_ids ? collection.movie_ids.length : 0;
    writeData('collections', collections);
  }
}

/**
 * Met à jour tous les compteurs (directors, genres, collections)
 */
export function updateAllCounts() {
  const directors = readData('directors');
  const genres = readData('genres');
  const collections = readData('collections');
  
  directors.forEach(dir => updateDirectorMovieCount(dir.id));
  genres.forEach(genre => updateGenreMovieCount(genre.id));
  collections.forEach(col => updateCollectionMovieCount(col.id));
}

export default {
  readData,
  writeData,
  generateId,
  findById,
  findIndexById,
  idExists,
  updateDirectorMovieCount,
  updateGenreMovieCount,
  updateCollectionMovieCount,
  updateAllCounts
};
