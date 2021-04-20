import {Injectable} from '@angular/core';
import {AaiService} from '../../aai/aai.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable()
export class CacheProjectService {

  constructor(private aai: AaiService) {}

  saveProject(project: object) {
    this.getProjectKey().subscribe(projectKey => localStorage.setItem(projectKey, JSON.stringify(project)));
  }

  getProjectKey(): Observable<string> {
      return this.aai.getUser().pipe(map(user => (user?.profile?.email ?? '') + '-' + 'project'));
  }

  removeProject() {
    this.getProjectKey().subscribe(projectKey => localStorage.removeItem(projectKey));
  }

  getProject(): Observable<object> {
    return this.getProjectKey().pipe(map(projectKey => JSON.parse(localStorage.getItem(projectKey))));
  }
}





