import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IngestService} from '../shared/services/ingest.service';
import {ProjectFormComponent} from './project-form.component';
import {of} from 'rxjs';
import {Project} from '../shared/models/project';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {AlertService} from '../shared/services/alert.service';
import {LoaderService} from '../shared/services/loader.service';
import {SchemaService} from '../shared/services/schema.service';
import {ROUTES} from '../app.routes';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Account} from '../core/account';
import SpyObj = jasmine.SpyObj;

function createProject(): Project {
  return {
    hasOpenSubmission: true,
    content: null,
    _links: {}
  } as Project;
}

function createUserAccount(): Account {
  return {
    isWrangler(): boolean {
      return false;
    }
  } as Account;
}

describe('ProjectFormComponent', () => {
  let component: ProjectFormComponent;
  let fixture: ComponentFixture<ProjectFormComponent>;

  let ingestSvc: SpyObj<IngestService>;

  beforeEach(async(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', [
      'getProjectByUuid',
      'getUserAccount'
    ]);
    ingestSvc.getProjectByUuid.and.returnValue(of(createProject()));
    ingestSvc.getUserAccount.and.returnValue(of(createUserAccount()));

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(ROUTES),
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute, useValue: {
            snapshot: {
              paramMap: {
                get: () => 'xyz',
                has: () => true
              }
            }
          }
        },
        {provide: IngestService, useValue: ingestSvc},
        {provide: AlertService, useValue: {}},
        {provide: LoaderService, useValue: {}},
        {provide: SchemaService, useValue: {}}
      ],
      declarations: [ProjectFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not fail in setProjectContent', function () {
    component.setProjectContent('xyz');
  });
});
