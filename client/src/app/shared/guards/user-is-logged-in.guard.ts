import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AaiSecurity} from '../../aai/aai.module';
import {AaiService} from '../../aai/aai.service';

@Injectable({
  providedIn: AaiSecurity,
})
export class UserIsLoggedInGuard implements CanActivate {

  constructor(private aai: AaiService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.aai.userLoggedIn().pipe(
      map(loggedIn => loggedIn || this.router.parseUrl(`/login?redirect=${encodeURIComponent(state.url)}`))
    );
  }
}
