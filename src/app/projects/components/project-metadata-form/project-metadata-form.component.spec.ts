import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {Account} from '@app/core/account';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {of} from 'rxjs';
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

  function componentOnSave(createMode: boolean = true, metadataValid: boolean = true, validationSkipped: boolean = false, tab: string = 'save') {
    const param = {valid: metadataValid, validationSkipped: validationSkipped, value: component.project};
    spyOn(window, 'alert');
    component.create = createMode;
    component.setUpProjectForm();
    component.saveProject = jasmine.createSpy();
    component.setCurrentTab(tab);
    fixture.detectChanges();
    component.onSave(param);
  }

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

    describe('contributor flow onSave', () => {
      it('onSave should incrementProjectTab if not on save tab', () => {
        component.create = true;
        component.setUpProjectForm();

        const tabs = component.config.layout.tabs;
        const expectedTabKeys = ['project', 'contributors', 'publications', 'funders', 'save'];
        const param = {valid: true, validationSkipped: false, value: {}};

        for (let i = 0; i < (tabs.length - 1); i++) {
          expect(component.projectFormTabKey).toEqual(expectedTabKeys[i]);
          component.onSave(param);
        }
      });

      it('onSave should save on save tab', () => {
        componentOnSave(true, true, false, 'save');
        expect(component.saveProject).toHaveBeenCalledTimes(1);
      });

      it('onSave should fail if invalid', () => {
        componentOnSave(true, false, false, 'save');
        expect(alertSvc.clear).toHaveBeenCalledTimes(1);
        expect(alertSvc.error).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('wrangler flow', () => {
    beforeEach(() => {
      component.userIsWrangler = true;
    });

    it('shows the admin tab and save tab in create mode', () => {
      component.create = true;
      component.setUpProjectForm();
      expect(component.config.layout.tabs.length).toEqual(6);
      const expectedKeys = ['project', 'contributors', 'publications', 'funders', 'project_admin', 'save'];
      component.config.layout.tabs.forEach(tab => {
        expect(expectedKeys.includes(tab.key)).toBeTruthy();
      });
    });

    it('shows just the admin tab in edit mode', () => {
      component.create = false;
      component.setUpProjectForm();
      expect(component.config.layout.tabs.length).toEqual(5);
      const expectedKeys = ['project', 'contributors', 'publications', 'funders', 'project_admin'];
      component.config.layout.tabs.forEach(tab => {
        expect(expectedKeys.includes(tab.key)).toBeTruthy();
      });
    });

    it('onSave should unset isInCatalogue if validation skipped in create mode', () => {
      componentOnSave(true, false, true, 'save');
      expect(component.saveProject).toHaveBeenCalledTimes(1);
      expect(component.project.isInCatalogue).toBeFalse();
      expect(window.alert).toHaveBeenCalledOnceWith('This invalid project will be saved, but has been removed from the project catalogue.');
    });

    it('onSave should not change isInCatalogue if validation skipped in edit mode', () => {
      componentOnSave(false, false, true, 'project_admin');
      expect(component.saveProject).toHaveBeenCalledTimes(1);
      expect(component.project.isInCatalogue).toBeTrue();
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

  it('displays loading when some required data are missing', () => {
    component.project = null;
    component.ngOnInit();
    fixture.detectChanges();

    const metadataForm = fixture.debugElement.query(By.css('app-metadata-form'));
    expect(metadataForm).toBeFalsy();

    const p = fixture.debugElement.query(By.css('p'));
    expect(p.nativeElement.innerHTML.toLowerCase()).toContain('loading');
  });

  it('loads project metadata form when all required data is present', () => {
    const metadataForm = fixture.debugElement.query(By.css('app-metadata-form'));
    expect(metadataForm).toBeTruthy();
  });
});
