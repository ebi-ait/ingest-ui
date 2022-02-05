import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {AlertService} from "@shared/services/alert.service";
import {SaveFileService} from "@shared/services/save-file.service";
import {Router} from "@angular/router";
import {catchError} from "rxjs/operators";


@Component({
  selector: 'app-geo-accession-dialog',
  templateUrl: './geo-accession-dialog.component.html',
  styleUrls: ['./geo-accession-dialog.component.css']
})
export class GeoAccessionDialogComponent implements OnInit {
  geoAccessionCtrl: FormControl;

  constructor(
    private dialogRef: MatDialogRef<GeoAccessionDialogComponent>,
    private brokerService: BrokerService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private saveFileService: SaveFileService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.geoAccessionCtrl = new FormControl('');
  }

  onClose() {
    this.dialogRef.close();
  }

  onImportProject() {
    if (this.geoAccessionCtrl.value) {
      this.loaderService.display(true, 'This may take a moment. Please wait...');
      this.onClose();
      const geoAccession = this.geoAccessionCtrl.value;
      this.brokerService.importProjectUsingGeo(geoAccession).pipe(
        catchError(err => {
          this.loaderService.display(true, `Sorry, we are unable to import the project yet due to error: [${err.message}]. You can still get a spreadsheet to import the project later.
           We are now generating the spreadsheet, please wait this may take a moment...`);
          return this.brokerService.downloadSpreadsheetUsingGeo(geoAccession);
        })
      ).subscribe(response => {
          const projectUuid = response['project_uuid'];
          if (projectUuid) {
            this.alertService.success(
              'Success',
              `The project metadata with GEO accession ${geoAccession} has been successfully created.
               You can download the GEO spreadsheet from Experiment Information tab.`,
              true
            );
            this.router.navigate(['/projects/detail'], {queryParams: {uuid: projectUuid}});
          } else {
            const filename = response['filename'];
            const blob = new Blob([response['data']]);
            this.saveFileService.saveFile(blob, filename);
            this.alertService.success(
              'Success',
              `You've successfully downloaded the spreadsheet for GEO accession ${geoAccession}`,
              true
            );
          }
          this.loaderService.hide();

        },
        error => {
          this.alertService.error('Unable to import or download spreadsheet', error.message);
          this.loaderService.hide();
        })
    }
  }
}
