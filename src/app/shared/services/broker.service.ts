import {HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MetadataSchema} from '@shared/models/metadata-schema';
import {Observable, throwError, of} from 'rxjs';
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

  getConcreteTypes(domainEntity: string): Observable<{}> {
    if (domainEntity === 'process') {
      // Fix to remove deprecated schemas that can't be marked as deprecated
      return of({
        'process': 'https://schema.humancellatlas.org/type/process/9.2.0/process'
      });
    }
    // const params = {
    //   high_level_entity: 'type',
    //   domain_entity: domainEntity,
    //   latest: ''
    // }
    // return this.http.get<MetadataSchema[]>(`${this.API_URL}/schemas/query`, {params: params}).pipe(
    //   map(schemas => {
    //     let concreteUrl = {};
    //     schemas.forEach(schema => concreteUrl[schema.concreteEntity] = schema._links['json-schema'].href);
    //     return concreteUrl;
    //   })
    // );
    // The following hardcoded version is in-place until the above real version can be tested against https://github.com/ebi-ait/ingest-broker/pull/38
    if (domainEntity === 'biomaterial'){
      return of({
        'specimen_from_organism': 'https://schema.humancellatlas.org/type/biomaterial/10.4.0/specimen_from_organism',
        'organoid': 'https://schema.humancellatlas.org/type/biomaterial/11.3.0/organoid',
        'imaged_specimen': 'https://schema.humancellatlas.org/type/biomaterial/3.3.0/imaged_specimen',
        'donor_organism': 'https://schema.humancellatlas.org/type/biomaterial/15.5.0/donor_organism',
        'cell_suspension': 'https://schema.humancellatlas.org/type/biomaterial/13.3.0/cell_suspension',
        'cell_line': 'https://schema.humancellatlas.org/type/biomaterial/15.0.0/cell_line'
      });
    }
    if (domainEntity === 'protocol') {
      return of({
        'sequencing_protocol': 'https://schema.humancellatlas.org/type/protocol/sequencing/10.1.0/sequencing_protocol',
        'library_preparation_protocol': 'https://schema.humancellatlas.org/type/protocol/sequencing/6.3.1/library_preparation_protocol',
        'imaging_protocol': 'https://schema.humancellatlas.org/type/protocol/imaging/11.4.0/imaging_protocol',
        'imaging_preparation_protocol': 'https://schema.humancellatlas.org/type/protocol/imaging/2.2.0/imaging_preparation_protocol',
        'ipsc_induction_protocol': 'https://schema.humancellatlas.org/type/protocol/biomaterial_collection/3.2.0/ipsc_induction_protocol',
        'enrichment_protocol': 'https://schema.humancellatlas.org/type/protocol/biomaterial_collection/3.1.0/enrichment_protocol',
        'dissociation_protocol': 'https://schema.humancellatlas.org/type/protocol/biomaterial_collection/6.2.0/dissociation_protocol',
        'differentiation_protocol': 'https://schema.humancellatlas.org/type/protocol/biomaterial_collection/2.2.0/differentiation_protocol',
        'collection_protocol': 'https://schema.humancellatlas.org/type/protocol/biomaterial_collection/9.2.0/collection_protocol',
        'aggregate_generation_protocol': 'https://schema.humancellatlas.org/type/protocol/biomaterial_collection/2.1.0/aggregate_generation_protocol',
        'biomaterial_collection_protocol': 'https://schema.humancellatlas.org/type/protocol/biomaterial/5.1.0/biomaterial_collection_protocol',
        'analysis_protocol': 'https://schema.humancellatlas.org/type/protocol/analysis/9.2.0/analysis_protocol',
        'protocol': 'https://schema.humancellatlas.org/type/protocol/7.1.0/protocol'
      });
    }
    return of({});
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

}
