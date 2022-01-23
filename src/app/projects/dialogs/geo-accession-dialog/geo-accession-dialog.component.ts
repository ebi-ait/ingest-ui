import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {BrokerService} from '@shared/services/broker.service';

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
  ) { }

  ngOnInit(): void {
    this.geoAccessionCtrl = new FormControl('');
  }

  onClose() {
    this.dialogRef.close();
  }

  public saveFile(newBlob: Blob, filename) {
    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const data = window.URL.createObjectURL(newBlob);

    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
  }

  onDownload() {
    if (this.geoAccessionCtrl.value) {
      this.brokerService.downloadSpreadsheetUsingGeo(this.geoAccessionCtrl.value)
        .subscribe(response => {
          const filename = response['filename'];
          const blob = new Blob([response]['data']);
          this.saveFile(blob, filename);
        })
    }
  }
}
