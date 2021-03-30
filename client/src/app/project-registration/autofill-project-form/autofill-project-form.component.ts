import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LoaderService} from '../../shared/services/loader.service';
import {AlertService} from '../../shared/services/alert.service';
import {Identifier} from '../models/europepmcsearch';

@Component({
  selector: 'app-doi-name-field',
  templateUrl: './autofill-project-form.component.html',
  styleUrls: ['./autofill-project-form.component.css']
})


export class AutofillProjectFormComponent implements OnInit {
  publicationDoiCtrl: FormControl;
  publicationDoi: string;

  constructor(private route: ActivatedRoute,
              private router: Router
  ) {
  }

  ngOnInit(): void {
    this.publicationDoiCtrl = new FormControl( '', Validators.required);
    this.publicationDoi = '';


    this.publicationDoiCtrl.valueChanges.subscribe(doi => {
      this.publicationDoi = doi;
    });
  }

  showError(control: FormControl): string {
    if (control.touched && control.errors) {
      const errors = control.errors;

      if (errors['required']) {
        return 'This field is required';
      }
      // todo add logic here for checking dois in existing projects and showing alerts
    }
  }

  // todo: show that the field is required when publicationDoi is empty and next is clicked
  onClick() {
    if (this.publicationDoi) {
      const params = {
        [Identifier.DOI]: this.publicationDoi
      };
      this.router.navigate(['/projects', 'new'], { queryParams: params});
    } else {
      this.router.navigate(['/projects', 'new']);
    }
  }

}
