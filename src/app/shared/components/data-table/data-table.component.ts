import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PaginatedDataSource} from '../../data-sources/paginated-data-source';
import {FlattenService} from '../../services/flatten.service';
import Utils from '../../utils';
import {PageEvent} from './ngx/page-event';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnDestroy {
  @ViewChild('datatable') table: any;

  @Input() dataSource: PaginatedDataSource<any>;
  @Input() idColumn: string;
  @Input() flatten = false;
  @Input() poll = false;
  @Input() columns: string[];

  isPaginated = true;
  rows: any[];

  constructor(private flattenService: FlattenService) {

  }

  ngOnInit() {
    this.setPage({count: 0, limit: 0, pageSize: 0, offset: 0});

    this.dataSource.connect(this.poll).subscribe(data => {
      this.rows = this.flatten ? data.data.map(row => this.flattenService.flatten(row)) : data.data;
    });
  }

  ngOnDestroy() {
    this.dataSource.disconnect();
  }

  getAllColumns(rows) {
    if (this.columns) {
      return this.columns;
    }

    const columns = {};
    rows.map(function (row) {
      Object.keys(row).map(function (col) {
        columns[col] = '';
      });
    });

    const filteredColumns = Object.keys(columns);
    filteredColumns.filter(column => {
      return (!column.match('[\[]')); // exclude attributes which are of list type
    });

    return filteredColumns;
  }

  setPage(pageEvent: PageEvent) {
    this.dataSource.fetch(pageEvent.offset, pageEvent.pageSize);
  }

  getRowId(row) {
    const id = this.idColumn ? this.idColumn : 'id';
    return row[id];
  }

  isUrl(value: string) {
    return Utils.isUrl(value);
  }
}
