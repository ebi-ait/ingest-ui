import {HttpClient} from "@angular/common/http";
import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {Project} from "@shared/models/project";
import {AlertService} from "@shared/services/alert.service";
import {BrokerService} from "@shared/services/broker.service";
import {IngestService} from "@shared/services/ingest.service";
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";
import {Observable, Subject} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable()
export class GeoService {
  loading: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient,
              private ingestService: IngestService,
              private loaderService: LoaderService,
              private brokerService: BrokerService,
              private alertService: AlertService,
              private saveFileService: SaveFileService,
              private router: Router) {
  }

  importProject(accession) {
    this.loading.next(true)
    this.getProjectsWithGeoOrInsdc(accession)
      .subscribe(projects => {
          this.showExistingProjectsAlert(projects, 'accession');
          if (projects.length == 0) {
            this.onUniqueAccession(accession);
          }
          this.loading.next(false)
        },
        error => {
          this.alertService.error('An error occurred', error.message);
          this.loading.next(false);
        }
      );
  }

  private getProjectsWithGeoOrInsdc(accession: string): Observable<Project[]> {
    const query = [
      {
        'field': 'content.geo_series_accessions',
        'operator': 'IN',
        'value': [accession]
      },
      {
        'field': 'content.insdc_study_accessions',
        'operator': 'IN',
        'value': [accession]
      },
    ]
    return this.ingestService.getProjectsUsingCriteria(query);
  }

  private onUniqueAccession(accession) {
    this.loaderService.display(true, 'This may take a moment. Please wait...');
    this.brokerService.importProjectUsingGeo(accession).pipe(
      catchError(err => {
        this.loaderService.display(true, `Unable to import the project due to error: [${err.message}]. You can still get a spreadsheet to import the project later.
           We are now generating the spreadsheet, please wait this may take a moment...`);
        return this.brokerService.downloadSpreadsheetUsingGeoOrInsdc(accession);
      })
    ).subscribe(response => {
        const projectUuid = response['project_uuid'];
        if (projectUuid) {
          this.onSuccessfulProjectImport(accession, projectUuid);
        } else {
          this.onSuccessfulSpreadsheetDownload(response, accession);
        }
        this.loaderService.hide();
      },
      error => {
        this.alertService.error('Unable to import the project or download spreadsheet', error.message);
        this.loaderService.hide();
      })
  }

  private showExistingProjectsAlert(projects: Project[], publicationIdType: string) {
    projects.forEach(project => {
      const projectTitle = project?.content?.['project_core']?.['project_title'];
      const link = `/projects/detail?uuid=${project?.uuid?.uuid}`;
      const errorTitle = `This ${publicationIdType} has already been used by project:`
      this.alertService.error(
        errorTitle,
        `<a href="${link}">${projectTitle}</a>`);
    });
  }

  private onSuccessfulSpreadsheetDownload(response, accession) {
    const filename = response['filename'];
    const blob = new Blob([response['data']]);
    this.saveFileService.saveFile(blob, filename);
    this.alertService.success(
      'Success',
      `You've successfully downloaded the spreadsheet for accession ${accession}`,
      true
    );
  }

  private onSuccessfulProjectImport(accession, projectUuid) {
    this.alertService.success(
      'Success',
      `The project metadata with accession ${accession} has been successfully created.
               You can download the GEO spreadsheet from Experiment Information tab.`,
      true
    );
    this.router.navigate(['/projects/detail'], {queryParams: {uuid: projectUuid}});
  }
}
