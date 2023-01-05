import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {AlertService} from "@shared/services/alert.service";
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AaiSecurity} from '../../aai/aai.module';
import {AaiService} from '../../aai/aai.service';

@Injectable({
  providedIn: AaiSecurity,
})
export class UserIsLoggedInGuard implements CanActivate {

  constructor(private aai: AaiService, private alertService: AlertService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.aai.userLoggedIn().pipe(
      map(loggedIn => loggedIn || this.loginRequired(state.url)),
      catchError(err => of(false))
    );
  }

  private loginRequired(url: string): UrlTree {
    this.alertService.error('Login Required', `Please login to view: ${url}`, true, true);
    return this.router.parseUrl(`/login?redirect=${encodeURIComponent(url)}`);
  }
}
