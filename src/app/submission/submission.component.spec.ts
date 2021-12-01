import {ActivatedRoute, Router} from '@angular/router';
import {SubmissionEnvelope} from '@shared/models/submissionEnvelope';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SubmissionComponent} from './submission.component';
import SpyObj = jasmine.SpyObj;
import {CookieService} from "ngx-cookie-service";
import {HttpResponse} from "@angular/common/http";
import {Observable, of, throwError, TimeoutError} from "rxjs";


describe('SubmissionComponent', () => {
  let submissionComponent: SubmissionComponent;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let brokerSvc: SpyObj<BrokerService>;
  let cookieSvc: CookieService;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let loaderSvc: SpyObj<LoaderService>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getUserAccount']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    cookieSvc = jasmine.createSpyObj('CookieService', ['set', 'check']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheet']);
    activatedRoute = {} as ActivatedRoute;
    router = {} as Router;

    submissionComponent = new SubmissionComponent(alertSvc, ingestSvc, brokerSvc, activatedRoute, router, loaderSvc, cookieSvc);
  });

  it('should be created', () => {
    expect(submissionComponent).toBeTruthy();
  });

  describe('displaySubmissionErrors', () => {
    it('clears error banners when there is no submission error', () => {
      // given
      const submissionEnvelope = {
        errors: []
      } as SubmissionEnvelope;

      // when
      submissionComponent.displaySubmissionErrors(submissionEnvelope);

      // then
      expect(alertSvc.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('downloadFile', () => {
    it('disable download button flag', () => {
      // given
      const submissionEnvelope = {
        uuid: 'submission-uuid',
        errors: []
      } as SubmissionEnvelope;
      submissionComponent.submissionEnvelope = submissionEnvelope;
      submissionComponent.saveFile = jasmine.createSpy();

      const body = new Blob([],
        {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const response: HttpResponse<Blob> = new HttpResponse({body: body, status: 200});
      const mock_return = {
        'data': response.body,
        'filename': 'filename.xls'
      };

      brokerSvc.downloadSpreadsheet.and.returnValue(of(mock_return));

      // when
      submissionComponent.downloadFile();

      // then
      expect(submissionComponent.downloadDisabled).toBeFalse();
      expect(loaderSvc.display).toHaveBeenCalledTimes(2);
      // expect(loaderSvc.display).toHaveBeenCalledWith();
    });

    it('display error when downloadSpreadsheet timed out', () => {
      // given
      const submissionEnvelope = {
        uuid: 'submission-uuid',
        errors: []
      } as SubmissionEnvelope;
      submissionComponent.submissionEnvelope = submissionEnvelope;

      brokerSvc.downloadSpreadsheet.and.returnValue(
        throwError(new TimeoutError())
      );

      // when
      submissionComponent.downloadFile();

      // then
      expect(alertSvc.error).toHaveBeenCalled();
      expect(loaderSvc.display).toHaveBeenCalledTimes(2);
    });

  });
});
