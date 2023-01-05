import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute, Router, RouterStateSnapshot} from '@angular/router';
import {RouterTestingModule} from "@angular/router/testing";
import {of, throwError} from "rxjs";
import {AlertService} from '../services/alert.service';
import {AuthService} from '../services/auth.service';
import {IngestService} from '../services/ingest.service';

import {WranglerOrOwnerGuard} from './wrangler-or-owner.guard';

function fakeRouterState(url: string): RouterStateSnapshot {
  return {
    url,
  } as RouterStateSnapshot;
}

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

  let testCases = [
    {entity:'projects'},
    {entity:'submissions'},
  ];

  testCases.forEach(({entity}) => {
    describe(`for ${entity}`, ()=> {

      beforeEach(() => {
        prepareMocks(entity);
        prepareTestBed(entity);
        configureRouterSpy();
        route = TestBed.inject(ActivatedRoute);

        // this is the class under test
        guard = TestBed.inject(WranglerOrOwnerGuard);
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
    })

  });
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
  function prepareAlertServiceMock() {
    return jasmine.createSpyObj('AlertService', ['error']);

  }
  function prepareTestBed(entity: string) {
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
                {path: entity},
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
  function prepareRouterStateMock(entity: string) {
    return {
      url: `/${entity}/detail?uuid=${testUuid}`
    } as RouterStateSnapshot;

  }
  function prepareMocks(entity: string) {
    prepareIngestMock();

    prepareAuthMock();

    alertService = prepareAlertServiceMock();
    state = prepareRouterStateMock(entity);
  }


});
