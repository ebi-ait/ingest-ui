import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SpreadsheetTabDetailsComponent} from './spreadsheet-tab-details.component';
import {SubmissionComponent} from "@app/submission/pages/submission.component";
import {IngestService} from "@shared/services/ingest.service";
import {AlertService} from "@shared/services/alert.service";
import {BrokerService} from "@shared/services/broker.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LoaderService} from "@shared/services/loader.service";
import {SaveFileService} from "@shared/services/save-file.service";
import SpyObj = jasmine.SpyObj;
import {SubmissionEnvelope} from "@shared/models/submissionEnvelope";
import {By} from "@angular/platform-browser";
import {ChangeDetectionStrategy} from "@angular/core";

describe('SpreadsheetTabDetailsComponent', () => {
  let component: SpreadsheetTabDetailsComponent;
  let fixture: ComponentFixture<SpreadsheetTabDetailsComponent>;

  let alertSvc: SpyObj<AlertService>;
  let brokerSvc: SpyObj<BrokerService>;
  let loaderSvc: SpyObj<LoaderService>;
  let saveFileSvc: SpyObj<SaveFileService>;

  let submission: SubmissionEnvelope;

  beforeEach(async () => {
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error', 'clearGroup']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheet']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);

    await TestBed.configureTestingModule({
      declarations: [SpreadsheetTabDetailsComponent],
      providers: [
        {provide: AlertService, useValue: alertSvc},
        {provide: LoaderService, useValue: loaderSvc},
        {provide: BrokerService, useValue: brokerSvc},
        {provide: SaveFileService, useValue: saveFileSvc}
      ]
    }).compileComponents();

    submission = {
      errors: undefined,
      open: false,
      stagingDetails: undefined,
      submissionDate: '',
      submissionState: '',
      updateDate: '',
      'uuid': {
        'uuid': 'submission-uuid'
      },
      'contentLastUpdated': '2022-01-30T00:00:00.000Z',
      'lastSpreadsheetGenerationJob': {
        'finishedDate': '2022-01-31T01:00:00.000Z',
        'createdDate': '2022-01-31T00:00:00.000Z'
      }
    }
  });

  it('should display download button when file is ready', () => {
    submission['lastSpreadsheetGenerationJob'] = {
      'finishedDate': '2022-01-31T22:34:48.731Z',
      'createdDate': '2022-01-31T22:34:45.323Z'
    }

    submission['contentLastUpdated'] = '2022-01-30T00:00:00.000Z';

    createComponent(submission);

    fixture.whenStable().then(() => {
      const downloadButton = findButton('Download File');
      expect(downloadButton).toBeTruthy();
    });
  });

  it('should display generate button when file is outdated', async () => {
    submission['lastSpreadsheetGenerationJob'] = {
      'finishedDate': '2022-01-31T22:34:48.731Z',
      'createdDate': '2022-01-31T22:34:45.323Z'
    }
    submission['contentLastUpdated'] = '2022-02-01T00:00:00.000Z';
    createComponent(submission);
    fixture.whenStable().then(() => {
      const generateButton = findButton('Generate spreadsheet');
      expect(generateButton).toBeTruthy();
    });

  });

  it('should display message that job is ongoing', async () => {
    submission['contentLastUpdated'] = '2022-02-01T00:00:00.000Z';
    submission['lastSpreadsheetGenerationJob'] = {
      'createdDate': '2022-01-31T22:34:48.731Z',
      'finishedDate': null
    }
    createComponent(submission);
    fixture.whenStable().then(() => {
      expect(component.downloadJobOngoing).toEqual(true);
      const p = findParagraph('Spreadsheet is being generated')
      expect(p).toBeTruthy();
    });


  });

  function findButton(buttonLabel: string) {
    return fixture.debugElement.queryAll(By.css('button'))
      .find(
        debugEl => debugEl.nativeElement.textContent.indexOf(buttonLabel) >= 0
      );
  }

  function findParagraph(keywords: string) {
    return fixture.debugElement.queryAll(By.css('p'))
      .find(
        debugEl => debugEl.nativeElement.innerHTML.indexOf(keywords) >= 0
      );
  }

  function createComponent(submission) {
    fixture = TestBed.createComponent(SpreadsheetTabDetailsComponent);
    component = fixture.componentInstance;
    component.submissionEnvelope = submission;
    fixture.detectChanges();
  }
})
;
