import {Component, Input, OnInit} from '@angular/core';
import {Project} from "@shared/models/project";
import {AlertService} from "@shared/services/alert.service";
import {BrokerService} from "@shared/services/broker.service";
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";
import {Observable} from "rxjs";
import {FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-submit-to-scea',
  templateUrl: './submit-to-scea.component.html',
  styleUrls: ['./submit-to-scea.component.css']
})

export class SubmitToSCEAComponent implements OnInit {

  @Input() project$: Observable<Project>;
  @Input() submissionEnvelopeId;
  @Input() submissionEnvelope$;
  @Input() isSubmitted: boolean;
  @Input() submissionUrl: string;
  @Input() isLinkingDone: boolean;
  @Input() manifest: object;
  releaseDate: string;
  project_uuid: string;
  accession_num: number;
  curator: string[];
  experiment_type: string;
  factor_values: string[];
  public_release_date: string;
  hca_update_date: string;
  study_accession: string;
  test: string;
  spreadsheet: any;
  output_dir: string;
  zip_format: string;

  sceaForm = new FormGroup({
    project_uuid: new FormControl('', Validators.required),
    accession_num: new FormControl('', Validators.required),
    curator: new FormControl('', Validators.required),
    experiment_type: new FormControl('', Validators.required),
    factor_values: new FormControl('', Validators.required),
    public_release_date: new FormControl('', Validators.required),
    hca_update_date: new FormControl('', Validators.required),
    study_accession: new FormControl('', Validators.required),
  });

  constructor(private brokerService: BrokerService,
              private loaderService: LoaderService,
              private saveFileService: SaveFileService,
              private alertService: AlertService) {
  }

  ngOnInit() {
    this.project$ && this.project$.subscribe(project => {
      this.releaseDate = project.releaseDate;
    });
    const uuid = this.submissionEnvelope$['uuid']['uuid'];
    this.spreadsheet = this.brokerService.generateSpreadsheetFromSubmission(uuid);
  }

  onFilledForm() {
    this.project_uuid = this.sceaForm.get('project_uuid').value;
    this.accession_num = this.sceaForm.get('accession_num').value;
    this.curator = this.sceaForm.get('curator').value;
    this.experiment_type = this.sceaForm.get('experiment_type').value;
    this.factor_values = this.sceaForm.get('factor_values').value;
    this.public_release_date = this.sceaForm.get('public_release_date').value;
    this.hca_update_date = this.sceaForm.get('hca_update_date').value;
    this.study_accession = this.sceaForm.get('study_accession').value;
    this.output_dir = 'hca2scea_output';
    this.zip_format = 'yes';
  }

  requestConvertToSCEA() {
    console.log('requestConvertToSCEA');
    this.onFilledForm();
    this.brokerService.convertToSCEA(this.spreadsheet,this.project_uuid,this.accession_num,this.curator,
      this.experiment_type,this.factor_values,this.public_release_date,this.hca_update_date,this.study_accession,
      this.output_dir,this.zip_format)
      .subscribe(
        response => {
          setTimeout(() => {
            this.alertService.clear();
            this.loaderService.display(false);
            this.alertService.success('', 'Your dataset should start converting shortly.');
          }, 3000);

          const filename = response['filename'];
          const blob = new Blob([response['data']]);
          this.saveFileService.saveFile(blob, filename);
          this.loaderService.hide();
        },
        err => {
          this.loaderService.display(false);
          this.alertService.error('', 'An error occurred on the request to export your SCEA submission.');
          console.log(err);

        }
      );
  }
}
