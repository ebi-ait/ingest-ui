import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ActivatedRoute, convertToParamMap, RouterStateSnapshot, UrlTree} from '@angular/router';

function fakeRouterState(url: string): RouterStateSnapshot {
  return {
    url,
  } as RouterStateSnapshot;
}

import {Router} from '@angular/router';
import {RouterTestingModule} from "@angular/router/testing";
import {Observable, of, throwError} from "rxjs";

import {WranglerOrOwnerGuard} from './wrangler-or-owner.guard';
import {AlertService} from '../services/alert.service';
import {AuthService} from '../services/auth.service';
import {IngestService} from '../services/ingest.service';
import SpyObj = jasmine.SpyObj;

describe('WranglerOrOwnerGuard', () => {

  // class under test
  let guard: WranglerOrOwnerGuard;

  let fixture: ComponentFixture<WranglerOrOwnerGuard>;
  let routerSpy: Partial<Router>;
  let ingestService: SpyObj<IngestService>;
  let alertService: SpyObj<AlertService>;
  let authService: SpyObj<AuthService>;

  let state: RouterStateSnapshot;
  let route: ActivatedRoute;
  let testUuid = 'test-uuid';

  function prepareIngestMock() {
    ingestService = jasmine.createSpyObj('IngestService',
      {
        'getUserAccount': {},
        'getProjectByUuid': {},
        'getProject': {},
        'getSubmissionProjectByUuid': {}
      });
  }

  function prepareAuthMock() {
    authService = jasmine.createSpyObj('AuthService', [
      'isWrangler',
      'isOwner',
      'isWranglerOrOwner'
    ])
  }

  function prepareTestBed() {
    TestBed.configureTestingModule({
      providers: [
        WranglerOrOwnerGuard,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                uuid: testUuid,
              },
              url: [
                {path: 'projects'},
                {path: 'detail'}
              ]
            },
          }
        },
        {provide: IngestService, useFactory: () => ingestService},
        {provide: AlertService, useValue: alertService},
        {provide: AuthService, useValue: authService},
        {provide: RouterStateSnapshot, useValue: state},
      ],
      imports: [RouterTestingModule]
    }).compileComponents();
  }

  function configureRouterSpy() {
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'parseUrl').and.callThrough();
  }

  function prepareRouterStateMock() {
    return {
      url: `/projects/detail?uuid=${testUuid}`
    } as RouterStateSnapshot;
  }

  function prepareAlertServiceMock() {
    return jasmine.createSpyObj('AlertService', ['error']);
  }

  beforeEach(() => {
    prepareIngestMock();
    prepareAuthMock();

    alertService = prepareAlertServiceMock();

    state = prepareRouterStateMock();

    prepareTestBed();

    configureRouterSpy();

    guard = TestBed.inject(WranglerOrOwnerGuard);
    route = TestBed.inject(ActivatedRoute);
  });

  it('should allow for wrangler', () => {
    authService.isWrangler.and.returnValue(of(true));
    authService.isWranglerOrOwner.and.returnValue(of(true));

    expect(guard.canActivate(route.snapshot, state)).toBeTruthy();
  });

  it('should allow for owner', () => {
    authService.isWrangler.and.returnValue(of(false));
    authService.isWranglerOrOwner.and.returnValue(of(true));

    expect(guard.canActivate(route.snapshot, state)).toBeTruthy();
  });

  it('should disallow and display access denied when not wrangler nor owner', () => {
    authService.isWrangler.and.returnValue(of(false));
    authService.isWranglerOrOwner.and.returnValue(of(false));

    guard.canActivate(route.snapshot, state)
      .subscribe(result => {
        expect(alertService.error).toHaveBeenCalledOnceWith('Access Denied',
          `You cannot access the resource: ${state.url}`,
          true,
          true)
        expect(routerSpy.parseUrl).toHaveBeenCalledOnceWith(`/login?redirect=${encodeURIComponent(state.url)}`);
      });
  });


  it('should disallow and display error screen when there is an error', () => {
    let errorMessage = 'some error';
    authService.isWranglerOrOwner.and.callFake(()=>throwError(errorMessage));

    guard.canActivate(route.snapshot, state)
      .subscribe(result => {
        expect(alertService.error).toHaveBeenCalledOnceWith('Error checking access',
          `You cannot access the resource: ${state.url} due to error: ${errorMessage}`,
          true,
          true)
        expect(routerSpy.parseUrl).toHaveBeenCalledOnceWith(`/home`);
      });
  });
});
