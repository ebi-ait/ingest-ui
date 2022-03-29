import SpyObj = jasmine.SpyObj;
import {EventEmitter, Output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AlertService} from '@shared/services/alert.service';
import {FlattenService} from '@shared/services/flatten.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {MetadataDetailsDialogComponent} from '@submission/components/metadata-details-dialog/metadata-details-dialog.component';
import {MetadataListComponent} from '@submission/components/metadata-list/metadata-list.component';
import {of} from 'rxjs';

export class FakeMetadataDetailsDialogComponent implements Partial<MetadataDetailsDialogComponent> {
  @Output()
  metadataSaved = new EventEmitter<any>();
}

describe('MetadataListComponent', () => {
  let component: MetadataListComponent;
  let fixture: ComponentFixture<MetadataListComponent>;

  let ingestSvc: SpyObj<IngestService>;
  let flattenSvc: SpyObj<FlattenService>;
  let schemaSvc: SpyObj<SchemaService>;
  let loaderSvc: SpyObj<LoaderService>;
  let alertSvc: SpyObj<AlertService>;
  let dialogSvc: SpyObj<MatDialog>;
  let dialogRefSvc: SpyObj<MatDialogRef<MetadataDetailsDialogComponent>>;
  let fakeDialogComponent: FakeMetadataDetailsDialogComponent;
  let dataSourceSvc: SpyObj<any>;

  let mockContent: any;
  let mockDoc: any;
  let mockData: any;

  beforeEach(() => {
    fakeDialogComponent = new FakeMetadataDetailsDialogComponent();
    ingestSvc = jasmine.createSpyObj('IngestService', ['patch', 'post', 'deleteMetadata']);
    flattenSvc = jasmine.createSpyObj('FlattenService', ['flatten']);
    schemaSvc = jasmine.createSpyObj('SchemaService', ['getUrlOfLatestSchema', 'getDereferencedSchema']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'success']);
    dialogSvc = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefSvc = jasmine.createSpyObj('MatDialogRef', [], {'componentInstance': fakeDialogComponent});
    dataSourceSvc = jasmine.createSpyObj(['connect', 'disconnect', 'fetch', 'sortBy', 'filterByState'], {'resourceType': ''});

    TestBed.configureTestingModule({
      declarations: [MetadataListComponent],
      providers: [
        {provide: IngestService, useValue: ingestSvc},
        {provide: FlattenService, useValue: flattenSvc},
        {provide: SchemaService, useValue: schemaSvc},
        {provide: LoaderService, useValue: loaderSvc},
        {provide: AlertService, useValue: alertSvc},
        {provide: MatDialog, useValue: dialogSvc},
        {provide: MatDialogRef, useValue: dialogRefSvc},
        {provide: MetadataDetailsDialogComponent, useValue: fakeDialogComponent},
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(MetadataListComponent);
    component = fixture.componentInstance;

    mockContent = {
      describedBy: 'schemaUrl'
    };
    mockDoc = {
      content: mockContent,
      type: 'Test Type',
      uuid: {uuid: 'uuid'},
      _links: {self: {href: 'metadataUri'}}
    };
    mockData = {
      data: [mockDoc]
    };
    schemaSvc.getDereferencedSchema.and.returnValue(of({}));
    dialogSvc.open.and.returnValue(dialogRefSvc);
    //Object.getOwnPropertyDescriptor(dialogRefSvc, 'componentInstance').get().and.returnValue(fakeDialogComponent)
    dataSourceSvc.connect.and.returnValue(of(mockData));
    component.dataSource = dataSourceSvc;

    fixture.detectChanges();
  });

  it('should open dialog ', () => {
    //Given
    spyOn(component, 'saveMetadataEdits');
    const new_content = {
      describedBy: 'schemaUrl',
      newKey: 'newData'
    };

    //when
    component.openDialog(0);
    fakeDialogComponent.metadataSaved.emit(new_content);

    //then
    expect(schemaSvc.getDereferencedSchema).toHaveBeenCalledOnceWith('schemaUrl');
    expect(dialogSvc.open).toHaveBeenCalledTimes(1);
    expect(component.saveMetadataEdits).toHaveBeenCalledOnceWith(0, new_content);
  });

  it('should save edits ', () => {
    const new_content = {
      describedBy: 'schemaUrl',
      newKey: 'newData'
    };
    mockDoc['content'] = new_content;
    ingestSvc.patch.and.returnValue(of(mockDoc));

    //when
    component.saveMetadataEdits(0, new_content);

    //then
    expect(ingestSvc.patch).toHaveBeenCalledOnceWith('metadataUri', {'content': new_content});
    expect(component.metadataList[0]).toEqual(mockDoc);
    expect(alertSvc.clear).toHaveBeenCalledTimes(1);
    expect(alertSvc.success).toHaveBeenCalledTimes(1);
  });

  it('should delete with delete ', () => {
    ingestSvc.deleteMetadata.and.returnValue(of({}));

    //when
    component.delete(0);

    //then
    expect(ingestSvc.deleteMetadata).toHaveBeenCalledOnceWith('metadataUri');
    expect(alertSvc.clear).toHaveBeenCalledTimes(1);
    expect(alertSvc.success).toHaveBeenCalledTimes(1);
    expect(loaderSvc.display).toHaveBeenCalledTimes(2);
  });
});
