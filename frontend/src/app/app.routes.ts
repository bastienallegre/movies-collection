import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MoviesListComponent } from './components/movies/movies-list.component';
import { MovieDetailComponent } from './components/movies/movie-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'movies', component: MoviesListComponent },
  { path: 'movies/:id', component: MovieDetailComponent },
  { path: '**', redirectTo: '' }
];
