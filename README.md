[![Build Status](https://travis-ci.org/HumanCellAtlas/ingest-ui.svg?branch=master)](https://travis-ci.org/HumanCellAtlas/ingest-ui)
[![Docker Repository on Quay](https://quay.io/repository/humancellatlas/ingest-ui/status "Docker Repository on Quay")](https://quay.io/repository/humancellatlas/ingest-ui)

# Ingest UI

This is the UI app for monitoring and tracking submissions to the DCP. 

## Setting up
1. Install `nvm` to install node.https://github.com/nvm-sh/nvm
2. Install node
```shell
nvm install 12.16.3
```
3. Clone this repo
4. `yarn install`
5. `ng serve -c=dev` (quickly check if UI is working, this will point to Ingest API in dev)

(Optional) if you're just updating your setup, do the ff before yarn install:

```
rm -rf node_modules/
npm cache verify

```

Currently, working with the ff versions:
see package.json for engine version limits.
```
$ node --version
v12.16.2

$ npm --version
6.14.4

$ ng --version

     _                      _                 ____ _     ___
    / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
   / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
  / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
 /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
                |___/
    

Angular CLI: 12.1.3
Node: 12.16.3
Package Manager: yarn 1.22.4
OS: darwin x64

Angular: 12.1.3
... animations, cdk, cli, common, compiler, compiler-cli, core
... forms, language-service, material, platform-browser
... platform-browser-dynamic, router

Package                         Version
---------------------------------------------------------
@angular-devkit/architect       0.1201.3
@angular-devkit/build-angular   12.1.3
@angular-devkit/core            12.1.3
@angular-devkit/schematics      12.1.3
@angular/flex-layout            12.0.0-beta.34
@schematics/angular             12.1.3
typescript                      4.3.5
    
```

## Development server

1. Run `ng serve` or `ng serve -c=[dev|staging|prod]` for a dev server pointing to the ingest api urls configuration in the `environment.<env>.ts`. 

2. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

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
