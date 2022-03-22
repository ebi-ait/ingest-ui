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
  @Input() submissionEnvelope$;
  releaseDate: string;

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
    this.params_object = {
      spreadsheet: this.spreadsheet,
      project_uuid: this.sceaForm.get('project_uuid').value,
      accession_number: this.sceaForm.get('accession_num').value,
      curators: this.sceaForm.get('curator').value,
      experiment_type: this.sceaForm.get('experiment_type').value,
      experimental_factors: this.sceaForm.get('factor_values').value,
      public_release_date: this.sceaForm.get('public_release_date').value,
      hca_update_date: this.sceaForm.get('hca_update_date').value,
      output_dir: 'hca2scea_output',
      zip_format: 'yes'
    };
  }

  requestConvertToSCEA() {
    console.log('requestConvertToSCEA');
    this.onFilledForm();
    this.brokerService.convertToSCEA(this.params_object)
      .subscribe(
        response => {
          const filename = response['filename'];
          const blob = new Blob([response['data']]);
          this.saveFileService.saveFile(blob, filename);
          this.loaderService.hide();
        },
        err => {
          this.loaderService.display(false);
          this.alertService.error('', 'An error occurred on the request to convert your HCA dataset to SCEA format.');
          console.log(err);

        }
      );
  }
}
