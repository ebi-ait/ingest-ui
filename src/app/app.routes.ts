import {Routes} from '@angular/router';
import {AaiCallbackComponent} from './aai-callback/aai-callback.component';
import {AllProjectsComponent} from './projects/pages/all-projects/all-projects.component';
import {ErrorComponent} from './error/error.component';
import {LoginComponent} from './login/login.component';
import {MyProjectsComponent} from './my-projects/my-projects.component';
import {RegistrationComponent} from './registration/registration.component';
import {UserIsLoggedInGuard} from './shared/guards/user-is-logged-in.guard';
import {UserIsWranglerGuard} from './shared/guards/user-is-wrangler.guard';
import {WranglerOrOwnerGuard} from './shared/guards/wrangler-or-owner.guard';
import {SubmissionListComponent} from './submission-list/submission-list.component';

// eslint-disable-next-line max-len
import {TemplateQuestionnaireFormComponent} from './template-questionnaire/template-questionnaire-form/template-questionnaire-form.component';
import {WelcomeComponent} from './welcome/welcome.component';

export const ROUTES: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'aai-callback', component: AaiCallbackComponent},

  {path: '', component: WelcomeComponent },
  {path: 'home', component: WelcomeComponent},
  {path: 'registration', component: RegistrationComponent, canActivate: [UserIsLoggedInGuard]},
  {path: 'projects', component: MyProjectsComponent, canActivate: [UserIsLoggedInGuard]},

  {
    path: 'projects',
    loadChildren: () =>
      import('./projects/projects.module').then((m) => m.ProjectsModule),
    canActivate: [UserIsLoggedInGuard]
  },
  {
    path: 'submissions',
    loadChildren: () =>
      import('./submission/submission.module').then((m) => m.SubmissionModule),
    canActivate: [UserIsLoggedInGuard]
  },

  {path: 'submissions/list', component: SubmissionListComponent,  canActivate: [UserIsLoggedInGuard, UserIsWranglerGuard]},

  {path: 'template', component: TemplateQuestionnaireFormComponent},

  {path: 'error', component: ErrorComponent},

  {path: '**', redirectTo: ''}
];
