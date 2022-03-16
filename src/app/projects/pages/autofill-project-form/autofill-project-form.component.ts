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
  geoAccessionCtrl: FormControl;
  projectInCache$: Observable<Project>;
  loading = false;
  hasDoi: boolean;
  hasGeo: boolean;

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
    this.geoAccessionCtrl = new FormControl('', Validators.compose([
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

    if (this.publicationDoiCtrl.invalid && this.geoAccessionCtrl.invalid) {
      this.publicationDoiCtrl.markAsTouched();
      this.geoAccessionCtrl.markAsTouched();
      return;
    }

    const doi = this.publicationDoiCtrl.value;
    if (this.hasDoi && doi) {
      this.doiService.importProjectUsingDoi(doi);
    }

    const geoAccession = this.geoAccessionCtrl.value;
    if (this.hasGeo && geoAccession) {
      this.geoService.importProjectUsingGeoOrSra(geoAccession);
    }
  }

  onDoiExistence($event: string) {
    this.hasDoi = $event == 'Yes' ? true : false;
    this.hasGeo = this.hasDoi && (this.hasGeo != undefined || this.hasGeo) ? false : this.hasGeo;
  }

  onGEOAccessionExistence($event: string) {
    this.hasGeo = $event == 'Yes' ? true : false;
    this.hasDoi = this.hasGeo && (this.hasDoi != undefined || this.hasDoi) ? false : this.hasDoi;
  }

  restoreProject() {
    const params = {
      restore: 'true'
    };
    this.router.navigate(['/projects', 'register'], {queryParams: params});
  }
}
