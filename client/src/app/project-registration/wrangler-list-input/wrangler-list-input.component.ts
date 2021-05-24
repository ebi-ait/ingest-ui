import {Component, Input, OnInit} from '@angular/core';
import {BaseInputComponent} from '../../metadata-schema-form/metadata-field-types/base-input/base-input.component';
import {Observable, of} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, startWith, switchMap} from 'rxjs/operators';
import {IngestService} from '../../shared/services/ingest.service';
import {AaiService} from '../../aai/aai.service';
import {Metadata} from '../../metadata-schema-form/models/metadata';
import {FormControl} from '@angular/forms';
import {Account} from '../../core/account';
import {AlertService} from '../../shared/services/alert.service';

@Component({
  selector: 'app-wrangler-list-input',
  templateUrl: './wrangler-list-input.component.html',
  styleUrls: ['./wrangler-list-input.component.css']
})
export class WranglerListInputComponent extends BaseInputComponent implements OnInit {
  @Input() metadata: Metadata;
  @Input() control: FormControl;
  @Input() id: string;

  searchControl: FormControl;
  options$: Observable<Account[]>;
  defaultOption: Account;

  wranglers$: Observable<Account[]>;
  selectedWrangler: Account;

  constructor(private ingestService: IngestService,
              private aaiService: AaiService,
              private alertService: AlertService) {
    super();
    super.metadata = this.metadata;
    super.control = this.control;
    super.id = this.id;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setDefaultWrangler();
    this.searchControl = this.createSearchControl(this.control.value);
    this.wranglers$ = this.ingestService.getWranglers();
    this.options$ = this.searchControl.valueChanges
      .pipe(
        startWith(this.searchControl.value ? this.searchControl.value : ''),
        filter(text => text.length === 0 || text.length > 2),
        debounceTime(10),
        distinctUntilChanged(),
        switchMap(newSearch => this.onSearchValueChanged(newSearch))
      );

    const wrangler = this.control.value;
    if (wrangler) {
      this._filter(wrangler).subscribe(
        wranglers => {
          if (wranglers.length === 1) {
            this.selectedWrangler = wranglers[0];
          } else {
            this.alertService.error('Error', 'The wrangler for this project could not be identified.' +
              ' Please email hca-ingest-dev@ebi.ac.uk .');
          }
        }
      );
    }

  }

  createSearchControl(value: string) {
    return new FormControl({
      value: value,
      disabled: this.metadata.isDisabled
    });
  }

  displayWranglerName(wrangler: Account) {
    return wrangler ? wrangler.name : '';
  }

  private getWranglerNames(): Observable<string[]> {
    return this.ingestService.getWranglers().pipe(
      map(wranglers => wranglers?.map(wrangler => wrangler.name)));
  }

  private setDefaultWrangler() {
    // TODO set current account as default wrangler
  }

  private onSearchValueChanged(value: string | Account): Observable<Account[]> {
    const searchText = typeof value === 'string' ? value.toLowerCase() : value.name ? value.name.toLowerCase() : '';
    return this._filter(searchText);
  }

  private _filter(name_or_id: string): Observable<Account[]> {
    const filterValue = name_or_id.toLowerCase();
    return this.wranglers$.pipe(
      map(wranglers => wranglers.filter(wrangler => {
          return wrangler.name.toLowerCase().indexOf(filterValue) === 0 || wrangler.id === name_or_id;
        })
      )
    );
  }

  updateControl(value: Account) {
    this.control.setValue(value.id);
    this.selectedWrangler = value;
  }
}
