import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AutofillProjectService} from '@projects/services/autofill-project.service';
import {Project} from '@shared/models/project';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {forkJoin, from, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Identifier} from '../../models/europe-pmc-search';
import {ProjectCacheService} from '../../services/project-cache.service';
import {MatDialog} from "@angular/material/dialog";
import {BrokerService} from "@shared/services/broker.service";
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";

@Component({
  selector: 'app-autofill-project-form',
  templateUrl: './autofill-project-form.component.html',
  styleUrls: ['./autofill-project-form.component.css']
})
export class AutofillProjectFormComponent implements OnInit {
  publicationDoiCtrl: FormControl;
  geoAccessionCtrl: FormControl;
  projectInCache$: Observable<Project>;
  loading = false;
  hasDoi: boolean;
  hasGeo: boolean;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ingestService: IngestService,
              private brokerService: BrokerService,
              private loaderService: LoaderService,
              private saveFileService: SaveFileService,
              private alertService: AlertService,
              private projectCacheService: ProjectCacheService,
              private dialog: MatDialog,
              private autofillProjectService: AutofillProjectService
  ) {
  }

  ngOnInit(): void {
    this.publicationDoiCtrl = new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(/^10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i)
    ]));
    this.geoAccessionCtrl = new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(/^GSE.*$/i)
    ]));
    this.projectInCache$ = from(this.projectCacheService.getProject());
  }

  showError(control: FormControl, message: string): string {
    if (control.touched && control.errors) {
      const errors = control.errors;

      if (errors['required']) {
        return 'This field is required';
      }
      if (errors['pattern']) {
        return message;
      }
    }
  }

  submitForm() {
    this.alertService.clear();

    if (this.publicationDoiCtrl.invalid && this.geoAccessionCtrl.invalid) {
      this.publicationDoiCtrl.markAsTouched();
      this.geoAccessionCtrl.markAsTouched();
      return;
    }

    const doi = this.publicationDoiCtrl.value;
    if (this.hasDoi && doi) {
      this.importProjectUsingDoi(doi);
    }

    const geoAccession = this.geoAccessionCtrl.value;
    if (this.hasGeo && geoAccession) {
      this.importProjectUsingGeo(geoAccession);
    }
  }

  private importProjectUsingDoi(doi: string) {
    this.loading = true;
    forkJoin({
      projects: this.autofillProjectService.getProjectsWithDOI(doi),
      doiExists: this.autofillProjectService.doesDoiExist(doi)
    }).subscribe(({projects, doiExists}) => {
        this.showExistingProjectsAlert(projects, 'doi');

        if (!doiExists) {
          this.showDOINotExistsAlert(doi);
        }

        if (doiExists && projects.length == 0) {
          this.createProjectWithDoi(doi);
        }

        this.loading = false;
      },
      error => {
        this.alertService.error('An error occurred', error.message);
        this.loading = false;
      });
  }

  private importProjectUsingGeo(geoAccession) {
    this.loading = true;
    forkJoin({
      projects: this.autofillProjectService.getProjectsWithGeo(geoAccession),
    }).subscribe(({projects}) => {
        this.showExistingProjectsAlert(projects, 'geo accession');
        if (projects.length == 0) {
          this.onUniqueGeoAccession(geoAccession);
        }
        this.loading = false;
      },
      error => {
        this.alertService.error('An error occurred', error.message);
        this.loading = false;
      });
  }

  showDOINotExistsAlert(doi) {
    const link = `mailto:wrangler-team@data.humancellatlas.org?subject=Cannot%20find%20project%20by%20DOI&body=${doi}`;
    this.alertService.error(
      'This DOI cannot be found on Europe PMC.',
      `Please contact our <a href="${link}">wranglers</a> for further assistance.`
    );
  }

  showExistingProjectsAlert(projects: Project[], publicationIdType: string) {
    projects.forEach(project => {
      const projectTitle = project?.content?.['project_core']?.['project_title'];
      const link = `/projects/detail?uuid=${project?.uuid?.uuid}`;
      const errorTitle = `This ${publicationIdType} has already been used by project:`
      this.alertService.error(
        errorTitle,
        `<a href="${link}">${projectTitle}</a>`);
    });
  }

  createProjectWithDoi(doi) {
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

  onDoiExistence($event: string) {
    this.hasDoi = $event == 'Yes' ? true : false;
    this.hasGeo = this.hasDoi && (this.hasGeo != undefined || this.hasGeo) ? false : this.hasGeo;
  }

  onGEOAccessionExistence($event: string) {
    this.hasGeo = $event == 'Yes' ? true : false;
    this.hasDoi = this.hasGeo && (this.hasDoi != undefined || this.hasDoi) ? false : this.hasDoi;
  }

  private onUniqueGeoAccession(geoAccession) {
    this.loaderService.display(true, 'This may take a moment. Please wait...');
    this.brokerService.importProjectUsingGeo(geoAccession).pipe(
      catchError(err => {
        this.loaderService.display(true, `Sorry, we are unable to import the project yet due to error: [${err.message}]. You can still get a spreadsheet to import the project later.
           We are now generating the spreadsheet, please wait this may take a moment...`);
        return this.brokerService.downloadSpreadsheetUsingGeo(geoAccession);
      })
    ).subscribe(response => {
        const projectUuid = response['project_uuid'];
        if (projectUuid) {
          this.onSuccessfulProjectImportFromGeo(geoAccession, projectUuid);
        } else {
          this.onSuccessfulSpreadsheetDownloadFromGeo(response, geoAccession);
        }
        this.loaderService.hide();
      },
      error => {
        this.alertService.error('Unable to import the project or download spreadsheet', error.message);
        this.loaderService.hide();
      })
  }

  private onSuccessfulSpreadsheetDownloadFromGeo(response, geoAccession) {
    const filename = response['filename'];
    const blob = new Blob([response['data']]);
    this.saveFileService.saveFile(blob, filename);
    this.alertService.success(
      'Success',
      `You've successfully downloaded the spreadsheet for GEO accession: ${geoAccession}`,
      true
    );
  }

  private onSuccessfulProjectImportFromGeo(geoAccession, projectUuid) {
    this.alertService.success(
      'Success',
      `The project metadata with GEO accession ${geoAccession} has been successfully created.
               You can download the GEO spreadsheet from Experiment Information tab.`,
      true
    );
    this.router.navigate(['/projects/detail'], {queryParams: {uuid: projectUuid}});
  }
}
