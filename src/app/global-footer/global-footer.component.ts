import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-global-footer',
  templateUrl: './global-footer.component.html',
  styleUrls: ['./global-footer.component.scss']
})
export class GlobalFooterComponent {
  @Input() isLoggedIn$: Observable<any>;
  @Output() logout = new EventEmitter<any>();

  onLogout($event: any) {
    this.logout.emit($event);
  }
}
