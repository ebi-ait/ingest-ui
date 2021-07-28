import {Injectable} from '@angular/core';
import {AaiService} from '../../aai/aai.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Project} from '../../shared/models/project';

@Injectable()
export class ProjectCacheService {

  constructor(private aaiService: AaiService) {}

  async saveProject(project: Project): Promise<string> {
    const projectKey = await this.getProjectKey();
    localStorage.setItem(projectKey, JSON.stringify(project));
    return projectKey;
  }

  private async getProjectKey(): Promise<string> {
      return this.aaiService.getUser().pipe(map(user => (`${user?.profile?.email ?? ''}-project`))).toPromise();
  }

  async removeProject(): Promise<string> {
    const projectKey = await this.getProjectKey();
    localStorage.removeItem(projectKey);
    return projectKey;
  }

  getProject(): Promise<Project> {
    return this.getProjectKey().then(projectKey => JSON.parse(localStorage.getItem(projectKey)));
  }
}





