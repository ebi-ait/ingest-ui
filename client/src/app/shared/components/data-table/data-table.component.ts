import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Page} from '../../models/page';
import {FlattenService} from '../../services/flatten.service';
import {PageEvent} from './ngx/page-event';
import {DataSource} from './data-source/data-source';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  @ViewChild('datatable') table: any;

  @Input() dataSource: DataSource<any>;
  @Input() rows = [];
  @Input() columns: string[];
  @Input() idColumn: string;
  @Input() flatten = false;

  page: Page = {
    number: 0,
    size: 0,
    sort: '',
    totalElements: 0,
    totalPages: 0
  };

  isPaginated = true;
  currentPageInfo: {};
  isLoading = false;

  constructor(private flattenService: FlattenService) {
    this.page.number = 0;
    this.page.size = 20;
  }

  ngOnInit() {
    this.setPage({count: 0, limit: 0, pageSize: 0, offset: 0});
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
    this.currentPageInfo = pageEvent;
    this.fetchData({page: pageEvent.offset});
  }

  getRowId(row) {
    const id = this.idColumn ? this.idColumn : 'id';
    return row[id];
  }

  isUrl(value: string) {
    try {
      const url = new URL(value);
    } catch (_) {
      return false;
    }
    return true;
  }

  private fetchData(params) {
    if (this.dataSource) {
      this.isLoading = true;
      return this.dataSource.fetchData(params).subscribe(
        data => {
          this.isLoading = false;
          this.rows = this.flatten ? data.data.map(row => this.flattenService.flatten(row)) : data.data;
          this.page = data.page;
        }
      );
    } else {
      this.rows = this.flatten ? this.rows.map(this.flattenService.flatten) : this.rows;
      this.page.size = 20;
      this.page.totalElements = this.rows.length;
    }
  }
}
