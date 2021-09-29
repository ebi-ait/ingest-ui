import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {Account} from '../../../core/account';
import {IngestService} from '../../../shared/services/ingest.service';
import {OntologyService} from '../../../shared/services/ontology.service';
import ingestSchema from '../../schemas/project-ingest-schema.json';

// The maximum 32 bit integer value
const MAX_INT_VALUE = (2 ** 31) - 1;

const expValue = (value: number) => {
  if (value === 0) {
    return 0;
  }
  return Math.round(Math.exp(value));
};

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
    minCellCount: [0],
    maxCellCount: [this.maxCellCount],
    identifyingOrganism: [],
    organOntology: []
  });
  wranglers$: Observable<Account[]>;
  organs: any[];
  wranglingStates = ingestSchema['properties']['wranglingState']['enum'];
  @Output() filters: EventEmitter<object> = new EventEmitter(this.filtersForm.value);

  // The organ search input is not part of the formGroup (see ngModelOptions value in component)
  // since we don't want the search value in the form output, just the value of the selected organ ontology
  // This allows for the search value to be displayed with the full organ name and send just the ontology behind the
  // scenes
  organSearchValue = '';

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
    this.filtersForm.valueChanges.pipe(
      debounceTime(200),
      map(values => {
        values['maxCellCount'] = this.getRawCellCount(values['maxCellCount']);
        values['minCellCount'] = this.getRawCellCount(values['minCellCount']);
        return values;
      })
    ).subscribe(value => {
      this.filters.emit(value);
    });
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
    this.organSearchValue = this.formatOrgan(organ);
  }

  organSearchChange(value: string) {
    if (!value) {
      this.filtersForm.patchValue({
        organOntology: null
      });
    }

    if (typeof value !== 'string') {
      // value could be an object since this will also be called by the autocomplete dropdown when an option is selected
      // Ignore if not a string
      return;
    }
    // @ts-ignore
    this.ols.lookup(ingestSchema['properties']['organ']['properties']['ontologies']['items'], value.toLowerCase())
      .subscribe(organs => {
        this.organs = organs;
      });
  }

  formatLabel = (value: number) => {
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
