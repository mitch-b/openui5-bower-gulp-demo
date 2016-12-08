> Update (Dec 2016) : This repository contains a lot of deprecated "best-practices" and should only be used as a reference.


SAPUI5/OpenUI5 Sample Application
==========================

![OpenUI5](http://openui5.org/images/OpenUI5_new_big_side.png)

Demonstrate building and deploying an OpenUI5 application using Bower and Gulp.

This application is built off the [TDG sample](https://github.com/SAP/openui5/tree/master/src/sap.m/test/sap/m/demokit/tdg) from OpenUI5 documentation.

# Prerequisites

* `npm` [installed](https://nodejs.org/download/)
* `bower` [installed](https://www.npmjs.com/package/bower#install)
    * `npm i -g bower`
* `gulp` [installed](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#1-install-gulp-globally)
    * `npm i -g gulp`

# Project Structure

* `app/` contains all UI5 files to be deployed to web server
    * `i18n/`  language files
    * `util/`   shared components (Controller, Formatter)
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

## Set Up Your Read/Write Northwind Service

The Northwind service hosted at odata.org has a handy read/write service we will utilize. However, the service 
does not support CORS, so unless you're already using a proxy, this will make things easier for you to run.

1. Go to this URL, it will generate a new URL for you to use.

[http://services.odata.org/V2/(S(readwrite))/OData/OData.svc/](http://services.odata.org/V2/(S(readwrite))/OData/OData.svc/)

1. Copy the new URL you are redirected to in your address bar. You will want to preface it with the `cors-anywhere` proxy service. Combine the following 2 URLs:
    1. http://cors-anywhere.herokuapp.com/
    1. services.odata.org/V2/(S(`YOUR_UNIQUE_ID`))/OData/OData.svc/
        * replace `YOUR_UNIQUE_ID` with your redirected URL

  You can now create a full URL for example:

    http://cors-anywhere.herokuapp.com/services.odata.org/V2/(S(xxxxxxxxxxxxxxxxxxxxxxxx))/OData/OData.svc/

1. Paste this URL into `./config.json` under the `dev` object. Your config should now look something like:


        {
          "build": 0,
          "dev": {
            "eventService": "http://cors-anywhere.herokuapp.com/services.odata.org/V2/(S(xxxxxxxxxxxxxxxxxxxxxxxx))/OData/OData.svc/"
          },
          ... 
        }

You can now read/write from "your own" Northwind OData instance! If the cors-anywhere service is not available, you can look at creating your own instance [here](https://www.npmjs.com/package/cors-anywhere).

# Running

    $ gulp default      # prepare runtime artifacts
    $ gulp run:dev      # setup config files, run webserver

Gulp webserver should start up [http://localhost:3000/](http://localhost:3000). 
