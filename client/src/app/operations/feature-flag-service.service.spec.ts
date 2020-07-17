import { TestBed } from '@angular/core/testing';

import { FeatureFlagService } from './feature-flag.service';

describe('Feature Flagging', () => {

  it('should determine if feature is disabled', () => {
    //given:
    let service = new FeatureFlagService('logging,userProfile,submission');

    //expect:
    expect(service.isDisabled('logging')).toEqual(false);
  });

});
