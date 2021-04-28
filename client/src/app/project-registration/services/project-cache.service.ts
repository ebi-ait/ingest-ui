import {Injectable} from '@angular/core';
import {AaiService} from '../../aai/aai.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Project} from '../../shared/models/project';

@Injectable()
export class ProjectCacheService {

  constructor(private aai: AaiService) {}

  saveProject(project: Project) {
    this.getProjectKey().subscribe(projectKey => localStorage.setItem(projectKey, JSON.stringify(project)));
  }

  getProjectKey(): Observable<string> {
      return this.aai.getUser().pipe(map(user => (user?.profile?.email ?? '') + '-' + 'project'));
  }

  removeProject() {
    this.getProjectKey().subscribe(projectKey => localStorage.removeItem(projectKey));
  }

  getProject(): Observable<Project> {
    return this.getProjectKey().pipe(map(projectKey => JSON.parse(localStorage.getItem(projectKey))));
  }
}





