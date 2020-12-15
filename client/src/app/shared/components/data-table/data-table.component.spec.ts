import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataTableComponent} from './data-table.component';
import {FlattenService} from '../../services/flatten.service';
import {DataSource} from '@angular/cdk/collections';
import SpyObj = jasmine.SpyObj;
import {of} from 'rxjs';
import {PaginatedDataSource} from '../../data-sources/paginated-data-source';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;
  let dataSource: SpyObj<PaginatedDataSource<any>>;

  beforeEach(async(() => {
    dataSource = jasmine.createSpyObj('PaginatedDataSource', ['connect', 'fetch']);
    const mockedResponse = {
      'page': {
        'size': 20,
        'totalElements': 3,
        'totalPages': 1,
        'number': 0
      },
      'data': []
    };
    dataSource.connect.and.returnValue(of(mockedResponse));
    TestBed.configureTestingModule({
      declarations: [DataTableComponent],
      providers: [FlattenService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    component.dataSource = dataSource;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
