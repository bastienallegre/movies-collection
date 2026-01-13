import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import { Movie, Director, Genre, Collection } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Script pour nettoyer la base de données
 */
const cleanDatabase = async () => {
  console.log('🧹 Nettoyage de la base de données...\n');
  console.log('═'.repeat(60));

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movies_db';
    console.log(`📡 Connexion à MongoDB: ${mongoUri}`);
    await connectDB(mongoUri);

    // Compter avant suppression
    const beforeCounts = {
      movies: await Movie.countDocuments(),
      directors: await Director.countDocuments(),
      genres: await Genre.countDocuments(),
      collections: await Collection.countDocuments()
    };

    console.log('\nAvant nettoyage:');
    console.log(`   • Films: ${beforeCounts.movies}`);
    console.log(`   • Réalisateurs: ${beforeCounts.directors}`);
    console.log(`   • Genres: ${beforeCounts.genres}`);
    console.log(`   • Collections: ${beforeCounts.collections}`);

    // Supprimer toutes les données
    console.log('\nSuppression en cours...');
    await Movie.deleteMany({});
    await Director.deleteMany({});
    await Genre.deleteMany({});
    await Collection.deleteMany({});

    console.log('Toutes les données ont été supprimées');

    console.log('\n' + '═'.repeat(60));
    console.log('Nettoyage terminé!');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('\nErreur lors du nettoyage:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée\n');
  }
};

// Exécuter le nettoyage
cleanDatabase();
