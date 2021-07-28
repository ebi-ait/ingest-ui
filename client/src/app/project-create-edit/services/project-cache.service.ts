import {Injectable} from '@angular/core';
import {AaiService} from '../../aai/aai.service';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Project} from '../../shared/models/project';

@Injectable()
export class ProjectCacheService {

  constructor(private aaiService: AaiService) {}

  saveProject(project: Project): Observable<string> {
    return this.getProjectKey().pipe(tap(projectKey => localStorage.setItem(projectKey, JSON.stringify(project))));
  }

  private getProjectKey(): Observable<string> {
      return this.aaiService.getUser().pipe(map(user => (`${user?.profile?.email ?? ''}-project`)));
  }

  removeProject(): Observable<string> {
    return this.getProjectKey().pipe(tap(projectKey => localStorage.removeItem(projectKey)));
  }

  getProject(): Observable<Project> {
    return this.getProjectKey().pipe(map(projectKey => JSON.parse(localStorage.getItem(projectKey))));
  }
}





