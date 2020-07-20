import {NgModule} from "@angular/core";
import {FeatureFlagGuard} from "./feature-flag.guard";
import {FeatureFlagService} from "./feature-flag.service";
import {System} from "../../environments/system-variables";

@NgModule({
  providers: [
    FeatureFlagGuard,
    {provide: FeatureFlagService, useFactory: () => new FeatureFlagService(System.DFEATURES)}
  ]
})
export class FeatureFlagging {}
