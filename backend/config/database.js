import mongoose from 'mongoose';

/**
 * Connexion à MongoDB
 * @param {string} uri - URI de connexion MongoDB
 * @returns {Promise} Promesse de connexion
 */
const connectDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB connecté: ${conn.connection.host}`);
    
    // Log des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connecté à MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Erreur de connexion MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose déconnecté de MongoDB');
    });

    // Fermeture propre lors de l'arrêt de l'application
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
