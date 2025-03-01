import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { ArticlesComponent } from './components/pages/articles/articles.component';
import { TipsComponent } from './components/pages/tips/tips.component';
import { ToolsComponent } from './components/pages/tools/tools.component';
import { TermsComponent } from './components/pages/terms/terms.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { ServerErrorComponent } from './components/error/server-error/server-error.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'tips', component: TipsComponent },
  { path: 'tools', component: ToolsComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'error', component: ServerErrorComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' }
];