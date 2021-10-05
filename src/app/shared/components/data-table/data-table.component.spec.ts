import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {PaginatedDataSource} from '../../data-sources/paginated-data-source';
import {FlattenService} from '../../services/flatten.service';

import {DataTableComponent} from './data-table.component';
import SpyObj = jasmine.SpyObj;

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
