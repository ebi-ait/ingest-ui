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
  let mockMetadataFormComponent: SpyObj<MetadataFormComponent>;
  let mockDialogData: SpyObj<Object>;

  function newComponentFromDialogData(dialogData: Object): MetadataDetailsDialogComponent {
    mockDialogData = jasmine.createSpyObj('Object', [], dialogData);
    return new MetadataDetailsDialogComponent(ingestSvc, alertSvc, dialogRef, mockDialogData);
  }


  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['patch', 'post', 'linkProjectToMetadata']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'success']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockMetadataFormComponent = jasmine.createSpyObj('MetadataFormComponent', ['getFormData'])
    ingestSvc.patch.and.returnValue(of({}))
    ingestSvc.post.and.returnValue(of({_links: { self: { href: '' } }}))
    ingestSvc.linkProjectToMetadata.and.returnValue(of({}))
    mockMetadataFormComponent.getFormData.and.returnValue({
      value: {
        newData: 'iAmNewData'
      },
      valid: true,
      validationSkipped: false
    });
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
    }].forEach(testDialogData => {
      it('should throw error on init', () => {
        component = newComponentFromDialogData(testDialogData);
        expect(component).toBeTruthy();

        //when
        component.ngOnInit();

        // then
        expect(alertSvc.error).toHaveBeenCalledTimes(1);
        expect(dialogRef.close).toHaveBeenCalledTimes(1);
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
    }].forEach(testDialogData => {
      it('should detect the correct domainEntity', () => {
        component = newComponentFromDialogData(testDialogData);

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
      const testDialogData = {
        schema: schema,
        metadata: metadata
      };
      component = newComponentFromDialogData(testDialogData);
      component.metadataFormComponent = mockMetadataFormComponent;
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
      const testDialogData = {
        schema: schema,
        postUrl: postUrl,
        projectId: projectId
      }
      component = newComponentFromDialogData(testDialogData);
      component.metadataFormComponent = mockMetadataFormComponent;
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

    it('should send http post and linkProjectToMetadata when saved ', () => {
      // when
      component.ngOnInit();
      component.onSave()

      // then
      expect(ingestSvc.post).toHaveBeenCalledTimes(1);
      expect(ingestSvc.linkProjectToMetadata).toHaveBeenCalledTimes(1)
    })
  });
});
