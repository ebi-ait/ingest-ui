import SpyObj = jasmine.SpyObj;
import { MatDialogRef} from "@angular/material/dialog";
import { MetadataDetailsDialogComponent } from './metadata-details-dialog.component';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {AlertService} from '@shared/services/alert.service';
import {SchemaService} from '@shared/services/schema.service';


describe('MetadataDetailsDialogComponent', () => {
  let metadataDetailsDialogComponent: MetadataDetailsDialogComponent;
  let dialogRef: SpyObj<MatDialogRef<MetadataDetailsDialogComponent>>;
  let ingestSvc: SpyObj<IngestService>;
  let loaderSvc: SpyObj<LoaderService>;
  let alertSvc: SpyObj<AlertService>;
  let schemaSvc: SpyObj<SchemaService>;
  let dialogData: any;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display', 'hide']); // todo: loader svc doesn't get called in the component, can we remove from component?
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'success']);
    ingestSvc = jasmine.createSpyObj('IngestService', ['patch', 'put']); // todo: change names of methods if needed
    schemaSvc = jasmine.createSpyObj('SchemaService', ['getUrlOfLatestSchema']); // todo: schema svc doesn't get called in the component either, can we remove from component?
    dialogData = {}

    // todo need to fix the constructor arguments here. what do I put for the route parameter?
    metadataDetailsDialogComponent = new MetadataDetailsDialogComponent(null, ingestSvc, schemaSvc, loaderSvc, alertSvc, dialogRef, dialogData);
  });

  it('should create', () => {
    expect(metadataDetailsDialogComponent).toBeTruthy();
  });


  it('component works with only schema key specified ', () => {
    // when
    dialogData = {
      'schema': 'mock value'
    }
    metadataDetailsDialogComponent.ngOnInit();

    // then
    expect(metadataDetailsDialogComponent.metadata).toBeFalsy();
    expect(metadataDetailsDialogComponent.content).toBeFalsy();
    expect(metadataDetailsDialogComponent.type).toBeFalsy();
    expect(metadataDetailsDialogComponent.id).toBeFalsy();
    expect(metadataDetailsDialogComponent.schemaUrl).toBeFalsy();
    expect(metadataDetailsDialogComponent.schema).toBeTruthy();
  });

  // todo: reword  the expectation here, I think?
  it('dialog box closes when cancel is clicked', () => {
    // when
    metadataDetailsDialogComponent.onCancel();

    //then
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('form gets saved, when save is clicked', () => {
    //todo
  });

});
