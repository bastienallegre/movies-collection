#!/usr/bin/env node

/**
 * Script de visualisation de la structure de données
 * Affiche un résumé des données et vérifie leur cohérence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les données
const directors = JSON.parse(fs.readFileSync(path.join(__dirname, 'directors.json'), 'utf8'));
const genres = JSON.parse(fs.readFileSync(path.join(__dirname, 'genres.json'), 'utf8'));
const collections = JSON.parse(fs.readFileSync(path.join(__dirname, 'collections.json'), 'utf8'));
const movies = JSON.parse(fs.readFileSync(path.join(__dirname, 'movies_v2.json'), 'utf8'));

console.log('═══════════════════════════════════════════════════════');
console.log('    MOVIES COLLECTION - STRUCTURE DE DONNÉES V2.0');
console.log('═══════════════════════════════════════════════════════\n');

// Statistiques globales
console.log(' STATISTIQUES GLOBALES\n');
console.log(`   Total de films        : ${movies.length}`);
console.log(`   Total de réalisateurs : ${directors.length}`);
console.log(`   Total de genres       : ${genres.length}`);
console.log(`   Total de collections  : ${collections.length}\n`);

// Statistiques des films
const moviesVus = movies.filter(m => m.statut === 'vu').length;
const moviesAVoir = movies.filter(m => m.statut === 'a_voir').length;
const moviesEnCours = movies.filter(m => m.statut === 'en_cours').length;

console.log(' STATUT DES FILMS\n');
console.log(`    Vus       : ${moviesVus} (${Math.round(moviesVus/movies.length*100)}%)`);
console.log(`    À voir    : ${moviesAVoir} (${Math.round(moviesAVoir/movies.length*100)}%)`);
console.log(`    En cours  : ${moviesEnCours} (${Math.round(moviesEnCours/movies.length*100)}%)\n`);

// Notes moyennes
const moviesAvecNote = movies.filter(m => m.note);
const noteMoyenne = moviesAvecNote.reduce((sum, m) => sum + m.note, 0) / moviesAvecNote.length;
console.log(` NOTE MOYENNE : ${noteMoyenne.toFixed(2)}/10 (sur ${moviesAvecNote.length} films notés)\n`);

// Top réalisateurs
console.log(' TOP RÉALISATEURS\n');
const directorStats = {};
movies.forEach(movie => {
  directorStats[movie.director_id] = (directorStats[movie.director_id] || 0) + 1;
});

const topDirectors = Object.entries(directorStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

topDirectors.forEach(([dirId, count]) => {
  const director = directors.find(d => d.id === dirId);
  if (director) {
    console.log(`   ${count} film(s) - ${director.prenom} ${director.nom}`);
  }
});
console.log();

// Top genres
console.log(' TOP GENRES\n');
const genreStats = {};
movies.forEach(movie => {
  movie.genre_ids.forEach(genreId => {
    genreStats[genreId] = (genreStats[genreId] || 0) + 1;
  });
});

const topGenres = Object.entries(genreStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

topGenres.forEach(([genId, count]) => {
  const genre = genres.find(g => g.id === genId);
  if (genre) {
    console.log(`   ${count} film(s) - ${genre.nom}`);
  }
});
console.log();

// Collections
console.log(' COLLECTIONS\n');
collections.forEach(col => {
  const visibility = col.is_public ? ' Public' : ' Privé';
  console.log(`   ${visibility} - ${col.nom} (${col.nombre_films} films)`);
});
console.log();

// Durée totale de visionnage
const dureeTotal = movies
  .filter(m => m.statut === 'vu' && m.duree)
  .reduce((sum, m) => sum + m.duree, 0);
const heures = Math.floor(dureeTotal / 60);
const minutes = dureeTotal % 60;
console.log(`  TEMPS DE VISIONNAGE TOTAL : ${dureeTotal} minutes (${heures}h${minutes})\n`);

// Validation de l'intégrité des données
console.log('═══════════════════════════════════════════════════════');
console.log(' VALIDATION DE L\'INTÉGRITÉ DES DONNÉES\n');

let errors = 0;

// Vérifier que tous les director_id existent
movies.forEach(movie => {
  const director = directors.find(d => d.id === movie.director_id);
  if (!director) {
    console.log(`    Film "${movie.titre}" : réalisateur ${movie.director_id} introuvable`);
    errors++;
  }
});

// Vérifier que tous les genre_ids existent
movies.forEach(movie => {
  movie.genre_ids.forEach(genreId => {
    const genre = genres.find(g => g.id === genreId);
    if (!genre) {
      console.log(`    Film "${movie.titre}" : genre ${genreId} introuvable`);
      errors++;
    }
  });
});

// Vérifier que tous les movie_ids dans les collections existent
collections.forEach(collection => {
  collection.movie_ids.forEach(movieId => {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
      console.log(`    Collection "${collection.nom}" : film ${movieId} introuvable`);
      errors++;
    }
  });
});

// Vérifier les IDs uniques
const movieIds = movies.map(m => m.id);
if (new Set(movieIds).size !== movieIds.length) {
  console.log('    Doublons détectés dans les IDs de films');
  errors++;
}

const directorIds = directors.map(d => d.id);
if (new Set(directorIds).size !== directorIds.length) {
  console.log('    Doublons détectés dans les IDs de réalisateurs');
  errors++;
}

const genreIds = genres.map(g => g.id);
if (new Set(genreIds).size !== genreIds.length) {
  console.log('    Doublons détectés dans les IDs de genres');
  errors++;
}

if (errors === 0) {
  console.log('    Toutes les vérifications sont passées avec succès !');
  console.log('    Les relations entre les entités sont cohérentes');
  console.log('    Aucun doublon d\'ID détecté');
}

console.log('\n═══════════════════════════════════════════════════════');
console.log(`📁 Fichiers générés dans : ${__dirname}`);
console.log('═══════════════════════════════════════════════════════\n');

process.exit(errors > 0 ? 1 : 0);
