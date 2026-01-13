import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^mov_\d{3}$/
  },
  titre: {
    type: String,
    required: true
  },
  annee: {
    type: Number,
    required: true,
    min: 1888, // Première année du cinéma
    max: new Date().getFullYear() + 5 // Films à venir
  },
  director_id: {
    type: String,
    required: true,
    match: /^dir_\d{3}$/
  },
  genre_ids: [{
    type: String,
    match: /^gen_\d{3}$/
  }],
  duree: {
    type: Number, // durée en minutes
    min: 1
  },
  synopsis: {
    type: String
  },
  statut: {
    type: String,
    enum: ['a_voir', 'vu', 'en_cours'],
    default: 'a_voir'
  },
  note: {
    type: Number,
    min: 0,
    max: 10
  },
  commentaire: {
    type: String
  },
  affiche_url: {
    type: String
  },
  tmdb_id: {
    type: Number
  },
  tags: [{
    type: String
  }],
  date_ajout: {
    type: Date,
    required: true,
    default: Date.now
  },
  date_visionnage: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index pour recherche et filtres
movieSchema.index({ titre: 'text' }); // Recherche textuelle
movieSchema.index({ annee: 1 });
movieSchema.index({ director_id: 1 });
movieSchema.index({ genre_ids: 1 });
movieSchema.index({ statut: 1 });
movieSchema.index({ note: -1 }); // Tri décroissant par note
movieSchema.index({ date_ajout: -1 });

// Méthode pour vérifier si le film a été vu
movieSchema.methods.isWatched = function() {
  return this.statut === 'vu';
};

// Méthode pour calculer l'âge du film
movieSchema.methods.getAge = function() {
  return new Date().getFullYear() - this.annee;
};

// Méthode statique pour trouver les films par réalisateur
movieSchema.statics.findByDirector = function(directorId) {
  return this.find({ director_id: directorId });
};

// Méthode statique pour trouver les films par genre
movieSchema.statics.findByGenre = function(genreId) {
  return this.find({ genre_ids: genreId });
};

// Méthode statique pour trouver les films à voir
movieSchema.statics.findToWatch = function() {
  return this.find({ statut: 'a_voir' });
};

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
