import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {AutofillProject} from '../models/autofill-project';
import {EuropePMCHttpSearchResponse, EuropePMCResult, Identifier} from '../models/europe-pmc-search';

@Injectable()
export class AutofillProjectService {
  API_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
  DOI_BASE_URL = 'https://doi.org/';

  constructor(private http: HttpClient) {
  }

  getProjectDetails(searchUsing: Identifier, searchString: string): Observable<AutofillProject> {
    return this.queryEuropePMC(searchUsing, searchString).pipe(
      map(response => {
        const result = response.resultList.result[0];
        if (result) {
          return this.createAutoFillProject(result);
        } else {
          throw throwError(response);
        }
      })
    );
  }

  private static removeHTMLTags(input: string): string {
    return input.replace(/(<([^>]+)>)/gi, '');
  }

  queryEuropePMC(queryId: string, queryString: string): Observable<EuropePMCHttpSearchResponse> {
    const params = {
      query: queryId + ':' + queryString,
      resultType: 'core',
      format: 'json'
    };
    return this.http.get<EuropePMCHttpSearchResponse>(this.API_URL, {params});
  }

  private createAutoFillProject(result: EuropePMCResult): AutofillProject {
    return {
      title: result.title,
      description: result.abstractText ? AutofillProjectService.removeHTMLTags(result.abstractText) : null,
      doi: result.doi,
      authors: result.authorString ? result.authorString.replace('.', '').split(',') : null,
      pmid: result.pmid ? Number(result.pmid) : null,
      url: this.DOI_BASE_URL + result.doi,
      funders: result.grantsList?.grant?.map(grant => ({grant_id: grant.grantId, organization: grant.agency})) ?? [],
      contributors: result.authorList?.author?.map(author => ({
        first_name: author.firstName,
        last_name: author.lastName,
        institution: author.authorAffiliationDetailsList?.authorAffiliation?.[0]?.affiliation ?? '',
        orcid_id: author.authorId?.type === 'ORCID' ? author.authorId.value : ''
      })) ?? []
    };
  }
}
