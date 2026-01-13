import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^gen_\d{3}$/
  },
  nom: {
    type: String,
    required: true,
    unique: true
  },
  description: {
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
genreSchema.index({ nom: 1 });

const Genre = mongoose.model('Genre', genreSchema);

export default Genre;
