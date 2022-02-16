import {TestBed} from '@angular/core/testing';

import {GeoService} from './geo.service';
import {IngestService} from '@shared/services/ingest.service';
import {AlertService} from '@shared/services/alert.service';
import {Router} from '@angular/router';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {LoaderService} from '@shared/services/loader.service';
import {BrokerService} from '@shared/services/broker.service';
import {Project} from "@shared/models/project";
import {of, throwError} from "rxjs";
import any = jasmine.any;
import stringMatching = jasmine.stringMatching;
import objectContaining = jasmine.objectContaining;
import {SaveFileService} from "@shared/services/save-file.service";

describe('GeoService', () => {
  let service: GeoService,
    ingestSvc: jasmine.SpyObj<IngestService>,
    router: jasmine.SpyObj<Router>,
    loaderSvc: jasmine.SpyObj<LoaderService>,
    brokerSvc: jasmine.SpyObj<BrokerService>,
    alertSvc: jasmine.SpyObj<AlertService>,
    saveFileSvc: jasmine.SpyObj<SaveFileService>,
    geoAccession: string;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getProjectsUsingCriteria']);
    alertSvc = jasmine.createSpyObj('AlertService', ['error', 'success']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['hide', 'display']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['importProjectUsingGeo', 'downloadSpreadsheetUsingGeo']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);

    geoAccession = 'GSE123';

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
            useValue: loaderSvc
          },
          {
            provide: BrokerService,
            useValue: brokerSvc
          },
          {
            provide: SaveFileService,
            useValue: saveFileSvc
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

      service.importProjectUsingGeo(geoAccession)

      expect(alertSvc.error).toHaveBeenCalledWith(stringMatching('has already been used by project'), stringMatching('project-title'));
      service.loading.subscribe(
        loading => {
          expect(loading).toBeFalse();
        }
      )
    });

    it('should alert success and redirect to project on successful import project', async () => {
      ingestSvc.getProjectsUsingCriteria.and.returnValue(of([]));
      brokerSvc.importProjectUsingGeo.and.returnValue(of({project_uuid: 'project-uuid'}));
      service.importProjectUsingGeo(geoAccession)

      expect(alertSvc.success).toHaveBeenCalledWith(stringMatching('Success'), stringMatching(geoAccession), true);
      expect(router.navigate).toHaveBeenCalledWith(['/projects/detail'], objectContaining({queryParams: {uuid: 'project-uuid'}}));

      service.loading.subscribe(
        loading => {
          expect(loading).toBeFalse();
        }
      )
    });

    describe('when import project has error', function () {
      it('should save file on download spreadsheet on successful download', async () => {
        ingestSvc.getProjectsUsingCriteria.and.returnValue(of([]));
        const importProjectError = 'error-message'
        brokerSvc.importProjectUsingGeo.and.returnValue(throwError({message: importProjectError}));

        const body = new Blob([],
          {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const filename = 'filename.xls';
        brokerSvc.downloadSpreadsheetUsingGeo.and.returnValue(of({
          data: body,
          filename: filename
        }));

        service.importProjectUsingGeo(geoAccession)

        expect(loaderSvc.display).toHaveBeenCalledWith(true, stringMatching(importProjectError));
        expect(saveFileSvc.saveFile).toHaveBeenCalledWith(any(Blob), filename);

        service.loading.subscribe(
          loading => {
            expect(loading).toBeFalse();
          }
        )
      });

      it('should alert error message on download spreadsheet error', async () => {
        ingestSvc.getProjectsUsingCriteria.and.returnValue(of([]));
        const importProjectError = 'import-project-error-message';
        const downloadError = 'download-error-message';
        brokerSvc.importProjectUsingGeo.and.returnValue(throwError({message: importProjectError}));
        brokerSvc.downloadSpreadsheetUsingGeo.and.returnValue(throwError({message: downloadError}));

        service.importProjectUsingGeo(geoAccession)

        expect(loaderSvc.display).toHaveBeenCalledWith(true, stringMatching(importProjectError));
        expect(alertSvc.error).toHaveBeenCalledWith(any(String), stringMatching(downloadError));

        service.loading.subscribe(
          loading => {
            expect(loading).toBeFalse();
          }
        )
      });
    });

  })
});
