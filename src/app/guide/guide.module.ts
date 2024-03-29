import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {GuideRoutingModule} from "@app/guide/guide-routing.module";
import {MaterialModule} from "@app/material.module";
import {DataSubmissionGuideComponent} from './pages/data-submission-guide/data-submission-guide.component';


@NgModule({
  declarations: [
    DataSubmissionGuideComponent
  ],
  imports: [
    CommonModule,
    GuideRoutingModule,
    MaterialModule,
    MatExpansionModule,
    MatIconModule
  ]
})
export class GuideModule { }
