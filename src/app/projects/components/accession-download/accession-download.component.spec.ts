import SpyObj = jasmine.SpyObj;
import { AccessionDownloadComponent } from './accession-download.component';
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {AlertService} from '@shared/services/alert.service';
import {SaveFileService} from '@shared/services/save-file.service';
import {HttpResponse, HttpStatusCode} from "@angular/common/http";
import {of, throwError} from "rxjs";

describe('GeoAccessionComponent', () => {
  let geoComponent: AccessionDownloadComponent;
  let brokerSvc: SpyObj<BrokerService>;
  let loaderSvc: SpyObj<LoaderService>;
  let alertSvc: SpyObj<AlertService>;
  let saveFileSvc: SpyObj<SaveFileService>;

  beforeEach(() => {
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheetUsingGeo']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display', 'hide']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);

    geoComponent = new AccessionDownloadComponent(loaderSvc, saveFileSvc, brokerSvc,  alertSvc,);
    geoComponent.accession = 'GSE001';
  });

  it('should create', () => {
    expect(geoComponent).toBeTruthy();
  });

  it('save file on success', () => {

    const body = new Blob([],
      {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const response: HttpResponse<Blob> = new HttpResponse({body: body, status: HttpStatusCode.Ok});
    const mock_return = {
      'data': response.body,
      'filename': 'filename.xls'
    };

    brokerSvc.downloadSpreadsheetUsingGeo.and.returnValue(of(mock_return));

    //when
    geoComponent.downloadSpreadsheet();

    //then
    expect(loaderSvc.display).toHaveBeenCalledTimes(1);
    expect(loaderSvc.hide).toHaveBeenCalledTimes(1);
    expect(saveFileSvc.saveFile).toHaveBeenCalledTimes(1);
  });


  it('show error alert on failure', () => {
    brokerSvc.downloadSpreadsheetUsingGeo.and.returnValue(throwError({status: HttpStatusCode.InternalServerError}));

    //when
    geoComponent.downloadSpreadsheet();

    //then
    expect(alertSvc.error).toHaveBeenCalledTimes(1);
    expect(loaderSvc.hide).toHaveBeenCalledTimes(1);
  });

});

