import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {CoreSecurity} from "./security.module";
import {Account} from "./security.data";

@Injectable({
  providedIn: CoreSecurity,
})
export class AuthenticationService {

  constructor(private http: HttpClient) {}

  private readonly BASE_URL = `${environment.INGEST_API_URL}/auth`;

  getAccount(token: string): Promise<Account> {
    const url = `${this.BASE_URL}/account`;
    return this.http
      .get<Account>(url, {headers: this.authoriseHeader(token)})
      .catch((error: HttpErrorResponse) => {
        return Observable.of(<Account>{});
      }).toPromise();
  }

  register(token: string): Promise<Account> {
    const url = `${this.BASE_URL}/registration`;
    return this.http
      .post<Account>(url, {}, {headers: this.authoriseHeader(token)})
      .catch((error: HttpErrorResponse) => {
        let serviceError = new Error(error.message);
        if ([403, 409].includes(error.status)) {
          serviceError = new DuplicateAccount();
        }
        return Observable.throwError(serviceError);
      }).toPromise();
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