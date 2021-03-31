import {Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {EuropePMCHttpSearchResponse, Identifier} from '../models/europepmcsearch';
import {AutofillProject} from '../models/autofill-project';

@Injectable()
export class AutofillProjectService {
  API_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

  constructor(private http: HttpClient) {}

  // todo: change to traverse whole list
  // todo: handle errors
  // todo: handle empty result
  // todo: check how Number converts stuff, see if I need to any checks in this
  // todo: sanitize the strings, the description for one of the projects had html stuff in it
  // todo: add checks to the grant bit here, in case of missing properties
  getProjectDetails(searchUsing: Identifier, searchString: string): Observable<AutofillProject> {
    return this.queryEuropePMC(searchUsing, searchString).pipe(
      map(response => {
        const result = response.resultList.result[0];
        const projectDetails: AutofillProject = {
          title: result.title,
          description: result.abstractText,
          doi: result.doi,
          authors: result.authorString.split(','),
          pmid: Number(result.pmid),
          funders: result.grantsList.grant.map(grant => ({grant_id: grant.grantId, organization: grant.agency}))
        };
        return projectDetails;
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
