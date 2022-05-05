import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequirementsComponent } from './pages/requirements/requirements.component';
import { StepByStepComponent } from './pages/step-by-step/step-by-step.component';
import { AfterSubmissionComponent } from './pages/after-submission/after-submission.component';



@NgModule({
  declarations: [
    RequirementsComponent,
    StepByStepComponent,
    AfterSubmissionComponent
  ],
  imports: [
    CommonModule
  ]
})
export class GuideModule { }
