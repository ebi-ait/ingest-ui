import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectComponent} from "@projects/pages/project/project.component";
import {
  UserIsLoggedInGuard,
  UserIsWranglerGuard,
  WranglerOrOwnerGuard
} from "@shared/guards";
import {AllProjectsComponent} from './pages/all-projects/all-projects.component';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {CreateProjectComponent} from './pages/create-project/create-project.component';
import {EditProjectComponent} from './pages/edit-project/edit-project.component';

const routes: Routes = [
  {path: 'projects/register/autofill', component: AutofillProjectFormComponent, canActivate: [UserIsLoggedInGuard]},
  {path: 'projects/register', component: CreateProjectComponent, canActivate: [UserIsLoggedInGuard]},
  {path: 'projects/:uuid/edit', component: EditProjectComponent, canActivate: [UserIsLoggedInGuard, WranglerOrOwnerGuard]},
  {path: 'projects/all', component: AllProjectsComponent, canActivate: [UserIsLoggedInGuard, UserIsWranglerGuard]},
  {path: 'projects/detail/:id', component: ProjectComponent, canActivate: [UserIsLoggedInGuard, WranglerOrOwnerGuard]},
  {path: 'projects/detail', component: ProjectComponent, canActivate: [UserIsLoggedInGuard, WranglerOrOwnerGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
