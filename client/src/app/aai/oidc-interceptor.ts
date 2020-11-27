import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AaiService} from './aai.service';
import {AaiSecurity} from './aai.module';
import {Observable} from 'rxjs';
import {concatMap} from 'rxjs/operators';

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
    const securedUrls = environment.SECURED_ENDPOINTS;
    const matches = securedUrls.filter(securedUrl => url.match(securedUrl));
    return matches.length > 0;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const hostName = OidcInterceptor.getHostName(request.url);

    if (hostName && environment.DOMAIN_WHITELIST.indexOf(hostName) > -1 && (request.method !== 'GET' || this.isUrlSecured(request.url))) {
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
