import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-global-footer',
  templateUrl: './global-footer.component.html',
  styleUrls: ['./global-footer.component.scss']
})
export class GlobalFooterComponent implements OnInit{
  @Input() isLoggedIn$: Observable<any>;
  @Output() logout = new EventEmitter<any>();
  isLoggedIn: any;

  ngOnInit() {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn
    })
  }

  onLogout($event: any) {
    this.logout.emit($event);
  }
}
