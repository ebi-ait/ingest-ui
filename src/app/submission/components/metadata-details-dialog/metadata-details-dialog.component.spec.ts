import SpyObj = jasmine.SpyObj;
import {MatDialogRef} from '@angular/material/dialog';
import {MetadataFormComponent} from '@metadata-schema-form/metadata-form/metadata-form.component';
import {AlertService} from '@shared/services/alert.service';
import {MetadataDetailsDialogComponent} from './metadata-details-dialog.component';

describe('MetadataDetailsDialogComponent', () => {
  let component: MetadataDetailsDialogComponent;
  let alertSvc: SpyObj<AlertService>;
  let dialogRef: SpyObj<MatDialogRef<MetadataDetailsDialogComponent>>;
  let mockMetadataFormComponent: SpyObj<MetadataFormComponent>;
  let mockDialogData: SpyObj<Object>;

  newComponentFromDialogData = (dialogData: Object) => {
    if (Object.keys(dialogData).length > 0) {
      mockDialogData = jasmine.createSpyObj('Object', [], dialogData);
      component = new MetadataDetailsDialogComponent(alertSvc, dialogRef, mockDialogData);
    } else {
      component = new MetadataDetailsDialogComponent(alertSvc, dialogRef, {});
    }
    component.metadataFormComponent = mockMetadataFormComponent;
    spyOn(component.metadataSaved, 'emit');
  }

  beforeEach(() => {
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'success']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockMetadataFormComponent = jasmine.createSpyObj('MetadataFormComponent', ['getFormData']);
  });

  describe('DialogData Empty', () => {
    beforeEach(() => {
      newComponentFromDialogData({});
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should log error and close when no schema is passed', () => {
      // when
      component.ngOnInit();

      //then
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
      expect(alertSvc.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('DialogData Schema Detection',() => {
    const schema_url_1 = 'https://schemaService/type/domainEntity/version/concreteType';
    const schema_url_2 = 'https://schemaService/type/domainEntity/itsatrap/version/concreteType';

    function defaultMetadata(schema_url: string) {
      return {
        content: {
          describedBy: schema_url,
          schema_type: 'domainEntity',
        },
        validationErrors: [],
        uuid: {uuid: ''},
        _links: {self: {href: ''}}
      };
    }

    [{
      schema: {'$id': schema_url_1},
      metadata: defaultMetadata(schema_url_1)
    }, {
      schema: {'$id': schema_url_2},
      metadata: defaultMetadata(schema_url_2)
    }, {
      schema: {'$id': schema_url_1},
    }, {
      schema: {'$id': schema_url_2},
    }].forEach(testDialogData => {
      beforeEach(() => {
        newComponentFromDialogData(testDialogData);
      });

      it('should detect the correct domainEntity', () => {
        //when
        component.ngOnInit();

        //then
        expect(component.domainEntity).toBe('domainEntity');
      });

    });
  });

  describe('DialogData Edit Mode', () => {
    const schema_url = 'https://schemaService/type/domainEntity/version/concreteType';
    const schema = {
      '$id': schema_url
    };
    const content = {
      describedBy: schema_url,
      schema_type: 'domainEntity',
    };
    const metadata = {
      content: content,
      validationErrors: [],
      uuid: {uuid: ''},
    };

    beforeEach(() => {
      newComponentFromDialogData({
        schema: schema,
        metadata: metadata
      });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should init correctly', () => {
      //when
      component.ngOnInit();

      // then
      expect(component.content).toEqual(content);
      expect(component.schema).toEqual(schema);
      expect(component.schemaUrl).toEqual(schema_url);
      expect(component.domainEntity).toEqual('domainEntity');
      expect(component.concreteType).toEqual('concreteType');
    });

    it('should not emit save with no changed content', () => {
      mockMetadataFormComponent.getFormData.and.returnValue({
        value: content,
        valid: true,
        validationSkipped: false
      });

      // when
      component.ngOnInit();
      component.onSave();

      //then
      expect(component.errorMessage).toEqual('There are no changes done.');
      expect(component.config.viewMode).toEqual(false);
      expect(component.metadataSaved.emit).toHaveBeenCalledTimes(0);
      expect(dialogRef.close).toHaveBeenCalledTimes(0);
    });

    it('should emit save if content has changed', () => {
      let expected_content = {
        describedBy: schema_url,
        schema_type: 'domainEntity',
        new_key: 'newData'
      };
      mockMetadataFormComponent.getFormData.and.returnValue({
        value: expected_content,
        valid: true,
        validationSkipped: false
      });

      // when
      component.ngOnInit();
      component.onSave();

      //then
      expect(component.config.viewMode).toEqual(true);
      expect(component.metadataSaved.emit).toHaveBeenCalledOnceWith(expected_content);
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('DialogData Create Mode', () => {
    const schema_url = 'https://schemaService/type/domainEntity/version/concreteType';
    const schema = {
      '$id': schema_url
    };
    const content = {
      describedBy: schema_url,
      schema_type: 'domainEntity',
    };

    beforeEach(() => {
      newComponentFromDialogData({
        schema: schema,
      });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should init correctly', () => {
      //when
      component.ngOnInit();

      // then
      expect(component.content).toEqual(content);
      expect(component.schema).toEqual(schema);
      expect(component.schemaUrl).toEqual(schema_url);
      expect(component.domainEntity).toEqual('domainEntity');
      expect(component.concreteType).toEqual('concreteType');
    });


    it('should not emit save with no changed content', () => {
      mockMetadataFormComponent.getFormData.and.returnValue({
        value: content,
        valid: true,
        validationSkipped: false
      });

      // when
      component.ngOnInit();
      component.onSave();

      //then
      expect(component.errorMessage).toEqual('There are no changes done.');
      expect(component.config.viewMode).toEqual(false);
      expect(component.metadataSaved.emit).toHaveBeenCalledTimes(0);
      expect(dialogRef.close).toHaveBeenCalledTimes(0);
    });

    it('should emit save if content has changed', () => {
      let expected_content = {
        describedBy: schema_url,
        schema_type: 'domainEntity',
        new_key: 'newData'
      };
      mockMetadataFormComponent.getFormData.and.returnValue({
        value: expected_content,
        valid: true,
        validationSkipped: false
      });

      // when
      component.ngOnInit();
      component.onSave();

      //then
      expect(component.config.viewMode).toEqual(true);
      expect(component.metadataSaved.emit).toHaveBeenCalledOnceWith(expected_content);
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });
  });
});
