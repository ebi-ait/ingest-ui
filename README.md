[![Build Status](https://travis-ci.org/HumanCellAtlas/ingest-ui.svg?branch=master)](https://travis-ci.org/HumanCellAtlas/ingest-ui)
[![Docker Repository on Quay](https://quay.io/repository/humancellatlas/ingest-ui/status "Docker Repository on Quay")](https://quay.io/repository/humancellatlas/ingest-ui)

# Ingest UI

This is the UI app for monitoring and tracking submissions to the DCP. 

## Setting up
1. Install `nvm` to install node.https://github.com/nvm-sh/nvm
1. `nvm install` To get the node version listed at: `/.nvmrc`
1. Clone this repo, or remove your **node_modules** folder: `rm -rf node_modules`
1. `yarn install`
1. `ng serve -c=dev` (quickly check if UI is working, this will point to Ingest API in dev)

## Development server
1. Run `nvm use` to set the used version to the one listed at: `/.nvmrc`

1. Run `ng serve` or `ng serve -c=[dev|staging|prod]` for a dev server pointing to the ingest api urls configuration in the `environment.<env>.ts`. 

1. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Deployment
Please check `ingest-kube-deployment` repo

### Environment Parameters and Security Interceptor Setup

**Note:** The Ingest-UI application was designed to source environment variables from environment files (e.g., environment.dev.ts). However, during deployment, these variables were not correctly sourced due to the deployment setup involving Docker and Helm. Specifically, the `prepare_artifact.sh` script in hte Dockerfile and Helm configuration override the environment variables, leading to inconsistencies between local development and deployed environments. This issue became evident when changes to the environment.*.ts files did not reflect in the deployed application. Thus, we need to change the Helm YAML files to achieve consistency with the deployed environment for the environment variables.

#### Flow Overview

1. **Environment Variables**: The environment files (environment.*.ts) are updated with the necessary configurations. The `environment.env.ts` file contains placeholders for environment variables which are used in the application code.

2. **OIDC Interception**: The `OidcInterceptor` uses these environment variables (e.g. SECURED_ENDPOINTS) to add security headers to HTTP requests, ensuring that API calls to secure endpoints are authorized.

3. **Docker Setup**: During the Docker build process, the `prepare_artifact.sh` script runs in the second stage. This script replaces the environment placeholders in the built JavaScript files (main.*.js).

4. **K8s Deployment**: The Helm [upgrade](https://github.com/ebi-ait/gitlab-ci-templates/blob/98b0b19827f5795bde45f6acaff2a61fd6dda971/build-release-deploy.yml#L113) command deploys the application to the Kubernetes cluster, sourcing configuration values from environment-specific YAML files (e.g., k8s/apps/dev.yaml). These values are [set as environment variables](https://github.com/ebi-ait/gitlab-ci-templates/blob/98b0b19827f5795bde45f6acaff2a61fd6dda971/build-release-deploy.yml#L183) in the running container.





## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## About Versions and Support
The versions of **Angular**, **Node**, **TypeScript** and **RxJS** are tightly coupled with each-other, as described by [this table](https://gist.github.com/LayZeeDK/c822cc812f75bb07b7c55d07ba2719b3).

Furthermore, Angular 12 is only in Long-Term Support until 2022-11-12, [source](https://angular.io/guide/releases#support-policy-and-schedule) and Node 14 is only Maintained until 2023-04-30 [source](https://github.com/nodejs/Release#nodejs-release-working-group). This project should expect to be migrated to supported versions of Node and Angular as appropriate.
