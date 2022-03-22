import SpyObj = jasmine.SpyObj;
import {MatDialogRef} from "@angular/material/dialog";
import {MetadataFormComponent} from "@metadata-schema-form/metadata-form/metadata-form.component";
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {MetadataDetailsDialogComponent} from './metadata-details-dialog.component';
import {of} from 'rxjs';

describe('MetadataDetailsDialogComponent', () => {
  let component: MetadataDetailsDialogComponent;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let dialogRef: SpyObj<MatDialogRef<MetadataDetailsDialogComponent>>;
  let mockDialogData: SpyObj<Object>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['patch', 'post']);
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

    it('Dialog box close should be called when cancel is clicked', () => {
      // when
      component.onCancel();

      //then
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('DialogData Error', () => {
    const schema = {
      '$id': 'https://schemaService/type/domainEntity/version/concreteType'
    };
    const postUrl = 'iAmNotAUrl';
    const projectId = 'iAmNotAProject';

    [{
      schema: schema,
    }, {
      schema: schema,
      projectId: projectId
    }, {
      schema: schema,
      postUrl: postUrl,
    }].forEach(test => {
      it('should throw error on init', () => {
        mockDialogData = jasmine.createSpyObj('Object', [], test);
        component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);
        expect(component).toBeTruthy();

        //when
        component.ngOnInit();

        // then
        expect(alertSvc.error).toHaveBeenCalledTimes(1);
      });

    });
  });

  describe('DialogData Schema Detection',() => {
    const schema_url_1 = 'https://schemaService/type/domainEntity/version/concreteType';
    const schema_url_2 = 'https://schemaService/type/domainEntity/itsatrap/version/concreteType';
    const postUrl = 'iAmNotAUrl';
    const projectId = 'iAmNotAProject';
    const metadata = {
      content: {},
      validationErrors: [],
      uuid: { uuid: '' },
      _links: { self: { href:'' } }
    };
    [{
      schema: {'$id': schema_url_1},
      metadata: metadata
    },{
      schema: {'$id': schema_url_2},
      metadata: metadata
    },{
      schema: {'$id': schema_url_1},
      postUrl: postUrl,
      projectId: projectId
    },{
      schema: {'$id': schema_url_2},
      postUrl: postUrl,
      projectId: projectId
    }].forEach(test => {
      it('should detect the correct domainEntity', () => {
        mockDialogData = jasmine.createSpyObj('Object',[], test);
        component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);

        //when
        component.ngOnInit();

        //then
        expect(component.domainEntity).toBe('domainEntity')
      });
    });
  });

  describe('DialogData Edit Mode', () => {
    const schema_url = 'https://schemaService/type/domainEntity/version/concreteType';
    const schema = {
      '$id': schema_url
    };
    const patchUrl = 'patch.url'
    const metadata = {
      content: {},
      validationErrors: [],
      uuid: { uuid: '' },
      _links: { self: { href: patchUrl } }
    };

    beforeEach(() => {
      const defaultMockDialogData = {
        schema: schema,
        metadata: metadata
      };
      mockDialogData = jasmine.createSpyObj('Object',[], defaultMockDialogData);
      let mockMetadataFormComponent = jasmine.createSpyObj('MetadataFormComponent', ['getFormData']);
      component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);
      component.metadataFormComponent = mockMetadataFormComponent;
      mockMetadataFormComponent.getFormData.and.returnValue(of({
        value: {
          newData: 'iAmNewData'
        }
      }));
      ingestSvc.patch.and.returnValue(of({}))
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should init correctly', () => {
      //when
      component.ngOnInit();

      // then
      expect(component.content).toEqual(metadata.content);
      expect(component.schema).toEqual(schema);
      expect(component.schemaUrl).toEqual(schema_url);
      expect(component.saveLink).toEqual(patchUrl);
      expect(component.saveAction).toEqual(0);
      expect(component.domainEntity).toEqual('domainEntity');
      expect(component.concreteType).toEqual('concreteType');
    });

    it('should send http patch when saved ', () => {
      // when
      component.ngOnInit();
      component.onSave();

      // then
      expect(ingestSvc.patch).toHaveBeenCalledTimes(1)
    })
  });

  describe('DialogData Create Mode', () => {
    const schema_url = 'https://schemaService/type/domainEntity/version/concreteType';
    const schema = {
      '$id': schema_url
    };
    const postUrl = 'iAmNotAUrl';
    const projectId = 'iAmNotAProject';

    beforeEach(() => {
      const defaultMockDialogData = {
        schema: schema,
        postUrl: postUrl,
        projectId: projectId
      }
      mockDialogData = jasmine.createSpyObj('Object',[], defaultMockDialogData);
      component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);
      mockDialogData = jasmine.createSpyObj('Object',[], defaultMockDialogData);
      let mockMetadataFormComponent = jasmine.createSpyObj('MetadataFormComponent', ['getFormData']);
      component = new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);
      component.metadataFormComponent = mockMetadataFormComponent;
      mockMetadataFormComponent.getFormData.and.returnValue(of({
        value: {
          newData: 'iAmNewData'
        }
      }));
      ingestSvc.post.and.returnValue(of({}))
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should init correctly', () => {
      const new_content = {
        describedBy: schema_url,
        schema_type: 'domainEntity',
      };

      //when
      component.ngOnInit();

      // then
      expect(component.content).toEqual(new_content);
      expect(component.schema).toEqual(schema);
      expect(component.schemaUrl).toEqual(schema_url);
      expect(component.saveLink).toEqual(postUrl);
      expect(component.saveAction).toEqual(1);
      expect(component.projectId).toEqual(projectId);
      expect(component.domainEntity).toEqual('domainEntity');
      expect(component.concreteType).toEqual('concreteType');
    });

    it('should send http post when saved ', () => {
      // when
      component.ngOnInit();
      component.onSave()

      // then
      expect(ingestSvc.post).toHaveBeenCalledTimes(1)
    })
  });
});
