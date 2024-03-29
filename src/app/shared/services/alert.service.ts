import {Injectable} from '@angular/core';
import {NavigationStart, Router, UrlTree} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {Alert, AlertType} from '../models/alert';

@Injectable()
export class AlertService {
  private subject = new BehaviorSubject<Alert[]>([]);
  private keepAfterRouteChange = false;

  constructor(private router: Router) {
    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          // only keep for a single route change
          this.keepAfterRouteChange = false;
        } else {
          // clear alert messages
          this.clear();
        }
      }
    });
  }

  getAlert(): Observable<any> {
    return this.subject.asObservable();
  }

  success(title: string, message: string, keepAfterRouteChange = false, dismissible = true, groupName?: string) {
    this.alert(AlertType.Success, title, message, keepAfterRouteChange, dismissible, groupName);
  }

  error(title: string, message: string, keepAfterRouteChange = false, dismissible = true, groupName?: string) {
    this.alert(AlertType.Error, title, message, keepAfterRouteChange, dismissible, groupName);
  }

  info(title: string, message: string, keepAfterRouteChange = false, dismissible = true, groupName?: string) {
    this.alert(AlertType.Info, title, message, keepAfterRouteChange, dismissible, groupName);
  }

  warn(title: string, message: string, keepAfterRouteChange = false, dismissible = true, groupName?: string) {
    this.alert(AlertType.Warning, title, message, keepAfterRouteChange, dismissible, groupName);
  }

  alert(type: AlertType, title: string, message: string, keepAfterRouteChange = false, dismissible = true, groupName?: string) {
    this.keepAfterRouteChange = keepAfterRouteChange;
    const curValues = this.subject.getValue();
    const alerts = [...curValues, <Alert>{type, title, message, dismissible, groupName, id: curValues.length}]
    this.subject.next(alerts);
  }

  clear() {
    this.subject.next([]);
  }

  clearOne(id: number) {
    const curValues = this.subject.getValue();
    this.subject.next(curValues.filter(alert => alert.id !== id))
  }

  clearGroup(groupName: string) {
    const curValues = this.subject.getValue();
    this.subject.next(curValues.filter(alert => alert.groupName !== groupName))
  }
}
