import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^col_\d{3}$/
  },
  nom: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  is_public: {
    type: Boolean,
    default: false
  },
  date_creation: {
    type: Date,
    required: true,
    default: Date.now
  },
  nombre_films: {
    type: Number,
    default: 0
  },
  movie_ids: [{
    type: String,
    match: /^mov_\d{3}$/
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Index pour recherche rapide
collectionSchema.index({ nom: 1 });
collectionSchema.index({ is_public: 1 });

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
