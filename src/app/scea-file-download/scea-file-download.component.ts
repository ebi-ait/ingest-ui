import {Component, Input} from '@angular/core';
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";
import {BrokerService} from "@shared/services/broker.service";
import {AlertService} from "@shared/services/alert.service";

@Component({
  selector: 'app-scea-file-download',
  templateUrl: './scea-file-download.component.html',
  styleUrls: ['./scea-file-download.component.css']
})

export class SCEAFileDownloadComponent {

  constructor(
    private loaderService: LoaderService,
    private saveFileService: SaveFileService,
    private brokerService: BrokerService,
    private alertService: AlertService,
  ) { }

  downloadSCEAFiles() {

    this.loaderService.display(true, 'This may take a moment. Please wait...')
    this.brokerService.downloadSCEAFiles()
      .subscribe(response => {
          const filename = response['filename'];
          const blob = new Blob([response['data']]);
          this.saveFileService.saveFile(blob, filename);
          this.loaderService.hide();
        },
        error => {
          this.alertService.error('Unable to download SCEA files for this dataset.' +
            ' Please retry again.', error.message );
          this.loaderService.hide();
        })
  }
}
