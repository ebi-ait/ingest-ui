import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WranglerOrOwnerGuard} from '../shared/guards/wrangler-or-owner.guard';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {CreateProjectComponent} from './pages/create-project/create-project.component';
import {EditProjectComponent} from './pages/edit-project/edit-project.component';

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
