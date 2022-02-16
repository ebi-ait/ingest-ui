import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IngestService} from "@shared/services/ingest.service";
import {Observable, Subject} from "rxjs";
import {Project} from "@shared/models/project";
import {catchError} from "rxjs/operators";
import {LoaderService} from "@shared/services/loader.service";
import {BrokerService} from "@shared/services/broker.service";
import {AlertService} from "@shared/services/alert.service";
import {SaveFileService} from "@shared/services/save-file.service";
import {Router} from "@angular/router";

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

  importProjectUsingGeo(geoAccession) {
    this.loading.next(true)
    this.getProjectsWithGeo(geoAccession)
      .subscribe(projects => {
          this.showExistingProjectsAlert(projects, 'geo accession');
          if (projects.length == 0) {
            this.onUniqueGeoAccession(geoAccession);
          }
          this.loading.next(false)
        },
        error => {
          this.alertService.error('An error occurred', error.message);
          this.loading.next(false);
        }
      );
  }

  private getProjectsWithGeo(geoAccession: string): Observable<Project[]> {
    const criteria = {
      'field': 'content.geo_series_accessions',
      'operator': 'IN',
      'value': [geoAccession]
    };
    return this.ingestService.getProjectsUsingCriteria(criteria);
  }

  private onUniqueGeoAccession(geoAccession) {
    this.loaderService.display(true, 'This may take a moment. Please wait...');
    this.brokerService.importProjectUsingGeo(geoAccession).pipe(
      catchError(err => {
        this.loaderService.display(true, `Unable to import the project due to error: [${err.message}]. You can still get a spreadsheet to import the project later.
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
