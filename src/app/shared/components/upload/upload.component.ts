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

  updateProject: boolean = false;

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

      const params = {};
      if (this.projectUuid) {
        formData.append('projectUuid', this.projectUuid);
        params['projectUuid'] = this.projectUuid;
      }

      if (this.submissionUuid) {
        formData.append('submissionUuid', this.submissionUuid);
        params['submissionUuid'] = this.submissionUuid;
      }

      params['isUpdate'] = this.isUpdate;
      params['updateProject'] = this.updateProject;
      formData.append('params', JSON.stringify(params));

      this.brokerService.uploadSpreadsheet(formData).subscribe({
        next: data => {
          this.uploadResults$ = <any>data;
          const submissionUuid = this.uploadResults$['details']['submission_uuid'];
          this.alertService.success('Upload Success', this.uploadResults$['message'], true, true);
          this.router.navigate(['/submissions/detail'], {queryParams: {uuid: submissionUuid, project: this.projectUuid}});
          this.loaderService.display(false);
          fileBrowser.value = '';
        },
        error: err => {
          this.loaderService.display(false);
          this.error$ = <any>err;
          this.alertService.error(this.error$['message'], this.error$['details']);
        }
      });
    } else {
      this.alertService.clear();
      this.alertService.error('No file chosen!', 'Please choose a spreadsheet to upload.', false, true);
    }
  }
}
