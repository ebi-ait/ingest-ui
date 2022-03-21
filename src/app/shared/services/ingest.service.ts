import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Account} from '@app/core/account';

import {environment} from '@environments/environment';
import {FetchSubmissionDataOptions} from '@shared/models/fetch-submission-data-options';
import {isUndefined, omit, omitBy, values} from 'lodash';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {INVALID_FILE_TYPES_AND_CODES, METADATA_VALIDATION_STATES} from '../constants';
import {ArchiveEntity} from '../models/archiveEntity';
import {ArchiveSubmission} from '../models/archiveSubmission';
import {Criteria} from '../models/criteria';

import {ListResult} from '../models/hateoas';
import {MetadataDocument} from '../models/metadata-document';
import {MetadataSchema} from '../models/metadata-schema';
import {PagedData} from '../models/page';
import {QueryData} from '../models/paginatedEndpoint';
import {Project} from '../models/project';
import {SubmissionEnvelope} from '../models/submissionEnvelope';
import {SubmissionSummary} from '../models/submissionSummary';
import {Summary} from '../models/summary';


@Injectable()
export class IngestService {

  constructor(private http: HttpClient) {
    console.log('api url', this.API_URL);
  }

  API_URL: string = environment.INGEST_API_URL;

  public queryProjects = this.getQueryEntity<Project>('projects');
  public queryBiomaterials = this.getQueryEntity('biomaterials');
  public queryProtocols = this.getQueryEntity('protocols');
  public queryFiles = this.getQueryEntity('files');
  public queryProcesses = this.getQueryEntity('processes');

  private static reduceColumnsForBundleManifests(entityType, data) {
    if (entityType === 'bundleManifests') {
      return data.map(function (row) {
        return {
          '_links': row['_links'],
          'dataFiles': row['dataFiles']
        };
      });
    }
    return data;
  }

  private static createAccount(user): Account {
    return new Account(user);
  }

  public getAllSubmissions(params): Observable<any> {
    return this.http.get(`${this.API_URL}/submissionEnvelopes`, {params: params});
  }

  public getUserSubmissions(params): Observable<any> {
    return this.http.get(`${this.API_URL}/user/submissionEnvelopes`, {params: params});
  }

  public getUserSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.API_URL}/user/summary`);
  }

  public getProjects(params): Observable<any> {
    return this.http.get(`${this.API_URL}/projects`, {params: params});
  }

  public getUserProjects(params): Observable<PagedData<Project>> {
    return this.http.get<ListResult<Project>>(`${this.API_URL}/user/projects`, {params: params}).pipe(
      map(data => {
        return {
          data: data._embedded ? data._embedded.projects : [],
          page: data.page
        };
      })
    );
  }

  public getUserAccount(): Observable<Account> {
    return this.http
      .get(`${this.API_URL}/auth/account`)
      .pipe(map(data => IngestService.createAccount(data)));
  }

  public getWranglers(): Observable<Account[]> {
    return this.http
      .get<Account[]>(`${this.API_URL}/user/list`, {params: {'role': 'WRANGLER'}})
      .pipe(map(wranglers => wranglers?.map(wrangler => IngestService.createAccount(wrangler)) ?? []
      ));
  }

  public deleteSubmission(submissionId) {
    return this.http.delete(`${this.API_URL}/submissionEnvelopes/${submissionId}`);
  }

  public getSubmission(id): Observable<SubmissionEnvelope> {
    return this.http.get<SubmissionEnvelope>(`${this.API_URL}/submissionEnvelopes/${id}`);
  }

  public getSubmissionByUuid(uuid): Observable<SubmissionEnvelope> {
    return this.http.get<SubmissionEnvelope>(`${this.API_URL}/submissionEnvelopes/search/findByUuidUuid?uuid=${uuid}`);
  }

  public getProject(id): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/projects/${id}`);
  }

  public deleteProject(id: string): Observable<Object> {
    return this.http.delete(`${this.API_URL}/projects/${id}`);
  }

  public getProjectByUuid(uuid): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/projects/search/findByUuid?uuid=${uuid}`);
  }

  public getSubmissionManifest(submissionId): Observable<Object> {
    return this.http.get(`${this.API_URL}/submissionEnvelopes/${submissionId}/submissionManifest`);
  }

  public postProject(project): Observable<Object> {
    return this.http.post(`${this.API_URL}/projects`, project);
  }

  public getQueryEntity<T extends MetadataDocument>(entityType: string): (query: Criteria[], params?) => Observable<ListResult<T>> {
    const acceptedEntityTypes: string[] = ['files', 'processes', 'biomaterials', 'projects', 'protocols'];
    if (!acceptedEntityTypes.includes(entityType)) {
      throw new Error(`entityType must be one of ${acceptedEntityTypes.join()}`);
    }
    return (query: Criteria[], params?) =>
      this.http.post(`${this.API_URL}/${entityType}/query`, query, {params: params})
        .pipe(map(data => data as ListResult<T>));
  }

  public addInputBiomaterialToProcess(processId: string, biomaterialId: string): Observable<Object> {
    return this.http.post(
      `${this.API_URL}/biomaterials/${biomaterialId}/inputToProcesses`,
      `${this.API_URL}/processes/${processId}`,
      {
        headers: {
          'Content-Type': 'text/uri-list',
        }
      }
    );
  }

  public addInputFileToProcess(processId: string, fileId: string): Observable<Object> {
    return this.http.post(
      `${this.API_URL}/files/${fileId}/inputToProcesses`,
      `${this.API_URL}/processes/${processId}`,
      {
        headers: {
          'Content-Type': 'text/uri-list',
        }
      }
    );
  }

  public addOutputBiomaterialToProcess(processId: string, biomaterialId: string): Observable<Object> {
    return this.http.post(
      `${this.API_URL}/biomaterials/${biomaterialId}/derivedByProcesses`,
      `${this.API_URL}/processes/${processId}`,
      {
        headers: {
          'Content-Type': 'text/uri-list',
        }
      }
    );
  }

  public addProtocolToProcess(processId: string, protocolId: string): Observable<Object> {
    return this.http.post(
      `${this.API_URL}/processes/${processId}/protocols`,
      `${this.API_URL}/protocols/${protocolId}`,
      {
        headers: {
          'Content-Type': 'text/uri-list',
        }
      }
    );
  }

  public addOutputFileToProcess(processId: string, fileId: string): Observable<Object> {
    return this.http.post(
      `${this.API_URL}/files/${fileId}/derivedByProcesses`,
      `${this.API_URL}/processes/${processId}`, {
        headers: {
          'Content-Type': 'text/uri-list',
        }
      }
    );
  }

  public addMetadataToProject(projectId: string, metadataUri: string): Observable<Object>  {
    return this.http.post(
      metadataUri,
      `${this.API_URL}/project/${projectId}`,
      {
        headers: {
          'Content-Type': 'text/uri-list',
        }
      }
    );
  }

  public deleteInputBiomaterialFromProcess(processId: string, biomaterialId: string): Observable<Object> {
    return this.http.delete(
      `${this.API_URL}/biomaterials/${biomaterialId}/inputToProcesses/${processId}`
    );
  }

  public deleteInputFileFromProcess(processId: string, fileId: string): Observable<Object> {
    return this.http.delete(
      `${this.API_URL}/files/${fileId}/inputToProcesses/${processId}`
    );
  }

  public deleteOutputBiomaterialFromProcess(processId: string, biomaterialId: string): Observable<Object> {
    return this.http.delete(
      `${this.API_URL}/biomaterials/${biomaterialId}/derivedByProcesses/${processId}`
    );
  }

  public deleteProtocolFromProcess(processId: string, protocolId: string): Observable<Object> {
    return this.http.delete(
      `${this.API_URL}/processes/${processId}/protocols/${protocolId}`
    );
  }

  public deleteOutputFileFromProcess(processId: string, fileId: string): Observable<Object> {
    return this.http.delete(
      `${this.API_URL}/files/${fileId}/derivedByProcesses/${processId}`
    );
  }

  public patchProject(projectResource, patch): Observable<Project> {
    return this.doPatchProject(projectResource, patch);
  }

  public partiallyPatchProject(projectResource, patch): Observable<Project> {
    return this.doPatchProject(projectResource, patch, true);
  }

  private doPatchProject(projectResource, patch, partial: boolean = false): Observable<Project> {
    const projectLink: string = projectResource['_links']['self']['href'] + `?partial=${partial}`;
    return this.http.patch<Project>(projectLink, patch);
  }

  public getSubmissionProject(submissionId): Observable<Project> {
    return this.http
      .get<ListResult<Project>>(`${this.API_URL}/submissionEnvelopes/${submissionId}/relatedProjects`)
      .pipe(map(data => data._embedded && data._embedded.projects ? data._embedded.projects[0] : null));
  }

  public fetchSubmissionData(options: FetchSubmissionDataOptions): Observable<PagedData<MetadataDocument>> {
    let url = `${this.API_URL}/submissionEnvelopes/${options.submissionId}/${options.entityType}`;
    const submission_url = `${this.API_URL}/submissionEnvelopes/${options.submissionId}`;
    const params: any = omitBy(
      // Only allow extra params that are not explicitly used by this function
      omit(options, ['submissionId', 'entityType', 'sort', 'filterState']),
      isUndefined
    );

    // Depending on the options given, a different endpoint is used
    // This function abstracts away the logic of using different endpoints to filter by different means
    if (options.sort) {
      url = `${this.API_URL}/${options.submissionId}/search/findBySubmissionEnvelope`;
      params['envelopeUri'] = encodeURIComponent(submission_url);
      params['sort'] = `${options.sort.column},${options.sort.direction}`;
    }

    const humanFriendlyTypes: string[] = INVALID_FILE_TYPES_AND_CODES.map(a => a.humanFriendly);

    if (options.filterState === METADATA_VALIDATION_STATES.GraphInvalid) {
      url = `${this.API_URL}/${options.entityType}/search/findBySubmissionIdWithGraphValidationErrors`;
      params['envelopeId'] = options.submissionId;
      delete params['envelopeUri']; // Don't need this if has been set
    } else if (options.filterState && !humanFriendlyTypes.includes(options.filterState)) {
      url = `${this.API_URL}/${options.entityType}/search/findBySubmissionEnvelopeAndValidationState`;
      params['envelopeUri'] = encodeURIComponent(submission_url);
      params['state'] = options.filterState.toUpperCase();
    } else if (options.filterState && humanFriendlyTypes.includes(options.filterState)) {
      if (options.entityType !== 'files') {
        throw new Error('Only files can be filtered by validation type.');
      }

      url = `${this.API_URL}/files/search/findBySubmissionEnvelopeIdAndErrorType`;
      const fileValidationTypeFilter = INVALID_FILE_TYPES_AND_CODES.find(type => type.humanFriendly === options.filterState).code;
      params['envelopeUri'] = encodeURIComponent(submission_url);
      params['errorType'] = fileValidationTypeFilter;
      params['id'] = options.submissionId;
    }

    return this.http.get<ListResult<MetadataDocument>>(url, {params})
      .pipe(map(data => {
        const pagedData: PagedData<MetadataDocument> = {data: [], page: undefined};
        if (data._embedded && data._embedded[options.entityType]) {
          pagedData.data = values(data._embedded[options.entityType]);
          pagedData.data = IngestService.reduceColumnsForBundleManifests(options.entityType, pagedData.data);
        } else {
          pagedData.data = [];
        }
        pagedData.page = data.page;
        return pagedData;
      }));
  }

  public getSubmissionSummary(submissionId): Observable<SubmissionSummary> {
    return this.http.get<SubmissionSummary>(`${this.API_URL}/submissionEnvelopes/${submissionId}/summary`);
  }

  public put(ingestLink, patchData): Observable<Object>;
  public put<T>(ingestLink, patchData): Observable<T>;
  public put<T>(ingestLink, patchData): Observable<T> {
    return this.http.put<T>(ingestLink, patchData);
  }

  public patch(ingestLink, patchData): Observable<Object>;
  public patch<T>(ingestLink, patchData): Observable<T>;
  public patch<T>(ingestLink, patchData): Observable<T> {
    return this.http.patch<T>(ingestLink, patchData);
  }

  public post(ingestLink, postData): Observable<Object>;
  public post<T>(ingestLink, postData): Observable<T>;
  public post<T>(ingestLink, postData): Observable<T> {
    return this.http.post<T>(ingestLink, postData);
  }

  public get(url, options?): Observable<Object>;
  public get<T>(url, options?): Observable<T>;
  public get<T>(url, options?) {
    return this.http.get<T>(url, options);
  }

  public getLatestSchemas(): Observable<ListResult<MetadataSchema>> {
    return this.http.get<ListResult<MetadataSchema>>(`${this.API_URL}/schemas/search/filterLatestSchemas?highLevelEntity=type`);
  }

  public getArchiveSubmission(submissionUuid: string): Observable<ArchiveSubmission> {
    return this.http.get<ListResult<ArchiveSubmission>>(
      `${this.API_URL}/archiveSubmissions/search/findBySubmissionUuid?submissionUuid=${submissionUuid}`
    ).pipe(
      map(result => {
        const archiveSubmissions = result._embedded.archiveSubmissions;
        // TODO Adjust the UI to be able to display all archive submissions
        // just display the last
        if (archiveSubmissions.length > 0) {
          archiveSubmissions.reverse();
          return archiveSubmissions[0];
        }
        return undefined;
      })
    );
  }

  public getArchiveEntity(dspUuid: string): Observable<ArchiveEntity> {
    return this.http.get<ArchiveEntity>(`${this.API_URL}/archiveEntities/search/findByDspUuid?dspUuid=${dspUuid}`);
  }

  public getFilteredProjects(params: QueryData): Observable<ListResult<Project>> {
    return this.http.get(`${this.API_URL}/projects/filter`, {params: params}).pipe((map(data => data as ListResult<Project>)));
  }

  getProjectsUsingCriteria(criteria: object): Observable<Project[]>{
    const query = [];
    query.push(criteria);
    return this.queryProjects(query).pipe(
      map(data => data?._embedded?.projects || []),
    );
  }
}
