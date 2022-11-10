import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DataSubmissionGuideComponent} from "@app/guide/pages/data-submission-guide/data-submission-guide.component";

const routes: Routes = [
  { path: '', component: DataSubmissionGuideComponent },
  { path: ':page', component: DataSubmissionGuideComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuideRoutingModule {}
