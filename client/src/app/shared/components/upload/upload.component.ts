import {Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {UploadResults} from '../../models/uploadResults';
import {AlertService} from '../../services/alert.service';
import {BrokerService} from '../../services/broker.service';
import {LoaderService} from '../../services/loader.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UploadComponent {

  @ViewChild('fileInput', {static: true}) fileInput;

  error$: Observable<String>;

  uploadResults$: Observable<UploadResults>;

  @Input() projectUuid;
  @Input() submissionUuid;
  @Input() isUpdate = false;

  @Output() fileUpload = new EventEmitter();

  constructor(private brokerService: BrokerService,
              private router: Router,
              private alertService: AlertService,
              private loaderService: LoaderService) {
  }

  upload() {
    const fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      this.loaderService.display(true);
      const formData = new FormData();
      formData.append('file', fileBrowser.files[0]);

      if (this.projectUuid) {
        formData.append('projectUuid', this.projectUuid);
      }

      if (this.submissionUuid) {
        formData.append('submissionUuid', this.submissionUuid);
      }

      this.brokerService.uploadSpreadsheet(formData, this.isUpdate).subscribe({
        next: data => {
          this.uploadResults$ = <any>data;
          const submissionUuid = this.uploadResults$['details']['submission_uuid'];
          this.loaderService.display(false);
          this.alertService.success('Upload Success', this.uploadResults$['message'], true, true);
          this.router.navigate(['/submissions/detail'], {queryParams: {uuid: submissionUuid, project: this.projectUuid}});
        },
        error: err => {
          this.error$ = <any>err;
          this.alertService.error(this.error$['message'], this.error$['details']);
          this.loaderService.display(false);
        }
      });
    } else {
      this.alertService.clear();
      this.alertService.error('No file chosen!', 'Please choose a spreadsheet to upload.', false, true);
    }
  }
}
