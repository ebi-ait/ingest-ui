import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Project} from "../../shared/models/project";
import {MatPaginator, PageEvent} from "@angular/material";
import {IngestService} from "../../shared/services/ingest.service";
import {TimerObservable} from "rxjs-compat/observable/TimerObservable";
import {tap} from "rxjs/internal/operators";
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})

export class ProjectListComponent implements OnInit {
  projects: Project[];
  alive: boolean;
  interval:number;

  pagination: Object;
  params: Object;
  currentPageInfo: Object;

  // MatPaginator Inputs
  pageSizeOptions: number[] = [5, 10, 20, 30];

  // MatPaginator Output
  pageEvent: PageEvent;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  searchText: string;

  constructor(private ingestService: IngestService) {
    this.alive = true;
    this.interval = 4000;
    this.currentPageInfo = {
      size: 20,
      number: 0,
      totalPages:0,
      totalElements: 0,
      start: 0,
      end:0
    };

    this.params ={'page': 0, 'size': 20, 'sort' : 'updateDate,desc'};
  }

  ngOnInit() {
    this.pollProjects()
  }

  getProjectId(project){
    let links = project['_links'];
    return links && links['self'] && links['self']['href'] ? links['self']['href'].split('/').pop() : '';
  }

  ngOnDestroy(){
    this.alive = false; // switches your IntervalObservable off
  }

  onKeyEnter(value){
    this.searchText = value;
    this.paginator.pageIndex = 0;
    this.getProjects();
  }

  queryProjects(text: string, pagination){
    let query = [];
    let fields = [
      'project_core.project_description',
      'project_core.project_title',
      'project_core.project_shortname'
    ];

    for(let field of fields) {
      let criteria = {
        "contentField": field,
        "operator": "REGEX",
        "value": text.replace(/\s+/g, '\\s+')
      }
      query.push(criteria);
    }

    this.ingestService.queryProjects(query, pagination)
      .subscribe({
          next: data => {
            this.projects = data._embedded ? data._embedded.projects : [];
            this.pagination = data.page;
            this.getCurrentPageInfo(this.pagination);
          },
          error: err => {
            console.log("err", err)
          }
      });
  }

  pollProjects(){
    TimerObservable.create(0, this.interval)
      .takeWhile(() => this.alive) // only fires when component is alive
      .subscribe(() => {
        this.getProjects();
      });
  }

  getProjects(){
    this.params['page'] = this.paginator.pageIndex;
    this.params['size'] = this.paginator.pageSize;

    if(this.searchText){
      this.queryProjects(this.searchText, this.params)
    }
    else{
      this.ingestService.getProjects(this.params)
        .subscribe(data =>{
          this.projects = data._embedded ? data._embedded.projects : [];
          this.pagination = data.page;
          this.getCurrentPageInfo(this.pagination);
        });
    }

  }

  // TODO Create a component which supports dynamic(polled data) datatable loading and pagination
  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.getProjects())
      )
      .subscribe();
  }

  getCurrentPageInfo(pagination){
    this.currentPageInfo['totalPages'] = pagination.totalPages;
    this.currentPageInfo['totalElements'] = pagination.totalElements;
    this.currentPageInfo['number'] = pagination.number;
    return this.currentPageInfo;
  }

}
