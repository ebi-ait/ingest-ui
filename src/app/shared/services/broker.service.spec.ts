import {HttpClient, HttpResponse} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {BrokerService} from './broker.service';
import {TimeoutError} from 'rxjs';
import {environment} from "@environments/environment";

describe('Broker Service', () => {
  let service: BrokerService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  const api_url = environment.BROKER_API_URL;

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
      const blob = new Blob([],
        {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      service.downloadSpreadsheet(submissionUuid)
        .subscribe(res => {
          expect(res.data).toEqual(blob);
          done();
        });
      const req = httpTestingController.expectOne(`${api_url}/submissions/${submissionUuid}/spreadsheet`);

      req.flush(blob, {
        headers: {'Content-Disposition': 'attachment; filename=myfile.xls'},
        status: 200,
        statusText: 'OK'
      });

      expect(req.request.method).toEqual('GET');
      expect(req.request.body).toBeNull();

    });

    it(`should timeout`, (done) => {
      service.downloadSpreadsheet(submissionUuid)
        .subscribe(res => {},
          err => {
            expect(err.statusText).toEqual('Request Timeout');
            done();
          });

      let req = httpTestingController.expectOne(`${api_url}/submissions/${submissionUuid}/spreadsheet`);
      req.flush(null, {
        status: 408,
        statusText: 'Request Timeout'
      });
    });

    it(`should timeout error if no value is emitted before DOWNLOAD_SPREADSHEET_TIMEOUT`, fakeAsync(() => {
      service.downloadSpreadsheet(submissionUuid)
        .subscribe(res => {
          },
          err => {
            expect(err instanceof TimeoutError).toBeTruthy();
          });

      httpTestingController.expectOne(`${api_url}/submissions/${submissionUuid}/spreadsheet`);
      tick(service.DOWNLOAD_SPREADSHEET_TIMEOUT);
    }));

  });
});