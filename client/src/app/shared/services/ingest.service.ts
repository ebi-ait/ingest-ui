import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import values from 'lodash/values';

import {ListResult} from '../models/hateoas';
import {Summary} from '../models/summary';
import {PagedData} from '../models/page';
import {SubmissionEnvelope} from '../models/submissionEnvelope';

import {environment} from '../../../environments/environment';
import {MetadataDocument} from '../models/metadata-document';
import {MetadataSchema} from '../models/metadata-schema';
import {Account} from '../../core/account';
import {Project} from '../models/project';
import {ArchiveSubmission} from '../models/archiveSubmission';
import {ArchiveEntity} from '../models/archiveEntity';
import {Criteria} from '../models/criteria';
import {INVALID_FILE_TYPES} from '../constants';
import {SubmissionSummary} from '../models/submissionSummary';


@Injectable()
export class IngestService {

  constructor(private http: HttpClient) {
    console.log('api url', this.API_URL);
  }

  API_URL: string = environment.INGEST_API_URL;

  public queryProjects = this.getQueryEntity('projects');
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
      .pipe(map(data => this.createAccount(data)));
  }

  public getWranglers(): Observable<Account[]> {
    return this.http
      .get<Account[]>(`${this.API_URL}/user/list`, {params: {'role': 'WRANGLER'}})
      .pipe(map(wranglers => wranglers?.map(wrangler => this.createAccount(wrangler)) ?? []
      ));
  }

  private createAccount(user): Account {
    return new Account(user);
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

  public getQueryEntity(entityType: string): (query: Criteria[], params?) => Observable<ListResult<MetadataDocument>> {
    const acceptedEntityTypes: string[] = ['files', 'processes', 'biomaterials', 'projects', 'protocols'];
    if (!acceptedEntityTypes.includes(entityType)) {
      throw new Error(`entityType must be one of ${acceptedEntityTypes.join()}`);
    }
    return (query: Criteria[], params?) =>
      this.http.post(`${this.API_URL}/${entityType}/query`, query, {params: params})
        .pipe(map(data => data as ListResult<MetadataDocument>));
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

  public deleteInputBiomaterialFromProcess(processId: string, biomaterialId: string): Observable<Object> {
    return this.http.delete(
      `${this.API_URL}/biomaterials/${biomaterialId}/inputToProcesses/${processId}`
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

  public fetchSubmissionData(submissionId, entityType, params): Observable<PagedData<MetadataDocument>> {
    let url = `${this.API_URL}/submissionEnvelopes/${submissionId}/${entityType}`;
    const submission_url = `${this.API_URL}/submissionEnvelopes/${submissionId}`;

    // IMPORTANT! The order of these if statements matters
    // The url is overridden in each but params will be preserved.
    // E.g. params.sort can be added and used in the url for filtering as well
    // This might not be the best way to do this but with the varying endpoints, it's okay
    const sort = params['sort'];
    if (sort) {
      url = `${this.API_URL}/${entityType}/search/findBySubmissionEnvelope`;
      params['envelopeUri'] = encodeURIComponent(submission_url);
      params['sort'] = `${sort['column']},${sort['direction']}`;
    }

    if (params.filterState && params.fileValidationTypeFilter) {
      throw new Error('Cannot have both filterState and fileValidationTypeFilter.');
    }
    const humanFriendlyTypes = INVALID_FILE_TYPES.map(a => a.humanFriendly);
    if (params.filterState && !humanFriendlyTypes.includes(params.filterState)) {
      url = `${this.API_URL}/${entityType}/search/findBySubmissionEnvelopeAndValidationState`;
      params['envelopeUri'] = encodeURIComponent(submission_url);
      params['state'] = params.filterState.toUpperCase();
    }

    if (params.filterState && humanFriendlyTypes.includes(params.filterState)) {
      if (entityType !== 'files') {
        throw new Error('Only files can be filtered by validation type.');
      }

      url = `${this.API_URL}/files/search/findBySubmissionEnvelopeIdAndErrorType`;
      const fileValidationTypeFilter = INVALID_FILE_TYPES.find(type => type.humanFriendly === params.filterState).code;
      delete params.filterState; // Don't want to include this in the request
      params.errorType = fileValidationTypeFilter;
      params.id = submissionId;
    }

    return this.http.get<ListResult<MetadataDocument>>(url, {params: params})
      .pipe(map(data => {
        const pagedData: PagedData<MetadataDocument> = {data: [], page: undefined};
        if (data._embedded && data._embedded[entityType]) {
          pagedData.data = values(data._embedded[entityType]);
          pagedData.data = IngestService.reduceColumnsForBundleManifests(entityType, pagedData.data);
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
}
