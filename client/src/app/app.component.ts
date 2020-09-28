import {Component, OnInit} from '@angular/core';
import {LoaderService} from './shared/services/loader.service';
import {AaiService} from './aai/aai.service';
import {IngestService} from './shared/services/ingest.service';
import {Observable} from 'rxjs';
import {Profile} from 'oidc-client';
import {Account} from './core/account';
import {distinctUntilChanged, filter, map, switchMapTo} from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showLoader: boolean;
  loaderMessage: string;
  isSafari: boolean;

  userProfile$: Observable<Profile>;
  userAccount$: Observable<Account>;

  constructor(private loaderService: LoaderService, private aai: AaiService, private ingestService: IngestService) {
    this.isSafari = window['safari'] !== undefined;

    this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });

    this.loaderService.message.subscribe((val: string) => {
      this.loaderMessage = val;
    });
  }
  ngOnInit(): void {
    this.userProfile$ = this.aai.user$.pipe(
      filter(user => user && !user.expired),
      map(user => user.profile)
    );
    this.userAccount$ = this.aai.user$.pipe(
      filter(user => user && !user.expired),
      distinctUntilChanged(),
      switchMapTo(this.ingestService.getUserAccount())
    );
  }

  onLogout($event: any) {
    if (confirm('Are you sure you want to logout?')) {
      this.aai.logout();
    }
  }
}
