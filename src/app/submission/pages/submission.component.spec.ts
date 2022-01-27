import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {SubmissionEnvelope} from '@shared/models/submissionEnvelope';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SubmissionComponent} from './submission.component';
import {CookieService} from 'ngx-cookie-service';
import {HttpResponse} from '@angular/common/http';
import {of, throwError, TimeoutError} from 'rxjs';
import SpyObj = jasmine.SpyObj;
import {SaveFileService} from "@shared/services/save-file.service";


describe('SubmissionComponent', () => {
  let submissionComponent: SubmissionComponent;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let brokerSvc: SpyObj<BrokerService>;
  let cookieSvc: SpyObj<CookieService>;
  let activatedRoute: ActivatedRoute;
  let router: SpyObj<Router>;
  let loaderSvc: SpyObj<LoaderService>;
  let saveFileSvc: SpyObj<SaveFileService>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getUserAccount', 'getArchiveSubmission']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'clearGroup']);
    cookieSvc = jasmine.createSpyObj('CookieService', ['set', 'check', 'delete']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheet']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      queryParamMap: of(convertToParamMap({id: 1}))
    } as ActivatedRoute;

    ingestSvc.getArchiveSubmission.and.returnValue(of(null));
    submissionComponent = new SubmissionComponent(alertSvc, ingestSvc, brokerSvc, activatedRoute, router, loaderSvc, cookieSvc, saveFileSvc);
    submissionComponent.connectSubmissionEnvelope = jasmine.createSpy();
  });

  it('should be created', () => {
    expect(submissionComponent).toBeTruthy();
  });

  it('should disable download button when cookie is set', () => {
    cookieSvc.check.and.returnValue(true);
    submissionComponent.ngOnInit();
    expect(submissionComponent.downloadDisabled).toBeTrue();
  });

  it('should enable download button when cookie is not set', () => {
    cookieSvc.check.and.returnValue(false);
    submissionComponent.ngOnInit();
    expect(submissionComponent.downloadDisabled).toBeFalse();
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
      expect(alertSvc.clearGroup).toHaveBeenCalledTimes(1);
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
      expect(cookieSvc.set).toHaveBeenCalledTimes(1);
    });

  });
});
