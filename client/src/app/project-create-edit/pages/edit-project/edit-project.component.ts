import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {IngestService} from '../../../shared/services/ingest.service';
import {AlertService} from '../../../shared/services/alert.service';
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {
  project$: Observable<any>;

  constructor(private route: ActivatedRoute,
              private ingestService: IngestService,
              private alertService: AlertService,
              ) {
  }

  ngOnInit() {
    const pathVariables = this.route.snapshot.paramMap;
    const projectUuid: string = pathVariables.get('uuid');
    this.project$ = this.ingestService.getProjectByUuid(projectUuid);
    this.project$.subscribe(() => {}, err => {
      this.alertService.error('Project could not be retrieved.', err.message);
    });
  }
}
