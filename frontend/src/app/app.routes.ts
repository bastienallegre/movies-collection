import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MoviesListComponent } from './components/movies/movies-list.component';
import { MovieDetailComponent } from './components/movies/movie-detail.component';
import { MovieFormComponent } from './components/movies/movie-form.component';
import { DirectorsListComponent } from './components/directors/directors-list.component';
import { DirectorFormComponent } from './components/directors/director-form.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  
  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Movies
  { path: 'movies', component: MoviesListComponent },
  { path: 'movies/new', component: MovieFormComponent },
  { path: 'movies/:id/edit', component: MovieFormComponent },
  { path: 'movies/:id', component: MovieDetailComponent },
  
  // Directors
  { path: 'directors', component: DirectorsListComponent },
  { path: 'directors/new', component: DirectorFormComponent },
  { path: 'directors/:id/edit', component: DirectorFormComponent },
  
  { path: '**', redirectTo: '' }
];
