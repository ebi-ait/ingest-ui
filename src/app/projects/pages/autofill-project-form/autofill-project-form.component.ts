import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AutofillProjectService} from '@projects/services/autofill-project.service';
import {Project} from '@shared/models/project';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {from, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Identifier} from '../../models/europe-pmc-search';
import {ProjectCacheService} from '../../services/project-cache.service';

@Component({
  selector: 'app-doi-name-field',
  templateUrl: './autofill-project-form.component.html',
  styleUrls: ['./autofill-project-form.component.css']
})
export class AutofillProjectFormComponent implements OnInit {
  publicationDoiCtrl: FormControl;
  projectInCache$: Observable<Project>;
  loading = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ingestService: IngestService,
              private alertService: AlertService,
              private projectCacheService: ProjectCacheService,
              private autofillProjectService: AutofillProjectService
  ) {
  }

  ngOnInit(): void {
    this.publicationDoiCtrl = new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(/^10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i)
    ]));
    this.projectInCache$ = from(this.projectCacheService.getProject());
  }

  showError(control: FormControl): string {
    if (control.touched && control.errors) {
      const errors = control.errors;

      if (errors['required']) {
        return 'This field is required';
      }
      if (errors['pattern']) {
        return 'The DOI must be a valid DOI. E.g. 10.1038/s41467-021-26902-8'
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
      this.loading = true;
      this.getProjectsWithDOI(doi).pipe(
        switchMap(projects =>
          this.doesDoiExist(doi).pipe(
            map(doiExists => ({ doiExists, projects }))
          )
        ),
      ).subscribe(({projects, doiExists}) => {
        this.showExistingProjectsAlert(projects);

        if (!doiExists) {
          this.showDOIExistsAlert(doi);
        }

        if(doiExists && projects.length == 0) {
          this.createProject(doi)
        }

        this.loading = false;
        },
        error => {
          this.alertService.error('An error occurred', error.message);
          this.loading = false;
        });
    }
  }

  showDOIExistsAlert(doi) {
    const link = `mailto:wrangler-team@data.humancellatlas.org?subject=Cannot%20find%20project%20by%20DOI&body=${doi}`;
    this.alertService.error(
      'This DOI cannot be found on Europe PMC.',
      `Please contact our <a href="${link}">wranglers</a> for further assistance.`
    );
  }

  showExistingProjectsAlert(projects: Project[]) {
    projects.forEach(project => {
      const title = project?.content?.['project_core']?.['project_title'];
      const link = `/projects/detail?uuid=${project?.uuid?.uuid}`;
      this.alertService.error(
        'This DOI has already been used by project:',
        `<a href="${link}">${title}</a>`);
    });
  }

  getProjectsWithDOI(doi: string): Observable<Project[]> {
    const query = [];
    const criteria = {
      'field': 'content.publications.doi',
      'operator': 'IS',
      'value': doi
    };
    query.push(criteria);
    return this.ingestService.queryProjects(query).pipe(
      map(data => data?._embedded?.projects || []),
    );
  }

  doesDoiExist(doi: string): Observable<boolean> {
    const searchIdentifier = Identifier.DOI;
    return this.autofillProjectService
      .queryEuropePMC(searchIdentifier, doi)
      .pipe(
        map(response => response.resultList.result.length > 0)
      );
  }

  private createProject(doi) {
    const params = {
      [Identifier.DOI]: doi
    };
    this.router.navigate(['/projects', 'register'], {queryParams: params});
  }

  restoreProject() {
    const params = {
      restore: 'true'
    };
    this.router.navigate(['/projects', 'register'], {queryParams: params});
  }
}
