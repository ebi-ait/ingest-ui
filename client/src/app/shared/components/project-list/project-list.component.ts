import {Component, Input, OnInit} from '@angular/core';
import {Project, ProjectColumn} from '../../models/project';
import {$enum} from 'ts-enum-util';
import {formatDate} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {Observable, of} from 'rxjs';
import {IngestService} from '../../services/ingest.service';
import {Account} from '../../../core/account';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  private wranglers: Account[];

  constructor(private authService: AuthService, private ingestService: IngestService) {
    this.ingestService.getWranglers().subscribe(wranglers => {
      this.wranglers = wranglers;
    });
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
  }

  isWranglerOrOwner(project: Project): Observable<boolean> {
    return this.authService.isWranglerOrOwner(this.ingestService.getUserAccount(), of(project));
  }

  getColumnLabel(column: ProjectColumn): string {
    return $enum.mapValue(column).with({
      [ProjectColumn.api_link]: '',
      [ProjectColumn.short_name]: 'HCA Project ID',
      [ProjectColumn.project_title]: 'Project Title',
      [ProjectColumn.last_updated]: 'Last Updated',
      [ProjectColumn.wrangling_status]: 'Wrangling Status',
      [ProjectColumn.primary_contributor]: 'Primary Contributor',
      [ProjectColumn.primary_wrangler]: 'Primary Wrangler'
    });
  }

  getContent(column: ProjectColumn, project: Project): string {
    return $enum.mapValue(column).with({
      [ProjectColumn.api_link]: this.getApiLink(project),
      [ProjectColumn.short_name]: this.getShortName(project),
      [ProjectColumn.project_title]: this.getTitle(project),
      [ProjectColumn.last_updated]: this.getLastUpdated(project),
      [ProjectColumn.primary_contributor]: this.getContributor(project),
      [ProjectColumn.primary_wrangler]: this.getWranglerName(project),
      // ToDo: Include Wrangler and User Account objects in ingest-core Project object.
      [ProjectColumn.wrangling_status]: project?.wranglingState
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

  private getWranglerName(project: Project) : string {
    const wranglersFound = project.primaryWrangler ? this.wranglers.filter(account => account.id === project.primaryWrangler) : undefined;
    return wranglersFound && wranglersFound.length > 0 ? wranglersFound[0].name : undefined;
  }
}
