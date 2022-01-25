import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {AlertService} from "@shared/services/alert.service";
import {SaveFileService} from "@shared/services/save-file.service";


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
    private saveFileService: SaveFileService
  ) { }

  ngOnInit(): void {
    this.geoAccessionCtrl = new FormControl('');
  }

  onClose() {
    this.dialogRef.close();
  }

  onDownload() {
    if (this.geoAccessionCtrl.value) {
      this.loaderService.display(true, 'This may take a moment. Please wait...');
      this.onClose();
      this.brokerService.downloadSpreadsheetUsingGeo(this.geoAccessionCtrl.value)
        .subscribe(response => {
          const filename = response['filename'];
          const blob = new Blob([response['data']]);
          this.saveFileService.saveFile(blob, filename);
          this.loaderService.hide();
        },
        error => {
          this.alertService.error('Unable to download spreadsheet. Please retry later.', error.message );
          this.loaderService.hide();
        })
    }
  }
}
