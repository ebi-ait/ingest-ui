import { TestBed } from '@angular/core/testing';

import { FeatureFlagService } from './feature-flag.service';

describe('Disable Check', () => {

  it('should determine if feature is disabled', () => {
    //given:
    let service = new FeatureFlagService('logging,submission');

    //expect:
    expect(service.isDisabled('logging')).toEqual(true);
    expect(service.isDisabled('submission')).toEqual(true);
  });

  it('should treat unspecified feature as enabled', () => {
    //given:
    let service = new FeatureFlagService('account');

    //expect:
    expect(service.isDisabled('logging')).toEqual(false);
  });

});
