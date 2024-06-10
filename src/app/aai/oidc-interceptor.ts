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
  // Hardcoded SECURED_ENDPOINTS for troubleshooting
  private readonly SECURED_ENDPOINTS = '\/auth\/.*,\/user\/.*,\/submissionEnvelopes\/?.*,\/projects$';

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
    console.log(`Secured URLs: ${securedUrls}`);
    const matches = securedUrls.filter(pattern => {
      const regex = new RegExp(pattern);
      const isMatch = regex.test(url);
      console.log(`Testing URL: ${url} against pattern: ${pattern} -> Match: ${isMatch}`);
      return regex.test(url);
    });
    console.log(`Matches found: ${matches.length}`);
    return matches.length > 0;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const hostName = OidcInterceptor.getHostName(request.url);

    console.log(`Intercepting request to: ${request.url}`);
    console.log(`Host name: ${hostName}`);
    console.log(`Hard coded SECURED_ENDPOINTS: ${this.SECURED_ENDPOINTS}`);
    console.log('Using environment configuration:', environment);
    console.log(`Env SECURED_ENDPOINTS: ${environment.SECURED_ENDPOINTS}`);
    console.log(`DOMAIN_WHITELIST: ${environment.DOMAIN_WHITELIST}`);
    console.log(`Is URL secured: ${this.isUrlSecured(request.url)}`);
    const urlSecured = this.isUrlSecured(request.url);
    console.log(`Is URL secured: ${urlSecured}`);

    if (hostName && environment.DOMAIN_WHITELIST.indexOf(hostName) > -1 && (request.method !== 'GET' || urlSecured)) {
      return this.aai.userAuthHeader().pipe(
        concatMap(authHeader => {
          console.log(`Retrieved Authorization header: ${authHeader}`);
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
