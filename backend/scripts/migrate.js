import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import { Movie, Director, Genre, Collection } from '../models/index.js';

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Lire un fichier JSON
 */
const readJSONFile = (filename) => {
  const filePath = path.join(__dirname, '../data', filename);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filename}:`, error.message);
    return [];
  }
};

/**
 * Migration des réalisateurs
 */
const migrateDirectors = async () => {
  console.log('\nMigration des réalisateurs...');
  const directors = readJSONFile('directors.json');
  
  if (directors.length === 0) {
    console.log('Aucun réalisateur à migrer');
    return;
  }

  try {
    // Supprimer les données existantes
    await Director.deleteMany({});
    console.log('Données existantes supprimées');

    // Insérer les nouveaux réalisateurs
    const result = await Director.insertMany(directors);
    console.log(`${result.length} réalisateurs migrés avec succès`);
  } catch (error) {
    console.error('Erreur lors de la migration des réalisateurs:', error.message);
    throw error;
  }
};

/**
 * Migration des genres
 */
const migrateGenres = async () => {
  console.log('\nMigration des genres...');
  const genres = readJSONFile('genres.json');
  
  if (genres.length === 0) {
    console.log('Aucun genre à migrer');
    return;
  }

  try {
    // Supprimer les données existantes
    await Genre.deleteMany({});
    console.log('Données existantes supprimées');

    // Insérer les nouveaux genres
    const result = await Genre.insertMany(genres);
    console.log(`${result.length} genres migrés avec succès`);
  } catch (error) {
    console.error('Erreur lors de la migration des genres:', error.message);
    throw error;
  }
};

/**
 * Migration des collections
 */
const migrateCollections = async () => {
  console.log('\nMigration des collections...');
  const collections = readJSONFile('collections.json');
  
  if (collections.length === 0) {
    console.log('Aucune collection à migrer');
    return;
  }

  try {
    // Supprimer les données existantes
    await Collection.deleteMany({});
    console.log('Données existantes supprimées');

    // Insérer les nouvelles collections
    const result = await Collection.insertMany(collections);
    console.log(`${result.length} collections migrées avec succès`);
  } catch (error) {
    console.error('Erreur lors de la migration des collections:', error.message);
    throw error;
  }
};

/**
 * Migration des films
 */
const migrateMovies = async () => {
  console.log('\nMigration des films...');
  const movies = readJSONFile('movies.json');
  
  if (movies.length === 0) {
    console.log('Aucun film à migrer');
    return;
  }

  try {
    // Supprimer les données existantes
    await Movie.deleteMany({});
    console.log('Données existantes supprimées');

    // Insérer les nouveaux films
    const result = await Movie.insertMany(movies);
    console.log(`${result.length} films migrés avec succès`);
  } catch (error) {
    console.error('Erreur lors de la migration des films:', error.message);
    throw error;
  }
};

/**
 * Vérifier l'intégrité des données après migration
 */
const verifyData = async () => {
  console.log('\nVérification de l\'intégrité des données...');
  
  try {
    const directorsCount = await Director.countDocuments();
    const genresCount = await Genre.countDocuments();
    const collectionsCount = await Collection.countDocuments();
    const moviesCount = await Movie.countDocuments();

    console.log('\nStatistiques de la base de données:');
    console.log(`   • Réalisateurs: ${directorsCount}`);
    console.log(`   • Genres: ${genresCount}`);
    console.log(`   • Collections: ${collectionsCount}`);
    console.log(`   • Films: ${moviesCount}`);

    // Vérifier les relations
    console.log('\nVérification des relations...');
    
    const movies = await Movie.find();
    let orphanDirectors = 0;
    let orphanGenres = 0;

    for (const movie of movies) {
      // Vérifier que le réalisateur existe
      const director = await Director.findOne({ id: movie.director_id });
      if (!director) {
        console.warn(`Film "${movie.titre}" (${movie.id}) référence un réalisateur inexistant: ${movie.director_id}`);
        orphanDirectors++;
      }

      // Vérifier que tous les genres existent
      for (const genreId of movie.genre_ids) {
        const genre = await Genre.findOne({ id: genreId });
        if (!genre) {
          console.warn(`Film "${movie.titre}" (${movie.id}) référence un genre inexistant: ${genreId}`);
          orphanGenres++;
        }
      }
    }

    if (orphanDirectors === 0 && orphanGenres === 0) {
      console.log('Toutes les relations sont valides');
    } else {
      console.log(`Problèmes détectés: ${orphanDirectors} réalisateurs orphelins, ${orphanGenres} genres orphelins`);
    }

    // Afficher quelques exemples
    console.log('\nExemples de films migrés:');
    const sampleMovies = await Movie.find().limit(3);
    sampleMovies.forEach(movie => {
      console.log(`   • ${movie.titre} (${movie.annee}) - ${movie.statut}`);
    });

  } catch (error) {
    console.error('Erreur lors de la vérification:', error.message);
  }
};

/**
 * Script principal de migration
 */
const migrate = async () => {
  console.log('Démarrage de la migration des données vers MongoDB\n');
  console.log('═'.repeat(60));

  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movies_db';
    console.log(`Connexion à MongoDB: ${mongoUri}`);
    await connectDB(mongoUri);

    // Migration dans l'ordre (pour respecter les relations)
    await migrateDirectors();
    await migrateGenres();
    await migrateCollections();
    await migrateMovies();

    // Vérification
    await verifyData();

    console.log('\n' + '═'.repeat(60));
    console.log('Migration terminée avec succès!');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('\n' + '═'.repeat(60));
    console.error('Échec de la migration:', error.message);
    console.error('═'.repeat(60) + '\n');
    process.exit(1);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée\n');
  }
};

// Exécuter la migration
migrate();
