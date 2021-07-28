import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {AutofillProject} from '../models/autofill-project';
import {Identifier} from '../models/europe-pmc-search';
import {AutofillProjectService} from './autofill-project.service';

describe('AutofillProjectService', () => {
  let service: AutofillProjectService, httpTestingController: HttpTestingController, httpClient: HttpClient;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AutofillProjectService], imports: [HttpClientTestingModule] });
    service = TestBed.inject(AutofillProjectService);
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should return an autofilled project', () => {
    const testResponse: AutofillProject = {
      title: 'Hitchhiker\'s guide to the galaxy',
      description: '42',
      doi: '10.1000/xyz123',
      pmid: 1234,
      authors: ['Douglas Adams'],
      url: 'intergalactic.com',
      funders: [{ grant_id: 'ABC', organization: 'Vogons'}],
      contributors: []
    };
    service.getProjectDetails(Identifier.DOI, '10.1000/xyz123').subscribe(res => {
      expect(res).toEqual(testResponse);
    });

    const req = httpTestingController.expectOne('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
    expect(req.request.method).toEqual('GET');
    req.flush(testResponse);
  });

  it('should error', () => {
    const emsg = 'error';

    service.getProjectDetails(Identifier.DOI, 'baddoi').subscribe(
      data => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toEqual(404);
        expect(error.error).toEqual(emsg);
      });

    const req = httpTestingController.expectOne('https://www.ebi.ac.uk/europepmc/webservices/rest/search');

    // Respond with mock error
    req.flush(emsg, { status: 404, statusText: 'Not Found' });
  });
});
