import {getTestBed, TestBed} from "@angular/core/testing";
import {FeatureFlagGuard} from "./feature-flag.guard";
import {FeatureFlagService} from "./feature-flag.service";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('Feature Flag Guard', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FeatureFlagGuard,
        {provide: FeatureFlagService, useFactory: () => createSpyObj('FeatureFlagService', ['isEnabled'])}
      ]
    });
  });

  [
    {allow: true, action: 'allow'},
    {allow: false, action: 'block'}
  ].forEach(param => {
    it(`should ${param.action} features`, () => {
      //given:
      const guard = getTestBed().inject(FeatureFlagGuard);
      const service = getTestBed().inject(FeatureFlagService) as SpyObj<FeatureFlagService>;

      //and:
      let userProfile = 'UserProfile';
      const route: any = {data: {featureFlag: userProfile}};
      const routeState: any = {url: '/userprofile'};

      //and:
      service.isEnabled.and.returnValue(param.allow);

      //expect:
      expect(guard.canActivate(route, routeState)).toEqual(param.allow);
      expect(service.isEnabled).toHaveBeenCalledWith(userProfile);
    });
  });

  [
    {route: {}, description: 'no flags'},
    {route: {data: {text: 'some data'}}, description: 'unrelated data'}
  ].forEach((param: any) => {
    it(`should allow routes with ${param.description}`, () => {
      //given:
      const guard = getTestBed().inject(FeatureFlagGuard);
      const service = getTestBed().inject(FeatureFlagService) as SpyObj<FeatureFlagService>;

      //and:
      const routeState: any = {url: '/accounts'};

      //expect:
      expect(guard.canActivate(param, routeState)).toEqual(true);
      expect(service.isEnabled).toHaveBeenCalledTimes(0);
    });
  });

});
