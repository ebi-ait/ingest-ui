import {formatDate} from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {concatMap, tap} from 'rxjs/operators';
import {$enum} from 'ts-enum-util';
import {Account} from '../../../core/account';
import {Project, ProjectColumn} from '../../models/project';
import {AuthService} from '../../services/auth.service';
import {IngestService} from '../../services/ingest.service';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  wranglers: Account[];

  @Input()
  projects: Project[];

  @Input()
  columns: ProjectColumn[];

  account$: Observable<Account>;

  isWrangler: Boolean;

  constructor(private authService: AuthService, private ingestService: IngestService) {
  }

  ngOnInit() {
    this.account$ = this.ingestService.getUserAccount();
    this.authService.isWrangler(this.account$)
      .pipe(
        tap(isWrangler => this.isWrangler = isWrangler),
        concatMap(isWrangler => {
          return isWrangler ? this.ingestService.getWranglers() : [];
        })).subscribe(wranglers =>
      this.wranglers = wranglers
    );
  }

  isWranglerOrOwner(project: Project): Observable<boolean> {
    return this.authService.isWranglerOrOwner(this.account$, of(project));
  }

  getColumnLabel(column: ProjectColumn): string {
    return $enum.mapValue(column).with({
      [ProjectColumn.apiLink]: '',
      [ProjectColumn.shortName]: 'HCA Project ID',
      [ProjectColumn.projectTitle]: 'Project Title',
      [ProjectColumn.lastUpdated]: 'Last Updated',
      [ProjectColumn.wranglingState]: 'Wrangling Status',
      [ProjectColumn.primaryContributor]: 'Primary Contributor',
      [ProjectColumn.primaryWrangler]: 'Primary Wrangler'
    });
  }

  getContent(column: ProjectColumn, project: Project): string {
    return $enum.mapValue(column).with({
      [ProjectColumn.apiLink]: this.getApiLink(project),
      [ProjectColumn.shortName]: this.getShortName(project),
      [ProjectColumn.projectTitle]: this.getTitle(project),
      [ProjectColumn.lastUpdated]: this.getLastUpdated(project),
      [ProjectColumn.primaryContributor]: this.getContributor(project),
      [ProjectColumn.primaryWrangler]: this.getWranglerName(project),
      // ToDo: Include Wrangler and User Account objects in ingest-core Project object.
      [ProjectColumn.wranglingState]: project?.wranglingState
    });
  }

  getApiLink(project: Project) {
    try {
      return project['_links']['self']['href'];
    } catch (e) {
      return '';
    }
  }

  getShortName(project: Project): string {
    try {
      return project?.content['project_core']['project_short_name'];
    } catch (e) {
      return '';
    }
  }

  getTitle(project: Project): string {
    try {
      return project?.content['project_core']['project_title'];
    } catch (e) {
      return '';
    }
  }

  getLastUpdated(project: Project): string {
    return formatDate(project.updateDate, 'longDate', 'en-GB');
  }

  getContributor(project: Project) {
    let contributors = project && project.content && project.content['contributors'];
    contributors = contributors ? project.content['contributors'] : [];
    const correspondents = contributors.filter(contributor => contributor['corresponding_contributor'] === true);
    return correspondents.map(c => c['name']).join(' | ');
  }

  private getWranglerName(project: Project): string {
    const wranglersFound = project.primaryWrangler && this.wranglers ? this.wranglers.filter(account => account.id === project.primaryWrangler) : undefined;
    return wranglersFound && wranglersFound.length > 0 ? wranglersFound[0].name : undefined;
  }
}
