import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {Account} from '../../../core/account';
import {AlertService} from '../../../shared/services/alert.service';
import {IngestService} from '../../../shared/services/ingest.service';
import {LoaderService} from '../../../shared/services/loader.service';
import {SchemaService} from '../../../shared/services/schema.service';
import {ProjectCacheService} from '../../services/project-cache.service';
import {AccessionFieldGroupComponent} from '../accession-field-group/accession-field-group.component';
import {ProjectIdComponent} from '../project-id/project-id.component';
import {ProjectMetadataFormComponent} from './project-metadata-form.component';
import SpyObj = jasmine.SpyObj;

describe('ProjectMetadataFormComponent', () => {
  let component: ProjectMetadataFormComponent;
  let fixture: ComponentFixture<ProjectMetadataFormComponent>;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let loaderSvc: SpyObj<LoaderService>;
  let schemaSvc: SpyObj<SchemaService>;
  let projectCacheSvc: SpyObj<ProjectCacheService>;

  beforeEach(waitForAsync(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getUserAccount']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    schemaSvc = jasmine.createSpyObj('SchemaService', ['getUrlOfLatestSchema', 'getDereferencedSchema']);
    projectCacheSvc = jasmine.createSpyObj('ProjectCacheService', ['removeProject']);

    ingestSvc.getUserAccount.and.returnValue(
      of(new Account({id: '123', providerReference: 'aai', roles: []}))
    );

    schemaSvc.getUrlOfLatestSchema.and.returnValue(of('schema-url-n'));
    schemaSvc.getDereferencedSchema
      .withArgs('schema-url-0').and.returnValue(of({'id': 'schema-url-0'}))
      .withArgs('schema-url-n').and.returnValue(of({'id': 'schema-url-n'}));

    TestBed.configureTestingModule({
      declarations: [ProjectMetadataFormComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: IngestService, useValue: ingestSvc},
        {provide: AlertService, useValue: alertSvc},
        {provide: LoaderService, useValue: loaderSvc},
        {provide: SchemaService, useValue: schemaSvc},
        {provide: ProjectCacheService, useValue: projectCacheSvc}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMetadataFormComponent);
    component = fixture.componentInstance;
    component.project = {
      content: {},
      isInCatalogue: true,
    };
    fixture.detectChanges();
  });

  describe('contributor flow', () => {
    it('show correct tabs and fields in create mode', () => {
      component.create = true;
      component.setUpProjectForm();

      const tabs = component.config.layout.tabs;
      const projectTab = tabs[0];

      const expectedKeys = ['project', 'contributors', 'publications', 'funders', 'save'];
      expect(tabs.length).toEqual(expectedKeys.length);
      tabs.forEach(tab => {
        expect(expectedKeys.includes(tab.key)).toBeTruthy();
      });

      // Should show the ProjectIDComponent and the AccessionFieldGroupComponent
      // @ts-ignore
      expect(projectTab.items.findIndex(item => item?.component === ProjectIdComponent)).toEqual(3);
      // @ts-ignore
      expect(projectTab.items.findIndex(item => item?.component === AccessionFieldGroupComponent)).toEqual(4);
    });

    it('shows correct tabs and fields when not in create mode', () => {
      component.create = false;
      component.setUpProjectForm();

      const tabs = component.config.layout.tabs;
      const projectTab = tabs[0];

      const expectedKeys = ['project', 'contributors', 'publications', 'funders'];
      expect(tabs.length).toEqual(expectedKeys.length);
      tabs.forEach(tab => {
        expect(expectedKeys.includes(tab.key)).toBeTruthy();
      });

      // Should not show the ProjectIdComponent and the AccessionFieldGroupComponent
      // @ts-ignore
      expect(projectTab.items.find(item => item?.component === ProjectIdComponent)).toBeFalsy();
      // @ts-ignore
      expect(projectTab.items.find(item => item?.component === AccessionFieldGroupComponent)).toBeFalsy();
    });
  });

  describe('wrangler flow', () => {
    it('shows the admin tab', () => {
      component.userIsWrangler = true;
      component.setUpProjectForm();
      expect(component.config.layout.tabs.length).toEqual(5);
      const expectedKeys = ['project', 'contributors', 'publications', 'funders', 'project_admin', 'save'];
      component.config.layout.tabs.forEach(tab => {
        expect(expectedKeys.includes(tab.key)).toBeTruthy();
      });
    });
  });


  it('load latest schema when creating a new project', () => {
    component.project = {
      content: {}
    };
    component.ngOnInit();
    expect(component.projectMetadataSchema['id']).toEqual('schema-url-n');

  });

  it('load schema from describedBy when editing a project', () => {
    component.project = {
      content: {
        'describedBy': 'schema-url-0',
        'schema_type': 'project'
      }
    };
    component.ngOnInit();
    expect(component.projectMetadataSchema['id']).toEqual('schema-url-0');

  });

});
