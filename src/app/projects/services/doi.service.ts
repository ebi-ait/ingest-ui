import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {forkJoin, Observable, Subject, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {AutofillProject} from '../models/autofill-project';
import {EuropePMCHttpSearchResponse, EuropePMCResult, Identifier} from '../models/europe-pmc-search';
import {Project} from "@shared/models/project";
import {IngestService} from "@shared/services/ingest.service";
import {Router} from "@angular/router";
import {AlertService} from "@shared/services/alert.service";
import {environment} from '@environments/environment';

@Injectable()
export class DoiService {
  API_URL = environment.EUROPE_PMC_API_URL
  DOI_BASE_URL = environment.DOI_BASE_URL;

  loading: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient,
              private ingestService: IngestService,
              private alertService: AlertService,
              private router: Router) {
  }

  importProjectUsingDoi(doi: string) {
    this.loading.next(true);
    forkJoin({
      projects: this.getProjectsWithDOI(doi),
      doiExists: this.doesDoiExist(doi)
    }).subscribe(({projects, doiExists}) => {
        this.showExistingProjectsAlert(projects, 'doi');

        if (!doiExists) {
          this.showDOINotExistsAlert(doi);
        }

        if (doiExists && projects.length == 0) {
          this.createProjectWithDoi(doi);
        }

        this.loading.next(false)
      },
      error => {
        this.alertService.error('An error occurred', error.message);
        this.loading.next(false);
      }
    );
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

  private showExistingProjectsAlert(projects: Project[], publicationIdType: string) {
    projects.forEach(project => {
      const projectTitle = project?.content?.['project_core']?.['project_title'];
      const link = `/projects/detail?uuid=${project?.uuid?.uuid}`;
      const errorTitle = `This ${publicationIdType} has already been used by project:`
      this.alertService.error(
        errorTitle,
        `<a href="${link}">${projectTitle}</a>`);
    });
  }

  private getProjectsWithDOI(doi: string): Observable<Project[]> {
    const criteria = {
      'field': 'content.publications.doi',
      'operator': 'IS',
      'value': doi
    };
    return this.ingestService.getProjectsUsingCriteria(criteria);
  }

  private doesDoiExist(doi: string): Observable<boolean> {
    const searchIdentifier = Identifier.DOI;
    return this
      .queryEuropePMC(searchIdentifier, doi)
      .pipe(
        map(response => response.resultList.result.length > 0)
      );
  }

  private queryEuropePMC(queryId: string, queryString: string): Observable<EuropePMCHttpSearchResponse> {
    const params = {
      query: queryId + ':' + queryString,
      resultType: 'core',
      format: 'json'
    };
    return this.http.get<EuropePMCHttpSearchResponse>(this.API_URL, {params});
  }

  private createProjectWithDoi(doi) {
    const params = {
      [Identifier.DOI]: doi
    };
    this.router.navigate(['/projects', 'register'], {queryParams: params});
  }

  private showDOINotExistsAlert(doi) {
    const link = `mailto:${environment.WRANGLER_EMAIL}?subject=Cannot%20find%20project%20by%20DOI&body=${doi}`;
    this.alertService.error(
      'This DOI cannot be found on Europe PMC.',
      `Please contact our <a href="${link}">wranglers</a> for further assistance.`
    );
  }

  private createAutoFillProject(result: EuropePMCResult): AutofillProject {
    return {
      title: result.title,
      description: result.abstractText ? DoiService.removeHTMLTags(result.abstractText) : null,
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

  private static removeHTMLTags(input: string): string {
    return input.replace(/(<([^>]+)>)/gi, '');
  }

}
