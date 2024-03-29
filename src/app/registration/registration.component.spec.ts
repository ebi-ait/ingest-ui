import {async, ComponentFixture, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {User} from 'oidc-client';
import {of} from 'rxjs';
import {AaiService} from '../aai/aai.service';
import {Account} from '../core/account';
import {RegistrationErrorCode, RegistrationFailed, RegistrationService} from '../core/registration.service';
import {RegistrationComponent} from './registration.component';
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

let registration: RegistrationComponent;
let fixture: ComponentFixture<RegistrationComponent>;

let registrationService: SpyObj<RegistrationService>;
let aaiService: SpyObj<AaiService>;

function configureTestEnvironment(): void {
  registrationService = createSpyObj('AuthenticationService', ['register']);
  aaiService = createSpyObj('AaiService', ['getUser', 'setUserSubject']);

  TestBed.configureTestingModule({
    declarations: [RegistrationComponent],
    imports: [FormsModule],
    providers: [
      {provide: RegistrationService, useFactory: () => registrationService},
      {provide: AaiService, useFactory: () => aaiService},
      {provide: Router, useValue: createSpy('Router')}
    ]
  });
}

function setUp(): void {
  fixture = TestBed.createComponent(RegistrationComponent);
  registration = fixture.componentInstance;
  fixture.detectChanges();
}

describe('Registration', () => {
  beforeEach(async(configureTestEnvironment));
  beforeEach(setUp);

  const accessToken = '78dea90';
  const user: User = <User>{access_token: accessToken};
  const observableUser = of(user);

  it('should register through the service if terms are accepted', fakeAsync(() => {
    // given:
    aaiService.getUser.and.returnValue(observableUser);
    registration.termsAccepted = true;

    // and:
    const newAccount = new Account({id: '11f1faa8', providerReference: '2367ded12'});
    const accountPromise = Promise.resolve(newAccount);
    registrationService.register.and.returnValue(accountPromise);

    // when:
    registration.proceed();

    // then:
    flushMicrotasks();
    expect(aaiService.getUser).toHaveBeenCalled();
    expect(aaiService.setUserSubject).toHaveBeenCalledWith(user);
    expect(registrationService.register).toHaveBeenCalledWith(accessToken);
    expect(registration.status.success).toEqual(true);
    expect(registration.status.message).not.toBe(undefined);
  }));

  it('should set status when registration fails with account duplication', fakeAsync(() => {
    // given:
    aaiService.getUser.and.returnValue(observableUser);
    registration.termsAccepted = true;

    // and:
    const failure = <RegistrationFailed>{errorCode: RegistrationErrorCode.Duplication};
    const accountPromise = Promise.reject(failure);
    registrationService.register.and.returnValue(accountPromise);

    // when:
    registration.proceed();

    // then:
    flushMicrotasks();
    expect(aaiService.getUser).toHaveBeenCalled();
    expect(aaiService.setUserSubject).not.toHaveBeenCalled();
    expect(registrationService.register).toHaveBeenCalledWith(accessToken);
    expect(registration.status.success).toEqual(false);
    expect(registration.status.message).not.toBe(undefined);
  }));

  it('should NOT proceed if terms are not accepted', async(() => {
    // given:
    aaiService.getUser.and.returnValue(observableUser);
    registration.termsAccepted = false;

    // when:
    registration.proceed();

    // then:
    expect(aaiService.getUser).not.toHaveBeenCalled();
    expect(aaiService.setUserSubject).not.toHaveBeenCalled();
    expect(registrationService.register).not.toHaveBeenCalled();
  }));
});
