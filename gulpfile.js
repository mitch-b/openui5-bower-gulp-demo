var gulp = require("gulp"),
    fs = require("fs");

var paths = {
	dist: "app/"
};

gulp.task("default", ["copy-ui5", "build:dev"]);

var environments = ["dev", "qa", "prod"];

gulp.task("copy-ui5", function() {
	// manually maintain this with new libraries
	// until you figure out gulp better
	gulp.src("./bower_components/openui5-sap.m/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
	gulp.src("./bower_components/openui5-sap.ui.core/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
	gulp.src("./bower_components/openui5-sap.ui.layout/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
	gulp.src("./bower_components/openui5-sap.ui.unified/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
	gulp.src("./bower_components/openui5-themelib_sap_bluecrystal/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
});

environments.forEach(function(env) {
	gulp.task("build:" + env, function() {
		// adjust app/config.json
		var envConfig = require("./config." + env + ".json");
		var appConfig = require("./config.json");
		for (var attr in envConfig) {
			appConfig[attr] = envConfig[attr];
		}
		fs.writeFile("app/config.json", JSON.stringify(appConfig));
	});

	if (env == "prod") {
		// minify ?
	}
});