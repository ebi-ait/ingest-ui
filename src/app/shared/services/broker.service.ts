import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse, HttpStatusCode} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError, map, tap, timeout} from 'rxjs/operators';
import {environment} from '@environments/environment';
import {
  TemplateGenerationRequestParam,
  TemplateGenerationResponse
} from '@app/template-questionnaire/template-generator.service';
import {UploadResults} from '../models/uploadResults';

@Injectable()
export class BrokerService {

  API_URL: string = environment.BROKER_API_URL;
  DOWNLOAD_SPREADSHEET_TIMEOUT = 10 * 60 * 1000; // 10 mins

  constructor(private http: HttpClient) {
  }

  uploadSpreadsheet(formData): Observable<UploadResults> {
    return this.http.post<UploadResults>(`${this.API_URL}/api_upload`, formData)
      .pipe(
        tap(data => console.log('server data:', data)),
        catchError(this.handleError('uploadSpreadsheet'))
      );
  }

  downloadSpreadsheet(submissionUuid): Observable<any> {
    return this.http
      .get(`${this.API_URL}/submissions/${submissionUuid}/spreadsheet`,
        {observe: 'response', responseType: 'blob'})
      .pipe(timeout(this.DOWNLOAD_SPREADSHEET_TIMEOUT),
        map(response => {
          if (response.status === HttpStatusCode.Ok) {
            return this.getFileDataFromResponse(response);
          } else if (response.status === HttpStatusCode.Accepted) {
            throwError(new Error("The spreadsheet is not yet available and still being generated."))
          }
        }));
  }

  generateSpreadsheetFromSubmission(submissionUuid) {
    return this.http.post(`${this.API_URL}/submissions/${submissionUuid}/spreadsheet`, null);
  }

  generateTemplate(spec: TemplateGenerationRequestParam): Observable<TemplateGenerationResponse> {
    const url = `${this.API_URL}/spreadsheets`;
    return this.http.post<TemplateGenerationResponse>(url, spec);
  }

  downloadTemplate(relativeUrl: string): Observable<HttpResponse<Blob>> {
    const url = `${this.API_URL}${relativeUrl}`;
    return this.http.get(url, {responseType: 'blob', observe: 'response'});
  }

  getDereferencedSchema(schemaUrl: string) {
    const url = `${this.API_URL}/schemas?url=${schemaUrl}&json&deref`;
    return this.http.get(url);
  }

  private handleError(operation: any) {
    return (err: any) => {
      const errMsg = `error in ${operation}()`;
      console.log(`${errMsg}:`, err);

      const httpError = {
        message: 'An error occurred in uploading spreadsheet',
        details: `${err.name}: ${err.message}`
      };

      const error = err.error && err.error.message && err.error.details ? err.error : httpError;
      return throwError(error);
    };
  }

  importProjectUsingGeo(accession: string): Observable<{ project_uuid: string }> {
    const params = {
      'accession': accession,
    };
    return this.http
      .post<{ project_uuid: string }>(`${this.API_URL}/import-geo-project`, null, {params})
      .pipe(
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        })
      )
  }

  downloadSpreadsheetUsingGeo(geoAccession: string): Observable<any> {
    const params = {
      'accession': geoAccession,
    };
    return this.http
      .post(`${this.API_URL}/import-geo`, null,
        {params, responseType: 'blob', observe: 'response'})
      .pipe(
        catchError(this.parseErrorBlob),
        map(response => {
          if (response.status == HttpStatusCode.Ok) {
            return this.getFileDataFromResponse(response);
          }
        })
      );
  }

  parseErrorBlob(err: HttpErrorResponse): Observable<any> {
    const reader: FileReader = new FileReader();
    reader.readAsText(err.error);
    const obs = new Observable((observer: any) => {
      reader.onloadend = (e) => {
        observer.error(JSON.parse(reader.result as string));
        observer.complete();
      }
    });
    return obs;
  }

  private getFileDataFromResponse(response: HttpResponse<Blob>) {
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
    return {
      'data': response.body,
      'filename': filename
    };
  }

  convertToSCEA(spreadsheet: any, project_uuid: string, accession_num: number, curators: any,
                experiment_type: string, experimental_factors: any, public_release_date: string,
                hca_update_date: string, study: string, output_dir: string, zip_format: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('spreadsheet', spreadsheet);
    params = params.set('project_uuid', project_uuid);
    params = params.set('accession_number', accession_num);
    params = params.set('curators', curators);
    params = params.set('experiment_type', experiment_type);
    params = params.set('experimental_factors', experimental_factors);
    params = params.set('public_release_date', public_release_date);
    params = params.set('hca_update_date', hca_update_date);
    params = params.set('output_dir', output_dir);
    params = params.set('zip_format', zip_format);

    return this.http.post(`${this.API_URL}/submit_to_scea`, null,
      {params:params, responseType: 'blob', observe: 'response'})
      .pipe(
        catchError(this.parseErrorBlob),
        map(response => {
          if (response.status == HttpStatusCode.Ok) {
            return this.getFileDataFromResponse(response);
          }
        })
      );
  }
}
