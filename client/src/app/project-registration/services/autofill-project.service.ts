import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {EuropePMCHttpSearchResponse, Identifier} from '../models/europe-pmc-search';
import {AutofillProject} from '../models/autofill-project';

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
          const projectDetails: AutofillProject = {
            title: result.title,
            description: result.abstractText.replace(/(<([^>]+)>)/gi, ''),
            doi: result.doi,
            authors: result.authorString.replace('.', '').split(','),
            pmid: result.pmid ? Number(result.pmid) : null,
            url: this.DOI_BASE_URL + result.doi,
            funders: result.grantsList && result.grantsList.grant ?
              result.grantsList.grant.map(grant => ({grant_id: grant.grantId, organization: grant.agency})) : [],
            contributors: result.authorList && result.authorList.author && result.authorList.author.length ?
              result.authorList.author.map(author => ({
                name: author.firstName + ',,' + author.lastName,
                institution: author.authorAffiliationDetailsList && author.authorAffiliationDetailsList.authorAffiliation ?
                  author.authorAffiliationDetailsList.authorAffiliation[0].affiliation : '',
                orcid_id: author.authorId && author.authorId.type === 'ORCID' ? author.authorId.value : ''
              })) : []
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
