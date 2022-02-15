import {TestBed} from '@angular/core/testing';

import {GeoService} from './geo.service';
import {IngestService} from '@shared/services/ingest.service';
import {AlertService} from '@shared/services/alert.service';
import {Router} from '@angular/router';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {LoaderService} from '@shared/services/loader.service';
import {BrokerService} from '@shared/services/broker.service';

describe('GeoService', () => {
  let service: GeoService,
    ingestSvc: jasmine.SpyObj<IngestService>,
    router: jasmine.SpyObj<Router>,
    loader: jasmine.SpyObj<LoaderService>,
    brokerSvc: jasmine.SpyObj<BrokerService>,
    alertSvc: jasmine.SpyObj<AlertService>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['queryProjects']);
    alertSvc = jasmine.createSpyObj('AlertService', ['error']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    loader = jasmine.createSpyObj('LoaderService', ['display']);
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
});
