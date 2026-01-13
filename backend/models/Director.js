import mongoose from 'mongoose';

const directorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^dir_\d{3}$/
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  date_naissance: {
    type: Date
  },
  nationalite: {
    type: String
  },
  biographie: {
    type: String
  },
  photo_url: {
    type: String
  },
  nombre_films: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index pour recherche rapide
directorSchema.index({ nom: 1, prenom: 1 });

// Méthode virtuelle pour le nom complet
directorSchema.virtual('nom_complet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

// S'assurer que les virtuels sont inclus dans JSON
directorSchema.set('toJSON', { virtuals: true });
directorSchema.set('toObject', { virtuals: true });

const Director = mongoose.model('Director', directorSchema);

export default Director;
