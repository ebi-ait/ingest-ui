import SpyObj = jasmine.SpyObj;
import {EventEmitter} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MetadataDocument} from '@shared/models/metadata-document';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {MetadataDetailsDialogComponent} from '@submission/components/metadata-details-dialog/metadata-details-dialog.component';
import {MetadataCreationComponent} from '@submission/components/metadata-new/metadata-new.component';
import {of} from 'rxjs';

describe('MetadataCreationComponent', () => {
  let component: MetadataCreationComponent;
  let fixture: ComponentFixture<MetadataCreationComponent>;

  let ingestSvc: SpyObj<IngestService>;
  let brokerSvc: SpyObj<BrokerService>;
  let schemaSvc: SpyObj<SchemaService>;
  let loaderSvc: SpyObj<LoaderService>;
  let alertSvc: SpyObj<AlertService>;
  let dialogSvc: SpyObj<MatDialog>;
  let dialogRefSvc: SpyObj<MatDialogRef<MetadataDetailsDialogComponent>>;
  let detailsDialogSvc: SpyObj<MetadataDetailsDialogComponent>;
  let eventEmitterSvc: SpyObj<EventEmitter<any>>;

  let brokerConcreteTypes: any;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['post', 'linkProjectToMetadata']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['getConcreteTypes']);
    schemaSvc = jasmine.createSpyObj('SchemaService', ['getDereferencedSchema']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'success']);
    dialogSvc = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefSvc = jasmine.createSpyObj('MatDialogRef', [], {'componentInstance': detailsDialogSvc});
    detailsDialogSvc = jasmine.createSpyObj('MetadataDetailsDialogComponent', [], {'metadataSaved': eventEmitterSvc});
    eventEmitterSvc = jasmine.createSpyObj('EventEmitter', ['subscribe', 'emit']);
    brokerConcreteTypes = {'domain': 'url/to/domain'};

    brokerSvc.getConcreteTypes.and.returnValue(of(brokerConcreteTypes));
    schemaSvc.getDereferencedSchema.and.returnValue(of({}));
    dialogSvc.open.and.returnValue(dialogRefSvc);

    TestBed.configureTestingModule({
      declarations: [MetadataCreationComponent],
      providers: [
        {provide: IngestService, useValue: ingestSvc},
        {provide: BrokerService, useValue: brokerSvc},
        {provide: SchemaService, useValue: schemaSvc},
        {provide: LoaderService, useValue: loaderSvc},
        {provide: AlertService, useValue: alertSvc},
        {provide: MatDialog, useValue: dialogSvc},
        {provide: MatDialogRef, useValue: dialogRefSvc},
        {provide: MetadataDetailsDialogComponent, useValue: detailsDialogSvc},
        {provide: EventEmitter, useValue: eventEmitterSvc}
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MetadataCreationComponent);
    component = fixture.componentInstance;
    component.domainEntity = 'DOMAIN';
    component.projectId = 'projectId';
    component.postUrl = 'postUrl';
    spyOn(component.metadataAdded, 'emit');
    fixture.detectChanges();
  });

  it('should init', () => {
    // given
    const expectedTypes = [{
      name: 'domain',
      schemaUrl: 'url/to/domain'
    }];

    // when
    component.ngOnInit();

    // then
    expect(component.domainEntity).toEqual('domain');
    expect(component.label).toEqual('Add new Domain');
    expect(component.concreteTypes).toEqual(expectedTypes);
  });

  it('should open dialog on chooseType', () => {
    //when
    component.chooseType('url/to/domain');

    //then
    expect(schemaSvc.getDereferencedSchema).toHaveBeenCalledOnceWith('url/to/domain');
    expect(dialogSvc.open).toHaveBeenCalledTimes(1);
  });

  it('should save additions ', () => {
    const new_content = {
      describedBy: 'schemaUrl',
      newKey: 'newData'
    };
    const mockDoc: MetadataDocument = {
      content: new_content,
      type: 'Test Type',
      uuid: {uuid: 'uuid'},
      _links: {self: {href: 'metadataUri'}},
      submissionDate: 'submissionDate',
      updateDate: 'updateDate',
      lastModifiedUser: 'lastModifiedUser',
      events: [],
      dcpVersion: 'dcpVersion',
      validationState: 'validationState',
      validationErrors: [],
      isUpdate: false
    };
    ingestSvc.post.and.returnValue(of(mockDoc));
    ingestSvc.linkProjectToMetadata.and.returnValue(of({}));

    //when
    component.saveNewMetadata(new_content);

    //then
    expect(ingestSvc.post).toHaveBeenCalledOnceWith('postUrl', {'content': new_content});
    expect(ingestSvc.linkProjectToMetadata).toHaveBeenCalledOnceWith('metadataUri', 'projectId');
    expect(alertSvc.clear).toHaveBeenCalledTimes(1);
    expect(alertSvc.success).toHaveBeenCalledTimes(1);
    expect(component.metadataAdded.emit).toHaveBeenCalledOnceWith(mockDoc);
  });

});
