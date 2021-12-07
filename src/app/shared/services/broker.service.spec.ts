import {HttpClient, HttpResponse} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {BrokerService} from './broker.service';
import {TimeoutError} from 'rxjs';

describe('Broker Service', () => {
  let service: BrokerService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  const api_url = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrokerService],
      imports: [HttpClientTestingModule]
    });


    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(BrokerService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('test download spreadsheet', () => {
    const submissionUuid = 'sub_uuid'

    it(`should get response`, (done) => {

      const body = new Blob([],
        {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const response: HttpResponse<Blob> = new HttpResponse({body: body, status: 200});
      const mock_return = {
        'data': response.body,
        'filename': 'filename.xls'
      };

      const xls = new Blob([],
        {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      service.downloadSpreadsheet(submissionUuid)
            .subscribe(res => {
              expect(res.data).toEqual(body);
              done();
            });

      const req = httpTestingController.expectOne(`${api_url}/submissions/${submissionUuid}/spreadsheet`);
      expect(req.request.method).toEqual('GET');
      expect(req.request.body).toBeNull();
      req.flush(mock_return);
      httpTestingController.verify();
    });

    it(`should timeout`, (done) => {
      service.downloadSpreadsheet(submissionUuid)
            .subscribe((res: any) => {
              expect(res.failure.error.type).toBe('Timeout');
              done();
            });
      let req = httpTestingController.expectOne(`${api_url}/submissions/${submissionUuid}/spreadsheet`);
      req.error(new ErrorEvent('Timeout'));
      httpTestingController.verify();
    });

  });
});
