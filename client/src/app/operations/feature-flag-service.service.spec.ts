import {FeatureFlagService} from './feature-flag.service';

describe('Enable Check', () => {

  it('should determine if feature is disabled', () => {
    //given:
    let service = new FeatureFlagService('logging,submission');

    //expect:
    expect(service.isEnabled('logging')).toEqual(false);
    expect(service.isEnabled('submission')).toEqual(false);
  });

  it('should treat unspecified feature as enabled', () => {
    //given:
    let service = new FeatureFlagService('account');

    //expect:
    expect(service.isEnabled('logging')).toEqual(true);
  });

});
