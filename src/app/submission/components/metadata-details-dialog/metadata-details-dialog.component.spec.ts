import SpyObj = jasmine.SpyObj;
import { MatDialogRef} from "@angular/material/dialog";
import {IngestService} from '@shared/services/ingest.service';
import {AlertService} from '@shared/services/alert.service';
import { MetadataDetailsDialogComponent } from './metadata-details-dialog.component';


describe('MetadataDetailsDialogComponent', () => {
  let component: MetadataDetailsDialogComponent;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let dialogRef: SpyObj<MatDialogRef<MetadataDetailsDialogComponent>>;
  let mockDialogData: SpyObj<Object>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['patch', 'put']); // todo: change names of methods if needed
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'success']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
  });

  describe('DialogData Empty', () => {
    beforeEach(() => {
      component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, {});
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    //ToDo: Add test that checks that error is thrown

    it('Dialog box close should be called when cancel is clicked', () => {
      // when
      component.onCancel();

      //then
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('DialogData Edit Mode', () => {
    beforeEach(() => {
      const defaultMockDialogData = {
        metadata: {
          content: {},
          validationErrors: [],
          uuid: { uuid: '' },
          _links: { self: { href:'' } }
        },
        schema: {
          '$id': 'https://schemaService/baseType/domainEntity/version/concreteType'
        }
      }
      mockDialogData = jasmine.createSpyObj('Object',[], defaultMockDialogData);
      component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('shoulc init correctly', () => {
      //when
      component.ngOnInit();

      // then
      expect(component.content).toBeTruthy();
      expect(component.type).toBeTruthy();
      expect(component.schemaUrl).toBeTruthy();
      expect(component.schema).toBeTruthy();
    });
  });

  describe('DialogData Create Mode', () => {
    beforeEach(() => {
      const defaultMockDialogData = {
        schema: {
          '$id': 'https://schemaService/baseType/domainEntity/version/concreteType'
        },
        postUrl: ''
      }
      mockDialogData = jasmine.createSpyObj('Object',[], defaultMockDialogData);
      component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('shoulc init correctly', () => {
      //when
      component.ngOnInit();

      // then
      expect(component.content).toBeFalsy();
      expect(component.type).toBeTruthy();
      expect(component.schemaUrl).toBeTruthy();
      expect(component.schema).toBeTruthy();
    });
  });
});
