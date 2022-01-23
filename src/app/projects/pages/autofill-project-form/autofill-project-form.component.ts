import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {from, Observable} from 'rxjs';
import {filter, map, switchMapTo, tap} from 'rxjs/operators';
import {Project} from '@shared/models/project';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {Identifier} from '../../models/europe-pmc-search';
import {ProjectCacheService} from '../../services/project-cache.service';
import {MatDialog} from "@angular/material/dialog";
import {GeoAccessionDialogComponent} from "@projects/dialogs/geo-accession-dialog/geo-accession-dialog.component";
import {AutofillProjectService} from '@projects/services/autofill-project.service';

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
              private projectCacheService: ProjectCacheService,
              private dialog: MatDialog,
              private autofillProjectService: AutofillProjectService
  ) {
  }

  ngOnInit(): void {
    this.publicationDoiCtrl = new FormControl('', Validators.required);
    this.projectInCache$ = from(this.projectCacheService.getProject());
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
      this.doesProjectWithDoiExist(doi).pipe(
        filter(projectExists => projectExists === false),
        switchMapTo(this.doesDoiExist(doi)),
        filter(doiExists => doiExists)
      ).subscribe(() => {
          this.createProject(doi);
        },
        error => {
          this.alertService.error('An error occurred', error.message);
        });
    }
  }

  doesProjectWithDoiExist(doi: string): Observable<boolean> {
    const query = [];
    const criteria = {
      'field': 'content.publications.doi',
      'operator': 'IS',
      'value': doi
    };
    query.push(criteria);
    return this.ingestService.queryProjects(query).pipe(
      map(data => data?._embedded?.projects),
      tap(projects => projects?.forEach(project => {
        const project_title = project?.content?.['project_core']?.['project_title'];
        const link = `/projects/detail?uuid=${project?.uuid?.uuid}`;
        this.alertService.error(
          'This DOI has already been used by project:',
          `<a href="${link}">${project_title}</a>`);
      })),
      map(projects => !!projects)
    );
  }

  doesDoiExist(doi: string): Observable<boolean> {
    const searchIdentifier = Identifier.DOI;
    return this.autofillProjectService
      .queryEuropePMC(searchIdentifier, doi)
      .pipe(
        map(response => response.resultList.result.length > 0),
        tap(doiExists => {
          if (!doiExists) {
            const link = `mailto:wrangler-team@data.humancellatlas.org?subject=Cannot%20find%20project%20by%20DOI&body=${doi}`;
            this.alertService.error(
              'This DOI cannot be found on Europe PMC.',
              `Please contact our <a href="${link}">wranglers</a> for further assistance.`
            );
          }
        })
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

  openDialog() {
    const dialogRef = this.dialog.open(GeoAccessionDialogComponent);
    dialogRef.disableClose = true;
  }
}
