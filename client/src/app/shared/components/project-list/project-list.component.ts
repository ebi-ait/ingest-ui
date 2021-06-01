import {Component, Input, OnInit} from '@angular/core';
import {Project, ProjectColumn} from '../../models/project';
import {$enum} from 'ts-enum-util';
import {formatDate} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {Observable, of} from 'rxjs';
import {IngestService} from '../../services/ingest.service';
import {Account} from '../../../core/account';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  private wranglers: Account[];

  constructor(private authService: AuthService, private ingestService: IngestService) {
  }

  private _projects: Project[];

  get projects(): Project[] {
    return this._projects;
  }

  @Input()
  set projects(projects: Project[]) {
    this._projects = projects;
  }

  private _columns: ProjectColumn[];

  get columns(): ProjectColumn[] {
    return this._columns;
  }

  @Input()
  set columns(columns: ProjectColumn[]) {
    this._columns = columns;
  }

  private _showUnassignedActions: Boolean = false;

  get showUnassignedActions(): Boolean {
    return this._showUnassignedActions;
  }

  @Input()
  set showUnassignedActions(showUnassignedActions: Boolean) {
    this._showUnassignedActions = showUnassignedActions;
  }

  ngOnInit() {
    this.ingestService.getWranglers().subscribe(wranglers =>
      this.wranglers = wranglers
    );
  }

  isWranglerOrOwner(project: Project): Observable<boolean> {
    return this.authService.isWranglerOrOwner(this.ingestService.getUserAccount(), of(project));
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
