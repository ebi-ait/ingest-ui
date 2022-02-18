import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {INVALID_FILE_TYPES, METADATA_VALIDATION_STATES} from "@shared/constants";
import { startCase, toLower } from 'lodash';

interface Summary {
  count: number;
  textOne: string;
  textMany: string;
  validationState: string;
}

@Component({
  selector: 'app-entity-validation-summary',
  templateUrl: './entity-validation-summary.component.html',
  styleUrls: ['./entity-validation-summary.component.scss']
})
export class EntityValidationSummaryComponent implements OnInit, OnChanges {

  @Input() source: string;
  @Input() summaries: Summary[];
  @Output() errorClick = new EventEmitter<{  source: string, validationState: string }>()

  title: string;
  totalInvalid: number;

  constructor() { }

  ngOnInit(): void {
    this.title = startCase(toLower(this.source));
    this.computeTotalInvalid();
  }

  ngOnChanges(changes:SimpleChanges): void {
    this.computeTotalInvalid();
  }

  computeTotalInvalid() {
    this.totalInvalid = this.summaries.reduce((prev, cur) => prev + cur.count, 0)
  }

  onErrorClick(source: string, validationState: string) {
    this.errorClick.emit({ source, validationState });
  }

}
