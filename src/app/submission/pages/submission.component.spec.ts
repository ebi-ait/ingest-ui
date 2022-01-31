import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {SubmissionEnvelope} from '@shared/models/submissionEnvelope';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SubmissionComponent} from './submission.component';
import {of} from 'rxjs';
import SpyObj = jasmine.SpyObj;
import {SaveFileService} from "@shared/services/save-file.service";
import {ComponentFixture, TestBed, waitForAsync} from "@angular/core/testing";
import {By} from "@angular/platform-browser";


describe('SubmissionComponent', () => {
  let submissionComponent: SubmissionComponent;
  let ingestSvc: SpyObj<IngestService>;
  let alertSvc: SpyObj<AlertService>;
  let brokerSvc: SpyObj<BrokerService>;
  let activatedRoute: ActivatedRoute;
  let router: SpyObj<Router>;
  let loaderSvc: SpyObj<LoaderService>;
  let saveFileSvc: SpyObj<SaveFileService>;

  let fixture: ComponentFixture<SubmissionComponent>;

  beforeEach(waitForAsync(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['getUserAccount', 'getArchiveSubmission', 'getSubmission', 'getSubmissionByUuid']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'clearGroup']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheet']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    activatedRoute = {
      queryParamMap: of(convertToParamMap({id: 1}))
    } as ActivatedRoute;

    let submission : SubmissionEnvelope;
    ingestSvc.getSubmission.and.returnValue(of(submission));
    ingestSvc.getArchiveSubmission.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [SubmissionComponent],
      providers: [
        {provide: IngestService, useValue: ingestSvc},
        {provide: AlertService, useValue: alertSvc},
        {provide: LoaderService, useValue: loaderSvc},
        {provide: BrokerService, useValue: brokerSvc},
        {provide: SaveFileService, useValue: saveFileSvc},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: activatedRoute},
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionComponent);
    submissionComponent = fixture.componentInstance;
    fixture.detectChanges();
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
      expect(alertSvc.clearGroup).toHaveBeenCalledTimes(1);
    });
  });

});
