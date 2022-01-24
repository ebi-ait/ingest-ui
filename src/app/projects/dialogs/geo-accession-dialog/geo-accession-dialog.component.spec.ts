import {GeoAccessionDialogComponent} from './geo-accession-dialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {AlertService} from '@shared/services/alert.service';
import {SaveFileService} from '@shared/services/save-file.service';
import SpyObj = jasmine.SpyObj;

describe('GeoAccessionDialogComponent', () => {
  let component: GeoAccessionDialogComponent;
  let dialogRef: SpyObj<MatDialogRef<GeoAccessionDialogComponent>>;
  let brokerSvc: SpyObj<BrokerService>;
  let loaderSvc: SpyObj<LoaderService>;
  let alertSvc: SpyObj<AlertService>;
  let saveFileSvc: SpyObj<SaveFileService>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    brokerSvc = jasmine.createSpyObj('BrokerService', ['downloadSpreadsheet']);
    loaderSvc = jasmine.createSpyObj('LoaderService', ['display']);
    alertSvc = jasmine.createSpyObj('AlertService', ['clear', 'error']);
    saveFileSvc = jasmine.createSpyObj('SaveFileService', ['saveFile']);

    component = new GeoAccessionDialogComponent(dialogRef, brokerSvc, loaderSvc, alertSvc, saveFileSvc);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test onDownload method', () => {
    throw new Error('Not Implemented');
  });

  it('should test onClose method', () => {
    throw new Error('Not Implemented');
  });
});
