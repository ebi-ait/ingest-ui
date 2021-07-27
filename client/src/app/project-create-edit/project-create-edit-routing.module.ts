import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {EditProjectComponent} from './pages/edit-project/edit-project.component';
import {CreateProjectComponent} from './pages/create-project/create-project.component';
import {WranglerOrOwnerGuard} from '../shared/guards/wrangler-or-owner.guard';

const routes: Routes = [
  { path: 'register/autofill', component: AutofillProjectFormComponent },
  { path: 'register', component: CreateProjectComponent },
  { path: ':uuid/edit', component: EditProjectComponent, canActivate: [ WranglerOrOwnerGuard ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectCreateEditRoutingModule {}
