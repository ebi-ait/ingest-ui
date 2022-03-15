import {Component, Input, OnInit} from '@angular/core';
import {Project} from "@shared/models/project";
import {AlertService} from "@shared/services/alert.service";
import {IngestService} from "@shared/services/ingest.service";
import {LoaderService} from "@shared/services/loader.service";
import {Observable} from "rxjs";
import {FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'app-submit-to-scea',
  templateUrl: './submit-to-scea.component.html',
  styleUrls: ['./submit-to-scea.component.css']
})

export class SubmitToSCEAComponent implements OnInit {

  @Input() project$: Observable<Project>;
  @Input() submissionEnvelopeId;
  @Input() submissionEnvelope$;
  @Input() submitLink: string;
  @Input() convertLinkSCEA: string;
  @Input() isSubmitted: boolean;
  @Input() submissionUrl: string;
  @Input() isLinkingDone: boolean;
  @Input() manifest: object;
  releaseDate: string;
  project_uuid: string;
  accession_num: string;
  curator: string;
  experiment_type: string;
  factor_values: string;
  public_release_date: string;
  hca_release_date: string;
  study_accession: string;
  test: string;

  sceaForm = new FormGroup({
    project_uuid: new FormControl(''),
    accession_num: new FormControl(''),
    curator: new FormControl(''),
    experiment_type: new FormControl(''),
    factor_values: new FormControl(''),
    public_release_date: new FormControl(''),
    hca_release_date: new FormControl(''),
    study_accession: new FormControl(''),
  });

  constructor(private ingestService: IngestService,
              private loaderService: LoaderService,
              private alertService: AlertService) {
  }

  ngOnInit() {
    this.project$ && this.project$.subscribe(project => {
      this.releaseDate = project.releaseDate;
    });
  }

  onFilledForm() {

    this.project_uuid = this.sceaForm.get('project_uuid').value;
    this.accession_num = this.sceaForm.get('accession_num').value;
    this.curator = this.sceaForm.get('curator').value;
    this.experiment_type = this.sceaForm.get('experiment_type').value;
    this.factor_values = this.sceaForm.get('factor_values').value;
    this.public_release_date = this.sceaForm.get('public_release_date').value;
    this.hca_release_date = this.sceaForm.get('hca_release_date').value;
    this.study_accession = this.sceaForm.get('study_accession').value;

  }

  requestConvertToSCEA() {
    this.ingestService.put(this.convertLinkSCEA, undefined)
      .subscribe(
        res => {
          setTimeout(() => {
              this.alertService.clear();
              this.loaderService.display(false);
              this.alertService.success('', 'Your dataset should start converting shortly.');
            },
            3000);
        },
        err => {
          this.loaderService.display(false);
          this.alertService.error('', 'An error occurred on the request to export your SCEA submission.');
          console.log(err);

        }
      );
  }
}
