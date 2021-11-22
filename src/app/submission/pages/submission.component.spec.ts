import {ActivatedRoute, Router} from '@angular/router';
import {SubmissionEnvelope} from '@shared/models/submissionEnvelope';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SubmissionComponent} from './submission.component';
import SpyObj = jasmine.SpyObj;


describe('SubmissionComponent', () => {
  let submissionComponent: SubmissionComponent;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let brokerSvc: BrokerService;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let loaderSvc: LoaderService;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getUserAccount']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    brokerSvc = {} as BrokerService;
    activatedRoute = {} as ActivatedRoute;
    router = {} as Router;
    loaderSvc = {} as LoaderService;
    submissionComponent = new SubmissionComponent(alertSvc, ingestSvc, brokerSvc, activatedRoute, router, loaderSvc);
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
});
