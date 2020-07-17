import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {FeatureFlagService} from "./feature-flag.service";

@Injectable()
export class FeatureFlagGuard implements CanActivate{

  constructor(private service: FeatureFlagService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    const featureFlag: string = route.data ? route.data['featureFlag'] : null;
    return featureFlag != null ? this.service.isEnabled(featureFlag) : true;
  }

}
