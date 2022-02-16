import {TestBed} from '@angular/core/testing';

import {GeoService} from './geo.service';
import {IngestService} from '@shared/services/ingest.service';
import {AlertService} from '@shared/services/alert.service';
import {Router} from '@angular/router';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {LoaderService} from '@shared/services/loader.service';
import {BrokerService} from '@shared/services/broker.service';
import {Project} from "@shared/models/project";
import {of} from "rxjs";
import any = jasmine.any;
import stringMatching = jasmine.stringMatching;
import arrayContaining = jasmine.arrayContaining;
import objectContaining = jasmine.objectContaining;

describe('GeoService', () => {
  let service: GeoService,
    ingestSvc: jasmine.SpyObj<IngestService>,
    router: jasmine.SpyObj<Router>,
    loader: jasmine.SpyObj<LoaderService>,
    brokerSvc: jasmine.SpyObj<BrokerService>,
    alertSvc: jasmine.SpyObj<AlertService>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getProjectsUsingCriteria']);
    alertSvc = jasmine.createSpyObj('AlertService', ['error', 'success']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    loader = jasmine.createSpyObj('LoaderService', ['hide','display']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['importProjectUsingGeo', 'downloadSpreadsheetUsingGeo']);

    TestBed.configureTestingModule(
      {
        providers: [
          GeoService,
          {
            provide: IngestService,
            useValue: ingestSvc
          },
          {
            provide: AlertService,
            useValue: alertSvc
          },
          {
            provide: Router,
            useValue: router
          },
          {
            provide: LoaderService,
            useValue: loader
          },
          {
            provide: BrokerService,
            useValue: brokerSvc
          },
        ],
        imports: [HttpClientTestingModule]
      }
    );
    service = TestBed.inject(GeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('importProjectUsingGeo', () => {
    it('should show existing projects', async () => {
      const project: Project = {
        content: {
          project_core: {
            project_title: 'project-title'
          }
        },
        uuid: {
          uuid: 'project-uuid'
        }
      } as Project;
      ingestSvc.getProjectsUsingCriteria.and.returnValue(of([project]));

      service.importProjectUsingGeo('GSE123')

      expect(alertSvc.error).toHaveBeenCalledWith(stringMatching('has already been used by project'), stringMatching('project-title'));
      service.loading.subscribe(
        loading => {
          expect(loading).toBeFalse();
        }
      )
    });

    it('should redirect to project on successful import project', async () => {
      ingestSvc.getProjectsUsingCriteria.and.returnValue(of([]));
      brokerSvc.importProjectUsingGeo.and.returnValue(of({project_uuid: 'project-uuid'}));
      service.importProjectUsingGeo('GSE123')

      expect(alertSvc.success).toHaveBeenCalledWith(stringMatching('Success'), stringMatching('GSE123'), true);
      expect(router.navigate).toHaveBeenCalledWith(['/projects/detail'], objectContaining({queryParams: {uuid: 'project-uuid'}}));

      service.loading.subscribe(
        loading => {
          expect(loading).toBeFalse();
        }
      )
    });
  })
});
