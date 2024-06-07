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
      return regex.test(url);
    });
    return matches.length > 0;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const hostName = OidcInterceptor.getHostName(request.url);

    console.log(`Intercepting request to: ${request.url}`);
    console.log(`Host name: ${hostName}`);
    console.log(`Is URL secured: ${this.isUrlSecured(request.url)}`);

    if (hostName && environment.DOMAIN_WHITELIST.indexOf(hostName) > -1 && (request.method !== 'GET' || this.isUrlSecured(request.url))) {
      return this.aai.userAuthHeader().pipe(
        concatMap(authHeader => {
          const headerRequest = request.clone({
            setHeaders: {
              Authorization: authHeader
            }
          });
          console.log(`Adding Authorization header for: ${request.url}`);
          return next.handle(headerRequest);
        })
      );
    } else {
      console.log(`No Authorization header added for: ${request.url}`);
      return next.handle(request);
    }
  }
}
