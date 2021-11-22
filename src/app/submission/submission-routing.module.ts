import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SubmissionComponent} from "./pages/submission.component";
import {WranglerOrOwnerGuard} from '@shared/guards/wrangler-or-owner.guard';

const routes: Routes = [
  {path: 'submissions/detail', component: SubmissionComponent,  canActivate: [WranglerOrOwnerGuard]},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubmissionRoutingModule {}
