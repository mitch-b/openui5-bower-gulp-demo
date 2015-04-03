var gulp = require("gulp"),
  fs = require("fs"),
  webserver = require("gulp-webserver"),
  moment = require("moment");

var environments = ["dev", "qa", "prod"];
var paths = {
  dist: "app/"
};

gulp.task("default", ["copy-dependencies", "build:dev"]);
gulp.task("copy-dependencies", ["copy-moment", "copy-ui5"]);

gulp.task("serve", function () {
  gulp.src(paths.dist)
    .pipe(webserver({
      port: 3000,
      livereload: true,
      open: true
    }));
});

gulp.task("copy-moment", function () {
  gulp.src("./bower_components/moment/moment.js")
    .pipe(gulp.dest(paths.dist + "vendor-js/"));
});

gulp.task("copy-ui5", function () {
  // manually maintain this with new libraries
  // until you figure out gulp better
  gulp.src([
      "./bower_components/openui5-sap.m/resources/**/*",
      "./bower_components/openui5-sap.ui.core/resources/**/*",
      "./bower_components/openui5-sap.ui.layout/resources/**/*",
      "./bower_components/openui5-sap.ui.unified/resources/**/*",
      "./bower_components/openui5-themelib_sap_bluecrystal/resources/**/*"
    ])
    .pipe(gulp.dest(paths.dist + "resources/"));
});

environments.forEach(function (env) {
  gulp.task("build:" + env, function () {
    // adjust app/config.json
    var envConfig = require("./config.json");
    var appConfig = {};
    // copy all shared simple attributes (non-object)
    for (var attr in envConfig) {
      if (typeof envConfig[attr] !== "object") {
        appConfig[attr] = envConfig[attr];
      }
    }
    // copy all environment-specific settings
    for (var attr in envConfig[env]) {
      appConfig[attr] = envConfig[env][attr];
    }

    // TODO: move versioning into separate gulp task?
    appConfig = updateBuildVersion(appConfig); // TODO: update ./config.json

    fs.writeFile("app/config.json", JSON.stringify(appConfig));
  });

  gulp.task("run:" + env, ["build:" + env, "serve"]);

  if (env == "prod") {
    // minify ?
  }
});

/**
 * Will update a configuration object's version property
 *
 * If appConfig.build exists and is a number, it will increment
 * this property and apply as build version.
 *
 * @param appConfig configuration object
 * @returns {appConfig}
 */
function updateBuildVersion(appConfig) {
  var buildNumber = 1;

  if (appConfig.build && typeof appConfig.build === 'number') {
    buildNumber = ++appConfig.build;
    // TODO: set ./config.json build property as well
  }

  appConfig.version =
    "v1." + moment().format("YYYY.MMDD") + "." + buildNumber;

  return appConfig;
}