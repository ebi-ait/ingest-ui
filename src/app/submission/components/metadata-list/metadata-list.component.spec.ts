import SpyObj = jasmine.SpyObj;
import {EventEmitter} from '@angular/core';
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
  let detailsDialogSvc: SpyObj<MetadataDetailsDialogComponent>;
  let dataSourceSvc: SpyObj<any>;
  let eventEmitterSvc: SpyObj<EventEmitter<any>>;

  let mockContent: any;
  let mockDoc: any;
  let mockData: any;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['patch', 'post', 'deleteMetadata']);
    flattenSvc = jasmine.createSpyObj('FlattenService', ['flatten']);
    schemaSvc = jasmine.createSpyObj('SchemaService', ['getUrlOfLatestSchema', 'getDereferencedSchema']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'success']);
    dialogSvc = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefSvc = jasmine.createSpyObj('MatDialogRef', [], {'componentInstance': detailsDialogSvc});
    detailsDialogSvc = jasmine.createSpyObj('MetadataDetailsDialogComponent', [], {'metadataSaved': eventEmitterSvc});
    eventEmitterSvc = jasmine.createSpyObj('EventEmitter', ['subscribe', 'emit']);
    dataSourceSvc = jasmine.createSpyObj(['connect', 'disconnect', 'fetch', 'sortBy', 'filterByState'], {'resourceType': ''});
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
    dataSourceSvc.connect.and.returnValue(of(mockData));

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
        {provide: MetadataDetailsDialogComponent, useValue: detailsDialogSvc},
        {provide: EventEmitter, useValue: eventEmitterSvc}
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MetadataListComponent);
    component = fixture.componentInstance;
    component.dataSource = dataSourceSvc;
    spyOn(component.metadataUpdated, 'emit');
    spyOn(component.metadataRemoved, 'emit');
    fixture.detectChanges();
  });

  it('should open dialog ', () => {
    //when
    component.openDialog(0);

    //then
    expect(schemaSvc.getDereferencedSchema).toHaveBeenCalledOnceWith('schemaUrl');
    expect(dialogSvc.open).toHaveBeenCalledTimes(1);
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
    expect(component.metadataUpdated.emit).toHaveBeenCalledOnceWith(mockDoc);
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
    expect(component.metadataRemoved.emit).toHaveBeenCalledOnceWith(mockDoc);
  });
});
