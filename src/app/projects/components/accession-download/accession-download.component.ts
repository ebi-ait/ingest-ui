import {Component, Input} from '@angular/core';
import {GeoService} from "@projects/services/geo.service";
import {AlertService} from "@shared/services/alert.service";
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";

@Component({
  selector: 'app-accession-download',
  templateUrl: './accession-download.component.html',
  styleUrls: ['./accession-download.component.css']
})

export class AccessionDownloadComponent {
  @Input() accession;
  @Input() accessionType;

  constructor(
    private loaderService: LoaderService,
    private saveFileService: SaveFileService,
    private alertService: AlertService,
    private geoService: GeoService
  ) { }


  downloadSpreadsheet() {
    const accession = this.accession;

    if (!accession) {
      console.log('Unable to download the spreadsheet as accession is not specified')
      return;
    }

    this.loaderService.display(true, 'This may take a moment. Please wait...')
    this.geoService.downloadSpreadsheet(accession)
      .subscribe(response => {
          const filename = response['filename'];
          const blob = new Blob([response['data']]);
          this.saveFileService.saveFile(blob, filename);
          this.loaderService.hide();
        },
        error => {
          this.alertService.error('Unable to download spreadsheet using this accession.' +
            ' Please retry again.', error.message );
          this.loaderService.hide();
        })
  }
}
