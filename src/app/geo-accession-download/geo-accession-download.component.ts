import {Component, Input} from '@angular/core';
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";
import {BrokerService} from "@shared/services/broker.service";
import {AlertService} from "@shared/services/alert.service";

@Component({
  selector: 'app-geo-accession-download',
  templateUrl: './geo-accession-download.component.html',
  styleUrls: ['./geo-accession-download.component.css']
})

export class GeoAccessionDownloadComponent {
  @Input() geoAccession;

  constructor(
    private loaderService: LoaderService,
    private saveFileService: SaveFileService,
    private brokerService: BrokerService,
    private alertService: AlertService,
  ) { }


  downloadSpreadsheetUsingGeo() {
    this.loaderService.display(true, 'This may take a moment. Please wait...')
    const geo_accession = this.geoAccession;
    if (geo_accession) {
      this.brokerService.downloadSpreadsheetUsingGeo(geo_accession)
        .subscribe(response => {
            const filename = response['filename'];
            const blob = new Blob([response['data']]);
            this.saveFileService.saveFile(blob, filename);
            this.loaderService.hide();
          },
          error => {
            console.log(error)
            this.alertService.error('Unable to download spreadsheet using this GEO accession.' +
              ' Please retry again.', error.message );
            this.loaderService.hide();
          })
    }

  }
}
