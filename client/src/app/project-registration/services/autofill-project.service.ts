import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {EuropePMCHttpSearchResponse, Identifier} from '../models/europepmcsearch';
import {AutofillProject} from '../models/autofill-project';

@Injectable()
export class AutofillProjectService {
  API_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

  constructor(private http: HttpClient) {}

  getProjectDetails(searchUsing: Identifier, searchString: string): Observable<AutofillProject> {
    return this.queryEuropePMC(searchUsing, searchString).pipe(
      map(response => {
        const result = response.resultList.result[0];
        if (result) {
          const projectDetails: AutofillProject = {
            title: result.title,
            description: result.abstractText.replace(/(<([^>]+)>)/gi, ''),
            doi: result.doi,
            authors: result.authorString.replace('.', '').split(','),
            pmid: Number(result.pmid),
            funders: result.grantsList && result.grantsList.grant ?
              result.grantsList.grant.map(grant => ({grant_id: grant.grantId, organization: grant.agency})) : []
          };
          return projectDetails;
      } else {
          throw throwError(response);
      }
      })
    );
  }

  queryEuropePMC(queryId: string, queryString: string): Observable<EuropePMCHttpSearchResponse> {
    const params = {
      query: queryId + ':' + queryString,
      resultType: 'core',
      format: 'json'
    };
    return this.http.get<EuropePMCHttpSearchResponse>(this.API_URL, {params});
  }
}
