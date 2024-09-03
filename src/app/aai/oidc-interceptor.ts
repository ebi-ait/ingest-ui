import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {Observable} from 'rxjs';
import {concatMap} from 'rxjs/operators';
import {AaiSecurity} from './aai.module';
import {AaiService} from './aai.service';

@Injectable({
  providedIn: AaiSecurity,
})
export class OidcInterceptor implements HttpInterceptor {
  constructor(private aai: AaiService) {
  }

  private static getHostName(url: string): string {
    let hostName;
    try {
      hostName = (new URL(url)).hostname;
    } catch (e) {
      // TypeError non URL requests (e.g. file system access)
      console.log(e);
    }
    return hostName;
  }

  private isUrlSecured(url) {
    const securedUrls = environment.SECURED_ENDPOINTS.split(',');
    const matches = securedUrls.filter(pattern => {
      const regex = new RegExp(pattern);
      const isMatch = regex.test(url);
      return isMatch;
    });
    return matches.length > 0;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const hostName = OidcInterceptor.getHostName(request.url);
    const urlSecured = this.isUrlSecured(request.url);

    if (hostName && environment.DOMAIN_WHITELIST.indexOf(hostName) > -1 && (request.method !== 'GET' || urlSecured)) {
      return this.aai.userAuthHeader().pipe(
        concatMap(authHeader => {
          const headerRequest = request.clone({
            setHeaders: {
              Authorization: authHeader
            }
          });
          return next.handle(headerRequest);
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
