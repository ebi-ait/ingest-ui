import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';

/** Handle http error response in one place. */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  MAX_RETRIES = 5;
  UNREACHABLE_SERVER = 0;
  CONNECTION_ERROR_CODES = [
    this.UNREACHABLE_SERVER,
    HttpStatusCode.BadGateway,
    HttpStatusCode.ServiceUnavailable,
    HttpStatusCode.GatewayTimeout
  ];

  constructor(private router: Router) {
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(catchError(
      (error: HttpErrorResponse) => {

        if (this.router.url.startsWith('/error')) {
          // already on error page with some api call still throwing error
          return throwError(error);
        }

        if (error.error instanceof ErrorEvent) {
          // client-side or network error
          console.error(error.error);
        } else {
          // server-side/backend service error
          console.error(error.error);
          if (error.status in this.CONNECTION_ERROR_CODES) {
            const params = {
              queryParams: {
                reload: encodeURI(document.location.href)
              }
            };
            this.router.navigate(['/error'], params);
          }
        }

        // throw error as http error code may be needed in certain calls
        return throwError(error);
      }));
  }
}
