import {GeoAccessionDialogComponent} from './geo-accession-dialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {AlertService} from '@shared/services/alert.service';
import {SaveFileService} from '@shared/services/save-file.service';
import SpyObj = jasmine.SpyObj;
import {HttpResponse} from "@angular/common/http";
import {of} from "rxjs";

describe('GeoAccessionDialogComponent', () => {
  let geoComponent: GeoAccessionDialogComponent;
  let dialogRef: SpyObj<MatDialogRef<GeoAccessionDialogComponent>>;
  let brokerSvc: SpyObj<BrokerService>;
  let loaderSvc: SpyObj<LoaderService>;
  let alertSvc: SpyObj<AlertService>;
  let saveFileSvc: SpyObj<SaveFileService>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheetUsingGeo']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display', 'hide']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);

    geoComponent = new GeoAccessionDialogComponent(dialogRef, brokerSvc, loaderSvc, alertSvc, saveFileSvc);
  });

  it('should create', () => {
    expect(geoComponent).toBeTruthy();
  });


  it('loader gets displayed', () => {
    geoComponent.ngOnInit();
    const geoAccession = 'GSE001';
    geoComponent.geoAccessionCtrl.setValue(geoAccession);

    const body = new Blob([],
            {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
          const response: HttpResponse<Blob> = new HttpResponse({body: body, status: 200});
          const mock_return = {
            'data': response.body,
            'filename': 'filename.xls'
          };

    brokerSvc.downloadSpreadsheetUsingGeo.and.returnValue(of(mock_return));

    //when
    geoComponent.onDownload();

    //then
    expect(loaderSvc.display).toHaveBeenCalledTimes(1);
    expect(loaderSvc.hide).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledTimes(1)
  });

  it('dialog box closes', () => {
    geoComponent.onClose();
    expect(dialogRef.close).toHaveBeenCalledTimes(1)

  });
});
