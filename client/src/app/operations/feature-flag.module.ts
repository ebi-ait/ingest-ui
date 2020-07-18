import {NgModule} from "@angular/core";
import {FeatureFlagGuard} from "./feature-flag.guard";
import {FeatureFlagService} from "./feature-flag.service";
import {environment} from "../../environments/environment";

@NgModule({
  providers: [
    FeatureFlagGuard,
    {provide: FeatureFlagService, useFactory: () => new FeatureFlagService(environment.DFEATURES)}
  ]
})
export class FeatureFlagging {}
