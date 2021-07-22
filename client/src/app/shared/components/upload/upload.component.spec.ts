import {ProjectFormComponent} from '../../../project-form/project-form.component';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {RouterTestingModule} from '@angular/router/testing';
import {ROUTES} from '../../../app.routes';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Router} from '@angular/router';
import {AlertService} from '../../services/alert.service';
import {LoaderService} from '../../services/loader.service';
import SpyObj = jasmine.SpyObj;
import {UploadComponent} from './upload.component';
import {BrokerService} from '../../services/broker.service';
import {ElementRef} from '@angular/core';


describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  let brokerSvc: SpyObj<BrokerService>;
  let alertSvc: SpyObj<AlertService>;
  let loaderSvc: SpyObj<LoaderService>;
  let router: SpyObj<Router>;

  beforeEach(async(() => {
    brokerSvc = jasmine.createSpyObj('BrokerService', [
      'uploadSpreadsheet'
    ]);
    alertSvc = jasmine.createSpyObj('AlertService', [
      'success',
      'clear',
      'error'
    ]);
    loaderSvc = jasmine.createSpyObj('LoaderService', [
      'display'
    ]);
    router = jasmine.createSpyObj('Router', [
      'navigate'
    ]);

    brokerSvc.uploadSpreadsheet.and.returnValue(of({message: '', details: {submission_uuid: 'submission-uuid'}}));

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(ROUTES),
        HttpClientTestingModule
      ],
      providers: [
        {provide: AlertService, useValue: alertSvc},
        {provide: BrokerService, useValue: brokerSvc},
        {provide: LoaderService, useValue: loaderSvc},
        {provide: Router, useValue: router}
      ],
      declarations: [ProjectFormComponent]
    })
      .compileComponents();
  }));

  function makeSpreadsheetBlob() {
    const blob = new Blob([''], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    blob['lastModifiedDate'] = '';
    blob['name'] = 'filename.xlsx';
    return blob;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    const mockNativeElement = {
      get files() {
        const blob = makeSpreadsheetBlob();
        const file = <File>blob;
        const fileList = {
          0: file
        };
        return fileList;
      }
    };

    component.fileInput = new ElementRef(mockNativeElement);
    component.projectUuid = 'project-uuid';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display successful when upload successful', () => {
    component.upload();
    expect(brokerSvc.uploadSpreadsheet).toHaveBeenCalled();
    expect(alertSvc.success).toHaveBeenCalled();
    expect(loaderSvc.display.calls.allArgs()).toEqual([[true], [false]]);
    expect(router.navigate).toHaveBeenCalledWith(['/submissions/detail'], Object({
      queryParams: Object({
        uuid: 'submission-uuid',
        project: 'project-uuid'
      })
    }));
  });

  it('should display error when no file', () => {
    const mockNativeElement = {
      get files() {
        return {};
      }
    };
    component.fileInput = new ElementRef(mockNativeElement);
    component.upload();

    expect(brokerSvc.uploadSpreadsheet).toHaveBeenCalledTimes(0);
    expect(alertSvc.clear).toHaveBeenCalled();
    expect(alertSvc.error).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledTimes(0);

  });

  it('should display error when broker svc upload has error', () => {
    brokerSvc.uploadSpreadsheet.and.returnValue(throwError({status: 500}));
    component.upload();

    expect(brokerSvc.uploadSpreadsheet).toHaveBeenCalled();
    expect(alertSvc.error).toHaveBeenCalled();
    expect(loaderSvc.display.calls.allArgs()).toEqual([[true], [false]]);
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });
});
