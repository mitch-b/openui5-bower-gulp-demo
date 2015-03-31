OpenUI5 Sample Application
==========================

Demonstrate building and deploying an OpenUI5 application using Bower and Gulp

# Prerequisites

* `npm` installed
* `bower` installed
* `gulp` installed
    * `npm i -g gulp`

# Project Structure

* `app/` contains all UI5 files to be deployed to web server
    * `i18n/`  language files
    * `util/`   shared components
    * `view/`   XML views, fragments, and JS controllers
    * `Component.js` UIComponent initializer (entry point of application)
    * `config.json` *compiled* appConfig settings
    * `index.html`
    * `Router.js` UI5 router implementation
* `bower.json` front-end dependencies (UI5 framework libraries)
* `config.json` *master* appConfig settings (source for `app/config.json`)
* `gulpfile.json` Gulp task runner config
* `package.json` npm dependencies

# Getting Started

    $ npm install && bower install

# Configuring

You need to adjust the OData service it hits inside the `./config.json` file. 
The build process will copy up this file and only the relevant environment 
properties to create a new `./app/config.json` file which will be parsed 
by the OpenUI5 application.

# Running

    $ gulp default      # prepare runtime artifacts
    $ gulp run:dev      # setup config files, run webserver

Gulp webserver should start up [http://localhost:3000/](http://localhost:3000). 
