import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {Profile} from 'oidc-client';
import {BehaviorSubject, Observable} from 'rxjs';
import {AaiService} from './aai/aai.service';
import {Account} from './core/account';

declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showLoader: boolean;
  loaderMessage: string;
  isSafari: boolean;

  userProfile$: BehaviorSubject<Profile> = new BehaviorSubject<Profile>(undefined);
  userAccount$: Observable<Account>;

  constructor(private loaderService: LoaderService,
              private aai: AaiService,
              private ingestService: IngestService,
              public router: Router) {
    this.isSafari = window['safari'] !== undefined;

    this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });

    this.loaderService.message.subscribe((val: string) => {
      this.loaderMessage = val;
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'UA-176603863-1', { 'page_path': event.urlAfterRedirects });
      }
    })
  }
  ngOnInit(): void {
    this.aai.getUserSubject().subject.subscribe(user => {
      if (AaiService.loggedIn(user)) {
        this.userProfile$.next(user.profile);
        // ToDo Host a similar BehaviourSubject somewhere for userAccount for separate subscription, rather than using aai.getUser()
        this.userAccount$ = this.ingestService.getUserAccount();
      }
    });
  }

  onLogout($event: any) {
    this.aai.logout();
  }
}
