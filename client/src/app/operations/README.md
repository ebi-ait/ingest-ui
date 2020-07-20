# Ingest UI Operations

## Flagging Features

The Feature Flagging module (`FeatureFlagging`) provides services that allow operations to limit 
which features are enabled at runtime. The two main services that facilitate this are 
`FeatureFlagService`, and the `FeatureFlagGuard`.

### Routing with Feature Flags

At the time of writing, the main mechanism of enforcing Feature Flags is through the 
`FeatureFlagGuard` that can be activated through route specification. At the time of writing,
the assumption is that UI features manifest mainly as routed components. In order for the 
toggling to work, route specifications for each feature need to be declared with additional data
containing the feature flag. For example, for given a component representing a feature, say, 
`UserProfileComponent` whose route is usually declared as follows:
    
    {path: 'userprofile', component: UserProfileComponent}

feature flagging can be enabled by adding the `featureFlag` name in the route `data`, and 
specifying that it activates the `FeatureFlagGuard`:

    { 
      path: 'userprofile', 
      component: UserProfileComponent, 
      data: {featureFlag: 'userProfile'}}
      canActivate: [FeatureFlagGuard]
     }

Feature flags are currently *case-insensitive* so `userProfile` is considered to be the same as
`UserProfile`, or `userprofile`, etc.

### Disabling Features

By default, any feature is considered to be enabled. Routes that are not specified with 
feature flagging cannot be disabled through the previously mentioned services. At the time of
writing, the main mechanism for disabling flagged features is through the use of system 
variables. The main reason for this is that we want the operations to be able to toggle any
of the features on or off without having to rebuild the UI (or more specifically the UI image).

Feature flagging services use the `DFEATURES` (disabled features) system variable to determine
which features should be disabled. This is a comma-separated list of feature flags that are 
intended to be hidden from external use in the UI. For example, to disable features 
`userProfile`, and, say, `submissions`, the system variable can be set to:

    DFEATURES='userProfile, submissions'
    
#### Applying Changes to the Kubernetes Cluster

For the Ingest UI deployment in the Kubernetes cluster, the `DFEATURES` environment variable
is sourced from the `dfeatures` variable in the specific environment value file (e.g. 
`dev.yaml` for dev, `staging.yaml` for staging, etc.).

### References and Future Development

The main mechanism for Feature Flagging is based on 
[this write up at the Microsoft Dev Blog][1]. At the time of writing, we've only implemented 
the bare minimum to get feature flagging work at the routing level, but in the future, it
might also be useful to define directives for disabling links, and such.

The code for processing system variables is based mostly on this [Medium article][2]. For now,
it's designed to read and process all available environment variables, but it might make more
sense to follow the advice in the reference to filter by predefined prefix.

[1]: https://devblogs.microsoft.com/premier-developer/angular-how-to-implement-feature-flags/
[2]: https://medium.com/@hughblue/reading-system-environment-variables-from-angular-part-2-a63368e591b4
