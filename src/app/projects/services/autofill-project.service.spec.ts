import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {AutofillProject} from '../models/autofill-project';
import {Identifier} from '../models/europe-pmc-search';
import {AutofillProjectService} from './autofill-project.service';
import {IngestService} from "@shared/services/ingest.service";
import {AlertService} from "@shared/services/alert.service";
import {Router} from "@angular/router";


describe('AutofillProjectService', () => {
  let service: AutofillProjectService,
    httpTestingController: HttpTestingController,
    httpClient: HttpClient,
    ingestSvc: jasmine.SpyObj<IngestService>,
    router: jasmine.SpyObj<Router>,
    alertSvc: jasmine.SpyObj<AlertService>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService',['queryProjects']);
    alertSvc = jasmine.createSpyObj('AlertService',['error']);
    router = jasmine.createSpyObj('Router',['navigate']);
    TestBed.configureTestingModule(
      {
        providers: [
          AutofillProjectService,
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
        ],
        imports: [HttpClientTestingModule]
      }
    );
    service = TestBed.inject(AutofillProjectService);
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should return an autofilled project', () => {
    const testResult: AutofillProject = {
      title: 'Hitchhiker\'s guide to the galaxy',
      description: '42',
      doi: '10.1000/xyz123',
      pmid: 1234,
      authors: ['Douglas Adams'],
      url: 'https://doi.org/10.1000/xyz123',
      funders: [{grant_id: 'ABC', organization: 'Vogons'}],
      contributors: []
    };

    const testDoiResponse = {
      resultList: {
        result: [
          {
            ...testResult,
            abstractText: '<p>42</p>',
            authorString: 'Douglas Adams',
            grantsList: {
              grant: [{
                grantId: 'ABC',
                agency: 'Vogons'
              }]
            }
          }
        ]
      }
    };

    const DOI = '10.1000/xyz123';
    service.getProjectDetails(Identifier.DOI, DOI).subscribe(res => {
      expect(res).toEqual(testResult);
    });

    const req = httpTestingController.expectOne(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=doi:${DOI}&resultType=core&format=json`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(testDoiResponse);
  });

  it('should error', () => {
    const emsg = 'error';

    const DOI = 'baddoi';
    service.getProjectDetails(Identifier.DOI, DOI).subscribe(
      data => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toEqual(404);
        expect(error.error).toEqual(emsg);
      });

    const req = httpTestingController.expectOne(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=doi:${DOI}&resultType=core&format=json`
    );

    // Respond with mock error
    req.flush(emsg, {status: 404, statusText: 'Not Found'});
  });
});
