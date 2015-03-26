OpenUI5 Sample Application
==========================

Demonstrate building and deploying an OpenUI5 application using Bower and Gulp

# Prerequisites

* `npm` installed
* `bower` installed

# Getting Started

```bash
$ npm install && bower install
```

# Configuring

You need to adjust the OData service it hits inside the `./config.dev.json` file (or whichever environment you want to test). The build process will merge the `./config.json` and `./config.[ENV].json` files and create a new `./app/config.json` file which will be parsed by the OpenUI5 application.

# Running

```bash
$ gulp run:dev
```

Gulp webserver should start up [http://localhost:3000/](http://localhost:3000). 
