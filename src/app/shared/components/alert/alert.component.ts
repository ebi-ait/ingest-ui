import {Component, OnInit} from '@angular/core';
import {Alert, AlertType} from '../../models/alert';
import {AlertService} from '../../services/alert.service';


@Component({
  // moduleId: module.id,
  selector: 'app-alert',
  templateUrl: 'alert.component.html',
  styleUrls: ['./alert.scss']
})

export class AlertComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(private alertService: AlertService) {
  }

  ngOnInit() {
    this.alertService.getAlert().subscribe((alerts: Alert[]) => {
      this.alerts = alerts;
    });
  }

  removeAlert(alert: Alert) {
    this.alertService.clearOne(alert.id)
    return false;
  }

  cssClass(alert: Alert) {
    if (!alert) {
      return;
    }
    switch (alert.type) {
      case AlertType.Success:
        return 'success';
      case AlertType.Error:
        return 'error';
      case AlertType.Info:
        return 'info';
      case AlertType.Warning:
        return 'warning';
    }
  }
}
