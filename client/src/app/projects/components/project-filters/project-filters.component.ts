import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {isNil} from 'lodash';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Account} from '../../../core/account';
import {IngestService} from '../../../shared/services/ingest.service';
import {OntologyService} from '../../../shared/services/ontology.service';
import {ProjectFilters} from '../../models/project-filters';
import ingestSchema from '../../schemas/project-ingest-schema.json';

// The maximum 32 bit integer value
const MAX_INT_VALUE = (2 ** 31) - 1;

@Component({
  selector: 'app-project-filters',
  templateUrl: './project-filters.component.html',
  styleUrls: ['./project-filters.component.css']
})
export class ProjectFiltersComponent implements OnInit {
  maxCellCount = Math.log(MAX_INT_VALUE);
  filtersForm = this.fb.group({
    search: [],
    searchType: ['AllKeywords'],
    wranglingState: [],
    primaryWrangler: [],
    wranglingPriority: [],
    hasOfficialHcaPublication: [],
    minCellCount: [{value: 0, disabled: true}],
    maxCellCount: [{value: this.maxCellCount, disabled: true}],
    identifyingOrganism: [],
    organOntology: [],

    // UI controls that are not part of the output of this component
    controlsForm: this.fb.group({
      filterByCellCount: [false],
      organSearchValue: ['']
    })
  });

  wranglers$: Observable<Account[]>;
  organs$: Observable<any[]>;
  wranglingStates = ingestSchema['properties']['wranglingState']['enum'];
  @Output() filters: EventEmitter<ProjectFilters> = new EventEmitter(this.filtersForm.value);

  isExpanded = false;

  constructor(private fb: FormBuilder, private ingestService: IngestService, private ols: OntologyService) { }

  getRawCellCount(value: number) {
    if (value === 0) {
      return 0;
    }
    return Math.round(Math.exp(value));
  }

  ngOnInit(): void {
    this.wranglers$ = this.ingestService.getWranglers();

    this.organs$ = this.filtersForm.get('controlsForm').valueChanges.pipe(
      debounceTime(100),
      tap(({ filterByCellCount }) => this.toggleFilterByCellCount(filterByCellCount)),
      tap(({ organSearchValue }) => {
        if (!organSearchValue) {
          // Clear ontology value if search value is cleared
          this.filtersForm.patchValue({organOntology: ''});
        }
      }),
      switchMap(({ organSearchValue }) => this.fetchOrgans(organSearchValue))
    );

    this.filtersForm.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(200),
      map(values => {
        ['maxCellCount', 'minCellCount'].forEach(value => {
          if (!isNil(values[value])) {
            values[value] = this.getRawCellCount(values[value]);
          }
        });
        // Remove values that are not part of ProjectFilters
        delete values.controlsForm;
        return values;
      })
    ).subscribe(value => {
      this.filters.emit(value);
    });
  }

  toggleFilterByCellCount(enabled = false) {
    ['maxCellCount', 'minCellCount'].forEach(control => this.filtersForm.controls[control][enabled ? 'enable' : 'disable']());
  }

  fetchOrgans(organSearchValue: string): Observable<any> {
    return this.ols.lookup(
      // @ts-ignore
      ingestSchema['properties']['organ']['properties']['ontologies']['items'],
      organSearchValue.toLowerCase()
    );
  }

  transformWranglingState(wranglingState: String) {
    return wranglingState.replace(/\s+/g, '_').toUpperCase();
  }

  toggleFilters(): void {
    this.isExpanded = !this.isExpanded;
  }

  onClearSearch() {
    this.filtersForm.patchValue({search: null});
  }

  formatOrgan(organ: any) {
    return `${organ.ontology_label} (${organ.ontology})`;
  }

  onOrganSelected($event: MatAutocompleteSelectedEvent) {
    // Fill the organ search input with value that is shown in the dropdown
    const organ = $event.option.value;
    this.filtersForm.patchValue({
      organOntology: organ.ontology
    });
    this.filtersForm.get('controlsForm').patchValue({organSearchValue: this.formatOrgan(organ)});
  }

  formatCellCountLabel = (value: number) => {
    const rawValue = this.getRawCellCount(value);
    const ONE_MILLION = 10 ** 6;
    if (rawValue >= ONE_MILLION) {
      return Math.round(rawValue / ONE_MILLION) + 'M';
    }
    if (rawValue >= 1000) {
      return Math.round(rawValue / 1000) + 'k';
    }

    return rawValue;
  }
}
