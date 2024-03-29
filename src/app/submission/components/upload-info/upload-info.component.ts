import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-upload-info',
  templateUrl: './upload-info.component.html',
  styleUrls: ['./upload-info.component.css']
})
export class UploadInfoComponent implements OnInit {

  @Input() submissionEnvelope;
  uploadDetails: Object;

  constructor() { }

  ngOnInit() {
    this.uploadDetails = this.submissionEnvelope['stagingDetails'];
  }
}
