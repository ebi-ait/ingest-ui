import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UserIsWranglerGuard} from '../shared/guards/user-is-wrangler.guard';
import {WranglerOrOwnerGuard} from '../shared/guards/wrangler-or-owner.guard';
import {AllProjectsComponent} from './pages/all-projects/all-projects.component';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {CreateProjectComponent} from './pages/create-project/create-project.component';
import {EditProjectComponent} from './pages/edit-project/edit-project.component';

const routes: Routes = [
  { path: 'register/autofill', component: AutofillProjectFormComponent },
  { path: 'register', component: CreateProjectComponent },
  { path: ':uuid/edit', component: EditProjectComponent, canActivate: [ WranglerOrOwnerGuard ] },
  { path: 'projects/all', component: AllProjectsComponent, canActivate: [UserIsWranglerGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsModule {}
