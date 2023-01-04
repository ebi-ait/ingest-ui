import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AaiSecurity} from '../../aai/aai.module';
import {Project} from '../models/project';
import {AlertService} from '../services/alert.service';
import {AuthService} from '../services/auth.service';
import {IngestService} from '../services/ingest.service';

@Injectable({
  providedIn: AaiSecurity,
})
export class WranglerOrOwnerGuard implements CanActivate {

  constructor(private ingestService: IngestService,
              private alertService: AlertService,
              private authService: AuthService,
              private router: Router) {
  }

  // TODO restriction to view project should be implemented in Ingest API
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    let getProject: Observable<Project>;
    const params = {...route.queryParams, ...route.params};
    if (route.url.map(url => url.path).includes('projects') && params.hasOwnProperty('uuid')) {
      getProject = this.ingestService.getProjectByUuid(params.uuid);
    } else if (route.url.map(url => url.path).includes('projects') && params.hasOwnProperty('id')) {
      getProject = this.ingestService.getProject(params.id);
    } else if (route.url.map(url => url.path).includes('submissions') && (params.hasOwnProperty('project'))) {
      getProject = this.ingestService.getProjectByUuid(params.project);
    } else if (route.url.map(url => url.path).includes('submissions') && (params.hasOwnProperty('uuid'))) {
      getProject = this.ingestService.getSubmissionProjectByUuid(params.uuid)
    }
    return ( getProject ?
      this.authService.isWranglerOrOwner(this.ingestService.getUserAccount(), getProject) :
      this.authService.isWrangler(this.ingestService.getUserAccount())
    ).pipe(
      map(access => access || this.accessDenied(state.url)),
      catchError(err => of(this.unexpectedError(state.url, err)))
    );
  }

  private accessDenied(url: string): UrlTree {
    this.alertService.error('Access Denied', `You cannot access the resource: ${url}`, true, true);
    return this.router.parseUrl(`/login?redirect=${encodeURIComponent(url)}`);
  }

  private unexpectedError(url: string, error: string|any): UrlTree {
    let errorMessage :String = error?.error?.message || error;
    this.alertService.error('Error checking access', `You cannot access the resource: ${url} due to error: ${errorMessage}`, true, true);
    return this.router.parseUrl('/home');
  }
}
