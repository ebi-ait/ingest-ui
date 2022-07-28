[![Build Status](https://travis-ci.org/HumanCellAtlas/ingest-ui.svg?branch=master)](https://travis-ci.org/HumanCellAtlas/ingest-ui)
[![Docker Repository on Quay](https://quay.io/repository/humancellatlas/ingest-ui/status "Docker Repository on Quay")](https://quay.io/repository/humancellatlas/ingest-ui)

# Ingest UI

This is the UI app for monitoring and tracking submissions to the DCP. 

## Setting up
1. Install `nvm` to install node.https://github.com/nvm-sh/nvm
1. `nvm install` To get the node version listed at: `/.nvmrc`
1. Clone this repo, or remove your **node_modules** folder: `rm -rf node_modules`
1`yarn install`
1. `ng serve -c=dev` (quickly check if UI is working, this will point to Ingest API in dev)

## Development server
1. Run `nvm use` to set the used version to the one listed at: `/.nvmrc`

1. Run `ng serve` or `ng serve -c=[dev|staging|prod]` for a dev server pointing to the ingest api urls configuration in the `environment.<env>.ts`. 

1. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Deployment
Please check `ingest-kube-deployment` repo

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

### Currently working versions
```
$ varn --version
1.22.19

$ node --version
v14.15.5

$ ng --version

     _                      _                 ____ _     ___
    / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
   / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
  / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
 /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
                |___/
    

Angular CLI: 12.1.4
Node: 14.15.5
Package Manager: yarn 1.22.19
OS: darwin x64

Angular: 12.1.5
... animations, common, compiler, compiler-cli, core, forms
... language-service, platform-browser, platform-browser-dynamic
... router

Package                         Version
---------------------------------------------------------
@angular-devkit/architect       0.1201.4
@angular-devkit/build-angular   12.1.4
@angular-devkit/core            12.1.4
@angular-devkit/schematics      12.1.4
@angular/cdk                    12.1.4
@angular/cli                    12.1.4
@angular/flex-layout            12.0.0-beta.35
@angular/material               12.1.4
@schematics/angular             12.1.4
rxjs                            6.6.7
typescript                      4.3.5
    
```
