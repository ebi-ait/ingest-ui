import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) {}

  private readonly BASE_URL = `${environment.INGEST_API_URL}/auth`;

  getAccount(token: string): Observable<any> {
    const url = `${this.BASE_URL}/account`;
    return this.http
      .get(url, {headers: this.authoriseHeader(token)})
      .catch((error: HttpErrorResponse) => {
        return Observable.of({});
      });
  }

  register(token: string): Observable<any> {
    const url = `${this.BASE_URL}/registration`;
    return this.http
      .post(url, {}, {headers: this.authoriseHeader(token)})
      .catch((error: HttpErrorResponse) => {
        return Observable.throwError(new DuplicateAccount());
      });
  }

  private authoriseHeader(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

}

export class DuplicateAccount implements Error {

  readonly name: string = 'DuplicateAccount';
  readonly message: string = 'Operation failed due to duplicate Accounts.';

}
