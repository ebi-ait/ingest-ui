import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {EditProjectComponent} from './pages/edit-project/edit-project.component';
import {CreateProjectComponent} from './pages/create-project/create-project.component';

const routes: Routes = [
  { path: 'register', component: AutofillProjectFormComponent },
  { path: ':uuid/edit/:tab', component: EditProjectComponent },
  { path: 'edit', component: CreateProjectComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectCreateEditRoutingModule {}
