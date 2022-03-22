import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DoiService} from '@projects/services/doi.service';
import {Project} from '@shared/models/project';
import {AlertService} from '@shared/services/alert.service';
import {from, Observable} from 'rxjs';
import {ProjectCacheService} from '../../services/project-cache.service';
import {MatDialog} from "@angular/material/dialog";
import {GeoService} from "@projects/services/geo.service";

@Component({
  selector: 'app-autofill-project-form',
  templateUrl: './autofill-project-form.component.html',
  styleUrls: ['./autofill-project-form.component.css'],
  providers: [DoiService, GeoService]
})
export class AutofillProjectFormComponent implements OnInit {
  publicationDoiCtrl: FormControl;
  accessionCtrl: FormControl;
  projectInCache$: Observable<Project>;
  loading = false;
  hasDoi: boolean;
  hasAccession: boolean;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private alertService: AlertService,
              private projectCacheService: ProjectCacheService,
              private dialog: MatDialog,
              private doiService: DoiService,
              private geoService: GeoService
  ) {
  }

  ngOnInit(): void {
    this.publicationDoiCtrl = new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(/^10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i)
    ]));
    this.accessionCtrl = new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(/^(GSE|SRP|ERP).*$/i)
    ]));
    this.projectInCache$ = from(this.projectCacheService.getProject());

    this.geoService.loading.subscribe(
      loading => {
        this.loading = loading;
      }
    );
    this.doiService.loading.subscribe(
      loading => {
        this.loading = loading;
      }
    )
  }

  showError(control: FormControl, message: string): string {
    if (control.touched && control.errors) {
      const errors = control.errors;

      if (errors['required']) {
        return 'This field is required';
      }
      if (errors['pattern']) {
        return message;
      }
    }
  }

  submitForm() {
    this.alertService.clear();

    if (this.publicationDoiCtrl.invalid && this.accessionCtrl.invalid) {
      this.publicationDoiCtrl.markAsTouched();
      this.accessionCtrl.markAsTouched();
      return;
    }

    const doi = this.publicationDoiCtrl.value;
    if (this.hasDoi && doi) {
      this.doiService.importProjectUsingDoi(doi);
    }

    const accession = this.accessionCtrl.value;
    if (this.hasAccession && accession) {
      this.geoService.importProject(accession);
    }
  }

  onDoiExistence($event: string) {
    this.hasDoi = $event == 'Yes' ? true : false;
    this.hasAccession = this.hasDoi && (this.hasAccession != undefined || this.hasAccession) ? false : this.hasAccession;
  }

  onAccessionExistence($event: string) {
    this.hasAccession = $event == 'Yes' ? true : false;
    this.hasDoi = this.hasAccession && (this.hasDoi != undefined || this.hasDoi) ? false : this.hasDoi;
  }

  restoreProject() {
    const params = {
      restore: 'true'
    };
    this.router.navigate(['/projects', 'register'], {queryParams: params});
  }
}
