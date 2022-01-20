import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
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
  ) {
  }

  ngOnInit(): void {
    this.geoAccessionCtrl = new FormControl('');
  }

  onClose() {
    this.dialogRef.close();
  }

  onDownload() {
    if (this.geoAccessionCtrl.value) {
      console.log("am in the download function")
      this.brokerService.downloadSpreadsheetUsingGeo(this.geoAccessionCtrl.value)
        .subscribe(result => {console.log("HCA metadata download," +
        " using geo accession in progress")})
    }
  }
}
