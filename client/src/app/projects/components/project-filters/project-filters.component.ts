import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Observable} from 'rxjs';
import {Account} from '../../../core/account';
import {IngestService} from '../../../shared/services/ingest.service';
import ingestSchema from '../../schemas/project-ingest-schema.json';

@Component({
  selector: 'app-project-filters',
  templateUrl: './project-filters.component.html',
  styleUrls: ['./project-filters.component.css']
})
export class ProjectFiltersComponent implements OnInit {
  filtersForm = this.fb.group({
    search: [],
    searchType: ['AllKeywords'],
    wranglingStatus: [],
    wrangler: [],
    priority: [1],
    hcaPublication: [],
    cellCount: [0],
    species: []
  });
  wranglers$: Observable<Account[]>;
  wranglingStates = ingestSchema['properties']['wranglingState']['enum'];
  @Output() filters: EventEmitter<object> = new EventEmitter(this.filtersForm.value);

  constructor(private fb: FormBuilder, private ingestService: IngestService) { }

  ngOnInit(): void {
    this.wranglers$ = this.ingestService.getWranglers();
    this.filtersForm.valueChanges.subscribe(value => {
      this.filters.emit(value);
    });
  }

  transformWranglingState(wranglingState: String) {
    return wranglingState.replace(/\s+/g, '_').toUpperCase();
  }
}
