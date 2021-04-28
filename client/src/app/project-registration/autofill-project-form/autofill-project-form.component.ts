import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '../../shared/services/alert.service';
import {Identifier} from '../models/europe-pmc-search';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IngestService} from '../../shared/services/ingest.service';
import {ProjectCacheService} from '../services/project-cache.service';
import {Project} from '../../shared/models/project';

@Component({
  selector: 'app-doi-name-field',
  templateUrl: './autofill-project-form.component.html',
  styleUrls: ['./autofill-project-form.component.css']
})


export class AutofillProjectFormComponent implements OnInit {
  publicationDoiCtrl: FormControl;
  projectInCache$: Observable<Project>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ingestService: IngestService,
              private alertService: AlertService,
              private cacheProjectService: ProjectCacheService
  ) {
  }

  ngOnInit(): void {
    this.publicationDoiCtrl = new FormControl('', Validators.required);
    this.projectInCache$ = this.cacheProjectService.getProject();
  }

  showError(control: FormControl): string {
    if (control.touched && control.errors) {
      const errors = control.errors;

      if (errors['required']) {
        return 'This field is required';
      }
    }
  }

  submitForm() {
    if (this.publicationDoiCtrl.invalid) {
      this.publicationDoiCtrl.markAsTouched();
      return;
    }

    if (this.publicationDoiCtrl.value) {
      const doi = this.publicationDoiCtrl.value;
      this.doesDoiExist(doi).subscribe(doiExists => {
          if (doiExists) {
            this.alertService.error('This doi has already been used. Please contact our wranglers for further assistance', '');
            return;
          }
          const params = {
            [Identifier.DOI]: doi
          };
          this.router.navigate(['/projects', 'new'], {queryParams: params});
        },
        error => {
          this.alertService.error('An error occurred', error.message);
        });
    }
  }

  doesDoiExist(doi: string): Observable<boolean> {
    const query = [];
    const criteria = {
      'field': 'content.publications.doi',
      'operator': 'IS',
      'value': doi
    };
    query.push(criteria);
    return this.ingestService.queryProjects(query).pipe(map(data => !!data.page.totalElements));
  }

  restoreProject() {
    const params = {
      restore: 'true'
    };
    this.router.navigate(['/projects', 'new'], {queryParams: params});
  }
}
