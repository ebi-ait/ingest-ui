import {Component, OnInit} from '@angular/core';
import {Ontology} from '../../../shared/models/ontology';
import {FormControl} from '@angular/forms';
import {OntologyService} from '../../../shared/services/ontology.service';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {debounceTime, distinctUntilChanged, filter, startWith, switchMap} from 'rxjs/operators';
import {BaseInputComponent} from '../base-input/base-input.component';
import {MetadataFormService} from '../../metadata-form.service';

@Component({
  selector: 'app-ontology-base',
  template: ``,
  styleUrls: ['./ontology-base.component.css']
})
export class OntologyBaseComponent extends BaseInputComponent implements OnInit {
  searchControl: FormControl;
  options$: Observable<Ontology[]>;
  olsUrl: string = environment.OLS_URL;

  constructor(protected ols: OntologyService, protected metadataFormService: MetadataFormService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    const value: Ontology = this.metadataFormService.cleanFormData(this.control.value);
    this.searchControl = this.createSearchControl(value);
    // noinspection JSDeprecatedSymbols false-positive see: ReactiveX/rxjs#4772
    this.options$ = this.searchControl.valueChanges
      .pipe(
        startWith(this.searchControl.value ? this.searchControl.value : ''),
        filter(text => text.length === 0 || text.length > 2),
        debounceTime(10),
        distinctUntilChanged(),
        switchMap(newSearch => this.onSearchValueChanged(newSearch))
      );
  }

  createSearchControl(value: Ontology) {
    return new FormControl({
      value: value && value.ontology_label ? value : '',
      disabled: this.metadata.isDisabled
    });
  }

  displayOntology(ontology: Ontology | string) {
    if (typeof ontology === 'string') {
      return '';
    }
    return ontology && ontology.ontology_label && ontology.ontology ? `${ontology.ontology_label} (${ontology.ontology})` : '';
  }

  onSearchValueChanged(value: string | Ontology): Observable<Ontology[]> {
    const searchText = typeof value === 'string' ? value.toLowerCase() :
      value.ontology_label ? value.ontology_label.toLowerCase() : '';
    this.control.markAllAsTouched();
    return this.ols.lookup(this.metadata.schema, searchText);
  }

}
