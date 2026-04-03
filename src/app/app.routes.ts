import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { ArticlesComponent } from './components/pages/articles/articles.component';
import { TipsComponent } from './components/pages/tips/tips.component';
import { ToolsComponent } from './components/pages/tools/tools.component';
import { TermsComponent } from './components/pages/terms/terms.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { ServerErrorComponent } from './components/error/server-error/server-error.component';
import { TextDiffComponent } from './components/pages/tools/text-diff/text-diff.component';
import { JsonPrettifierComponent } from './components/pages/tools/json-prettifier/json-prettifier.component';
import { SqlPocoComponent } from './components/pages/tools/sql-poco/sql-poco.component';
import { SqlDiagramComponent } from './components/pages/tools/sql-diagram/sql-diagram.component';
import { FreeApiComponent } from './components/pages/tools/free-api/free-api.component';
import { MdPdfConvertorComponent } from './components/pages/tools/md-pdf-convertor/md-pdf-convertor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'tips', component: TipsComponent },
  { path: 'tools', component: ToolsComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'error', component: ServerErrorComponent },
  { path: '404', component: NotFoundComponent },
  { path: 'text-diff', component: TextDiffComponent },
  { path: 'json-prettifier', component: JsonPrettifierComponent },
  { path: 'sql-poco', component: SqlPocoComponent },
  { path: 'sql-diagram', component: SqlDiagramComponent},
  { path: 'free-api', component: FreeApiComponent },
  { path: 'md-pdf-convertor', component: MdPdfConvertorComponent },
  { path: '**', redirectTo: '404' }
];
