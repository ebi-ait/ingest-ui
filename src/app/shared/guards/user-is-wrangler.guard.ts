import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AaiSecurity} from '../../aai/aai.module';
import {Account} from '../../core/account';
import {AlertService} from '../services/alert.service';
import {IngestService} from '../services/ingest.service';

@Injectable({
  providedIn: AaiSecurity,
})
export class UserIsWranglerGuard implements CanActivate {

  constructor(private ingestService: IngestService, private alertService: AlertService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.ingestService.getUserAccount()
      .pipe(
        map((account: Account) => account.isWrangler() || this.accessDenied(state.url)),
        // catchError(err => of(false))
      );
  }

  private accessDenied(url: string): UrlTree {
    this.alertService.error('Access Denied', `You cannot access the resource: ${url}`, true, true);
    return this.router.parseUrl('/home');
  }

}
