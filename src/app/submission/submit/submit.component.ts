import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Project} from '../../shared/models/project';
import {AlertService} from '../../shared/services/alert.service';
import {IngestService} from '../../shared/services/ingest.service';
import {LoaderService} from '../../shared/services/loader.service';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css']
})
export class SubmitComponent implements OnInit {
  @Input() project$: Observable<Project>;
  @Input() submissionEnvelopeId;
  @Input() submissionEnvelope$;
  @Input() submitLink: string;
  @Input() exportLink: string;
  @Input() cleanupLink: string;
  @Input() isSubmitted: boolean;
  @Input() submissionUrl: string;
  @Input() isLinkingDone: boolean;
  @Input() manifest: object;
  submitToArchives: boolean;
  submitMetadataToDcp: boolean;
  submitToDcp: boolean;
  cleanup: boolean;
  releaseDate: string;

  deleteWarning = 'The upload area cannot be deleted until the data files are submitted to Human Cell Atlas.';

  constructor(private ingestService: IngestService,
              private loaderService: LoaderService,
              private alertService: AlertService) {

    this.submitToArchives = false;
    this.submitToDcp = false;
    this.cleanup = false;
    this.submitMetadataToDcp = false;
  }

  ngOnInit() {
    this.project$.subscribe(project => {
      this.releaseDate = project.releaseDate;
    });
  }

  onSubmit() {
    const submitActions = [];

    if (this.submitToArchives) {
      submitActions.push(SubmitActions.Archive);
    }

    if (this.submitToDcp) {
      submitActions.push(SubmitActions.Export);
    }

    if (this.submitMetadataToDcp) {
      submitActions.push(SubmitActions.ExportMetadata);
    }

    if (this.cleanup) {
      submitActions.push(SubmitActions.Cleanup);
    }

    this.requestSubmit(this.submitLink, submitActions);

  }

  requestSubmit(submitLink, submitActions: string[]) {
    this.loaderService.display(true);
    this.ingestService.put(submitLink, submitActions).subscribe(
      res => {
        setTimeout(() => {
            this.alertService.clear();
            this.loaderService.display(false);
            this.alertService.success('', 'You have successfully submitted your submission envelope.');
          },
          3000);
      },
      err => {
        this.loaderService.display(false);
        this.alertService.error('', 'An error occurred on submitting your submission envelope.', true);
        console.log(err);

      }
    );
  }

  requestExport() {
    this.ingestService.put(this.exportLink, undefined)
      .subscribe(
        res => {
          setTimeout(() => {
              this.alertService.clear();
              this.loaderService.display(false);
              this.alertService.success('', 'Your submission envelope should start exporting shortly.');
            },
            3000);
        },
        err => {
          this.loaderService.display(false);
          this.alertService.error('', 'An error occurred on the request to export your submission envelope.');
          console.log(err);

        }
      );
  }

  requestCleanup() {
    const message = 'Are you sure you want to delete all data files from this submission? This cannot be undone.';

    if (confirm(message)) {
      this.ingestService.put(this.cleanupLink, undefined)
        .subscribe(
          res => {
            setTimeout(() => {
                this.alertService.clear();
                this.loaderService.display(false);
                this.alertService.success('', 'Your submission envelope upload area will now be deleted.');
              },
              3000);
          },
          err => {
            this.loaderService.display(false);
            this.alertService.error('', 'An error occurred on the request to clean up the upload area of your submission envelope.');
            console.log(err);

          }
        );
    }
  }


  getLinkingProgress(manifest) {
    if (manifest) {
      const percentage = manifest['actualLinks'] / manifest['expectedLinks'] * 100;
      return percentage || 0;
    }
    return 100;
  }

  onSubmitToDspChange() {
    if (!this.submitToDcp) {
      this.cleanup = false;
    } else {
      this.submitMetadataToDcp = false;
    }
  }

  onSubmitMetadataToDspChange() {
    this.submitToDcp = !this.submitMetadataToDcp;
    this.cleanup = !this.submitMetadataToDcp;
  }

  isSubmitAction() {
    return this.submitToDcp || this.submitMetadataToDcp || this.submitToArchives;
  }
}

enum SubmitActions {
  Archive = 'Archive',
  Export = 'Export',
  ExportMetadata = 'Export_Metadata',
  Cleanup = 'Cleanup'
}
