import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {AaiService} from '@app/aai/aai.service';
import {Account} from '@app/core/account';
import {BaseInputComponent} from '@metadata-schema-form/metadata-field-types/base-input/base-input.component';
import {Metadata} from '@metadata-schema-form/models/metadata';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap} from 'rxjs/operators';

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

    const wranglerId = this.control.value;
    if (wranglerId) {
      this.findWrangler(wranglerId).subscribe(wrangler => {
        this.selectedWrangler = wrangler;
      });
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

  private onSearchValueChanged(value: string | Account): Observable<Account[]> {
    const searchText = typeof value === 'string' ? value.toLowerCase() : value.name ? value.name.toLowerCase() : '';
    const emptyAccount = new Account({id: null, providerReference: null, name: 'Unassigned'});
    return this.filterWranglers(searchText).pipe(
      tap(found_wranglers => found_wranglers.unshift(emptyAccount))
    );
  }

  private filterWranglers(wranglerName: string): Observable<Account[]> {
    const lowerName = wranglerName.toLowerCase();
    return this.wranglers$.pipe(map(wranglers => wranglers.filter(wrangler => wrangler.name.toLowerCase().includes(lowerName))));
  }

  private findWrangler(accountId: string): Observable<Account> {
    return this.wranglers$.pipe(
      map(allWranglers => allWranglers.filter(wrangler => wrangler.id === accountId)),
      map(matchingWranglers => {
        if (matchingWranglers.length > 0) {
          if (matchingWranglers.length > 1) {
            let names: string[] = matchingWranglers.map(wrangler => wrangler.name ? wrangler.name : 'Missing Name');
            this.alertService.warn(
              'Multiple Wranglers Match Account',
              `Multiple wranglers (${names.join(', ')}) match the Account saved against this project: ${accountId}`
            );
          }
          return matchingWranglers[0];
        }
        this.alertService.warn(
          'No Wranglers Match Account',
          `No wranglers match the Account saved against this project: ${accountId}`
        );
      })
    );
  }

  updateControl(value: Account) {
    this.control.setValue(value.id);
    this.selectedWrangler = value;
  }
}
