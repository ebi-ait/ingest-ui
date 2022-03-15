import SpyObj = jasmine.SpyObj;
import {SCEAFileDownloadComponent} from './scea-file-download.component';
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {AlertService} from '@shared/services/alert.service';
import {SaveFileService} from '@shared/services/save-file.service';
import {HttpResponse, HttpStatusCode} from "@angular/common/http";
import {of, throwError} from "rxjs";

describe('SCEAFileDownloadComponent', () => {
  let sceaComponent: SCEAFileDownloadComponent;
  let brokerSvc: SpyObj<BrokerService>;
  let loaderSvc: SpyObj<LoaderService>;
  let alertSvc: SpyObj<AlertService>;
  let saveFileSvc: SpyObj<SaveFileService>;

  beforeEach(() => {
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSCEAFiles']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display', 'hide']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);

    sceaComponent = new SCEAFileDownloadComponent(loaderSvc, saveFileSvc, brokerSvc,  alertSvc,);
  });

  it('should create', () => {
    expect(sceaComponent).toBeTruthy();
  });

  it('save file on success', () => {

    const body = new Blob([],
      {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const response: HttpResponse<Blob> = new HttpResponse({body: body, status: HttpStatusCode.Ok});
    const mock_return = {
      'data': response.body,
      'filename': 'filename.xls'
    };

    brokerSvc.downloadSCEAFiles.and.returnValue(of(mock_return));

    //when
    sceaComponent.downloadFilesFromSCEA();

    //then
    expect(loaderSvc.display).toHaveBeenCalledTimes(1);
    expect(loaderSvc.hide).toHaveBeenCalledTimes(1);
    expect(saveFileSvc.saveFile).toHaveBeenCalledTimes(1);
  });


  it('show error alert on failure', () => {
    brokerSvc.downloadSCEAFiles.and.returnValue(throwError({status: HttpStatusCode.InternalServerError}));

    //when
    sceaComponent.downloadSCEAFiles();

    //then
    expect(alertSvc.error).toHaveBeenCalledTimes(1);
    expect(loaderSvc.hide).toHaveBeenCalledTimes(1);
  });

});
