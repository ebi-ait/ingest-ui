import { Injectable } from '@angular/core';

/*
The feature flag service is designed with the assumption that features added to the code base are, by default,
enabled. The present goal (at the time of writing) is to be able to toggle _OFF_ a feature without rebuilding the UI.

In the future, when feature flags are much more fleshed out, the assumptions could change.
 */

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {

  private disabledFeatures: Set<string>;

  constructor(disabledFeatures: string) {
    this.disabledFeatures = new Set();
    disabledFeatures.split(',').forEach((feature) => {
      this.disabledFeatures.add(feature.toLowerCase().trim());
    });
  }

  isEnabled(feature: string): boolean {
    let key = feature.toLowerCase();
    return !this.disabledFeatures.has(key);
  }
}
