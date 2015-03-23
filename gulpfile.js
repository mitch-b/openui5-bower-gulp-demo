var gulp = require("gulp");

var paths = {
	dist: "app/"
};

gulp.task("copy-ui5", function() {
	// manually maintain this with new libraries
	// until you figure out gulp better
	gulp.src("./bower_components/openui5-sap.m/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
	gulp.src("./bower_components/openui5-sap.ui.core/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
	gulp.src("./bower_components/openui5-sap.ui.layout/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
	gulp.src("./bower_components/openui5-themelib_sap_bluecrystal/resources/**/*")
		.pipe(gulp.dest(paths.dist + "resources/"));
});