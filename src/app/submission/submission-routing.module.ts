import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UserIsLoggedInGuard, WranglerOrOwnerGuard} from "@shared/guards";
import {SubmissionComponent} from "./pages/submission.component";

const routes: Routes = [
  {path: 'submissions/detail', component: SubmissionComponent,  canActivate: [UserIsLoggedInGuard, WranglerOrOwnerGuard]},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubmissionRoutingModule {}
