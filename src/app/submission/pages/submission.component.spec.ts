import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {SubmissionEnvelope} from '@shared/models/submissionEnvelope';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SubmissionComponent} from './submission.component';
import {of} from 'rxjs';
import SpyObj = jasmine.SpyObj;


describe('SubmissionComponent', () => {
  let submissionComponent: SubmissionComponent;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let brokerSvc: SpyObj<BrokerService>;
  let activatedRoute: ActivatedRoute;
  let router: SpyObj<Router>;
  let loaderSvc: SpyObj<LoaderService>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getUserAccount', 'getArchiveSubmission']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheet']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      queryParamMap: of(convertToParamMap({id: 1}))
    } as ActivatedRoute;

    ingestSvc.getArchiveSubmission.and.returnValue(of(null));
    submissionComponent = new SubmissionComponent(alertSvc, ingestSvc, brokerSvc, activatedRoute, router, loaderSvc);
    submissionComponent.connectSubmissionEnvelope = jasmine.createSpy();
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

  });
});
