import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {AlertService} from "@shared/services/alert.service";
import {IngestService} from "@shared/services/ingest.service";
import {BrokerService} from "@shared/services/broker.service";
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";
import {TimeoutError} from "rxjs";
import {SubmissionEnvelope} from "@shared/models/submissionEnvelope";

@Component({
  selector: 'app-spreadsheet-tab-details',
  templateUrl: './spreadsheet-tab-details.component.html',
  styleUrls: ['./spreadsheet-tab-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpreadsheetTabDetailsComponent implements OnInit, OnChanges {

  constructor(
    private alertService: AlertService,
    private brokerService: BrokerService,
    private loaderService: LoaderService,
    private saveFileService: SaveFileService
  ) {
  }

  @Input()
  projectUuid: string;
  @Input()
  submissionEnvelope: SubmissionEnvelope;
  @Input()
  downloadDetailsOpened: boolean;
  @Input()
  importDetailsOpened: boolean;

  spreadsheetUpToDate: boolean;
  downloadJobOngoing: boolean;

  lastSpreadsheetJob: object;
  submissionEnvelopeUuid: string;
  contentLastUpdated: string;

  ngOnInit(): void {
    this.loadSubmissionData();
  }

  ngOnChanges() {
    this.loadSubmissionData();
  }

  loadSubmissionData() {
    console.log('laoding submission data');
    this.submissionEnvelopeUuid = this.submissionEnvelope['uuid']['uuid'];
    this.lastSpreadsheetJob = this.submissionEnvelope['lastSpreadsheetGenerationJob'] || {};
    this.downloadJobOngoing = this.lastSpreadsheetJob && this.lastSpreadsheetJob['createdDate'] && !this.lastSpreadsheetJob['finishedDate'];
    this.checkIfSpreadsheetIsUpToDate(this.submissionEnvelope);
  }

  generateSpreadsheet() {
    const uuid = this.submissionEnvelope['uuid']['uuid'];
    this.brokerService.generateSpreadsheetFromSubmission(uuid)
      .subscribe(response => {
          this.alertService.success('Success',
            'Successfully triggered spreadsheet generation! This may take a while. ' +
            'Please come back later and check the link to download the file.');
          this.downloadJobOngoing = true;
        },
        error => {
          const err = 'An error occurred in the request to generated the spreadsheet'
          this.alertService.error('Error', err);
          console.error(err, error);
        });
  }

  downloadSpreadsheet() {
    const uuid = this.submissionEnvelope['uuid']['uuid'];
    this.loaderService.display(true, 'This may take a moment. Please wait...');

    this.brokerService.downloadSpreadsheet(uuid).subscribe(response => {
        const filename = response['filename'];
        const newBlob = new Blob([response['data']]);
        this.saveFileService.saveFile(newBlob, filename);
        this.loaderService.display(false);
      },
      err => {
        const retry_message = 'Please retry later.';
        if (err instanceof TimeoutError) {
          this.alertService.error('Error', 'Spreadsheet download timed out. ' + retry_message, false, true);
        } else {
          console.error(err)
          this.alertService.error('Error', 'An error occurred when downloading the spreadsheet. ' + retry_message, false, true);
        }
        this.loaderService.display(false);

      });
  }

  private checkIfSpreadsheetIsUpToDate(submissionEnvelope: SubmissionEnvelope) {
    this.contentLastUpdated = submissionEnvelope['contentLastUpdated'];
    if (this.lastSpreadsheetJob && this.lastSpreadsheetJob['finishedDate']) {
      const spreadsheetGenerated = new Date(this.lastSpreadsheetJob['finishedDate']);
      const contentLastUpdatedDate = new Date(this.contentLastUpdated);
      this.spreadsheetUpToDate = spreadsheetGenerated.getTime() >= contentLastUpdatedDate.getTime();
    } else {
      this.spreadsheetUpToDate = false;
    }
  }


}
