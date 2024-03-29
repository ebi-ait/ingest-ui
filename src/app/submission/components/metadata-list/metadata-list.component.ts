import {Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {INVALID_FILE_TYPES, METADATA_VALIDATION_STATES} from '@shared/constants';
import {MetadataDocument} from '@shared/models/metadata-document';
import {AlertService} from '@shared/services/alert.service';
import {FlattenService} from '@shared/services/flatten.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {MetadataDetailsDialogComponent} from '@submission/components/metadata-details-dialog/metadata-details-dialog.component';

@Component({
  selector: 'app-metadata-list',
  templateUrl: './metadata-list.component.html',
  styleUrls: ['./metadata-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MetadataListComponent implements OnInit, OnDestroy {

  @ViewChild('datatable') table: any;

  @Input() title: string;
  @Input() metadataList;
  @Input() expectedCount;
  @Input() dataSource: any;
  @Input() isEditable = true;

  private _config = {
    displayContent: true,
    displayState: true,
    displayAll: false,
    displayLinking: false,
    displayColumns: [],
    hideWhenEmptyRows: false
  };

  @Input()
  get config() {
    return this._config;
  }

  set config(config: any) {
    Object.assign(this._config, config);
  }

  @Input() projectId: string;

  rows: any[];
  expandAll: boolean;
  validationStates: string[];
  METADATA_VALIDATION_STATES = METADATA_VALIDATION_STATES;

  constructor(private ingestService: IngestService,
              private flattenService: FlattenService,
              private schemaService: SchemaService,
              private loaderService: LoaderService,
              private alertService: AlertService,
              public dialog: MatDialog) {
    this.validationStates = Object.values(METADATA_VALIDATION_STATES);
  }

  ngOnDestroy() {
    this.dataSource.disconnect();
  }

  ngOnInit() {
    this.dataSource.connect(true, 5000).subscribe(data => {
      this.rows = data.data.map(row => this.flattenService.flatten(row));
      this.metadataList = data.data;
    });

    if (this.dataSource.resourceType === 'files') {
      this.validationStates = this.validationStates.concat(Object.values(INVALID_FILE_TYPES));
    }

    this.setPage({offset: 0});
  }

  getAllColumns(rows) {
    const columns = {};
    rows.map(function (row) {
      Object.keys(row).map(function (col) {
        columns[col] = '';
      });
    });

    return this.getColumns(columns);
  }

  getColumns(row) {
    let columns: any[];

    if (this.config && this.config.displayAll) {
      columns = Object.keys(row)
        .filter(column => column.match('^(?!validationState).*'));

    } else { // display only fields inside the content object
      columns = Object.keys(row)
        .filter(column => {
          return (column.match('^content.(?!core).*') &&
            !column.match('describedBy') &&
            !column.match('schema_version') &&
            !column.match('[\[]')); // exclude metadata attributes which are of list type
        });
    }

    if (this.config && this.config.displayContent) {
      columns.unshift('content.core.type');
    }

    if (this.config && this.config.displayColumns) {
      columns = columns.concat(this.config.displayColumns);
    }

    return columns;
  }

  getMetadataType(rowIndex) {
    const row = this.metadataList[rowIndex];
    const schemaId = row && row['content'] ? row['content']['describedBy'] : '';

    if (!schemaId) {
      return 'unknown';
    }

    const type = schemaId.split('/').pop();
    this.metadataList[rowIndex]['metadataType'] = type;

    return type;
  }

  getDefaultValidMessage() {
    let validMessage = '* Metadata is valid.';

    if (this.dataSource.resourceType === 'files') {
      validMessage = '* Data is valid.';
    }

    return validMessage;
  }

  getValidationErrors(row) {
    const columns = Object.keys(row)
      .filter(column => {
        return (column.match('^validationErrors.+userFriendlyMessage') || column.match('^validationErrors.+user_friendly_message'));
      });
    const errors = [];
    const count = columns.length;
    for (let i = 0; i < count; i++) {
      errors.push(`* ${row[columns[i]]}`);
    }
    return errors;
  }

  getGraphValidationErrors(row) {
    const columns = Object.keys(row)
      .filter(column => {
        return (column.match('^graphValidationErrors.+'));
      });
    const errors = [];
    const count = columns.length;
    for (let i = 0; i < count; i++) {
      errors.push(`* ${row[columns[i]]}`);
    }
    return errors;
  }

  expandAllRows() {
    this.table.rowDetail.expandAllRows();
    this.expandAll = true;
  }

  collapseAllRows() {
    this.table.rowDetail.collapseAllRows();
    this.expandAll = false;
  }

  setPage(pageInfo) {
    this.dataSource.fetch(pageInfo.offset);
  }

  filterByState(event) {
      this.dataSource.filterByState(event.value);
  }

  showFilterState() {
    return this.dataSource.resourceType !== 'bundleManifests';
  }

  onSort(event) {
    const sorts = event.sorts;

    const column = sorts[0]['prop']; // only one column sorting is supported for now
    const dir = sorts[0]['dir'];

    if (this.dataSource.resourceType === 'files') { // only sorting in files are supported for now
      this.dataSource.sortBy(column, dir);
    }
  }

  getRowId(row) {
    return row['uuid.uuid'];
  }

  openDialog(rowIndex: number): void {
    if (!this.isEditable) {
      return;
    }

    const metadata = this.metadataList[rowIndex];
    console.log('data', metadata);
    this.loaderService.display(true);
    const schemaUrl = metadata['content']['describedBy'];
    this.schemaService.getDereferencedSchema(schemaUrl)
      .subscribe(data => {
        this.loaderService.display(false);
        this.dialog.open(MetadataDetailsDialogComponent, {
          data: {metadata: metadata, schema: data},
          width: '60%',
          disableClose: true
        }).componentInstance.metadataSaved.subscribe(changedMetadata => this.saveMetadataEdits(rowIndex, changedMetadata));
      });
  }

  saveMetadataEdits(rowIndex, changedMetadata) {
    const originalDoc: MetadataDocument = this.metadataList[rowIndex];
    const patch = {'content': changedMetadata};

    this.ingestService.patch<MetadataDocument>(originalDoc._links.self.href, patch).subscribe(updatedDoc => {
      this.metadataList[rowIndex] = updatedDoc;
      this.alertService.clear();
      const msg = `${updatedDoc.type} ${updatedDoc.uuid.uuid} has been updated.`;
      this.alertService.success('Success', msg);
    }, err => {
      console.error(err);
      this.alertService.clear();
      this.alertService.error('Error',
        `${originalDoc.type} ${originalDoc.uuid.uuid} has not been updated. ${err.error?.exceptionMessage || ''}`);
    });
  }

  askDelete(rowIndex: number): void {
    if (!this.isEditable) {
      return;
    }

    const metadata: MetadataDocument = this.metadataList[rowIndex];
    if (confirm(`Are you sure you wish to delete ${metadata.type} ${metadata.uuid.uuid}?`)) {
      this.deleteMetadata(metadata);
    }
  }

  deleteMetadata(metadata: MetadataDocument): void {
    this.loaderService.display(true);
    this.ingestService.deleteMetadata(metadata._links.self.href).subscribe(() => {
      this.alertService.clear();
      this.alertService.success(
        'Success',
        `${metadata.type} ${metadata.uuid.uuid} has been successfully deleted.`
      );
      this.loaderService.display(false);
    }, error => {
      console.log(error)
      const error_message = `It was not possible to delete ${metadata.type}: ${metadata.uuid.uuid}. ${error.error?.exceptionMessage || ''}`;
      console.error(error_message, error);
      this.alertService.clear();
      this.alertService.error('Error', error_message);
      this.loaderService.display(false);
    });
  }

  toggleExpandRow(row: object, rowIndex: number) {
    this.table.rowDetail.toggleExpandRow(row);
  }
}
