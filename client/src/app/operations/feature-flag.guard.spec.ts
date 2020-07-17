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

  it('should allow enabled features', () => {
    //given:
    const guard = getTestBed().inject(FeatureFlagGuard);
    const service = getTestBed().inject(FeatureFlagService) as SpyObj<FeatureFlagService>;

    //and:
    const route: any = {snapshot: {}, data: {featureFlag: 'UserProfile'}};
    const routeState: any = {snapshot: {}, url: ''};

    //and:
    service.isEnabled.and.returnValue(true);

    //when:
    expect(guard.canActivate(route, routeState)).toEqual(true);
  });

});
