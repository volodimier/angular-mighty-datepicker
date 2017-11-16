var gulp    = require("gulp"),
    gutil = require('gulp-util'),
    watch   = require("gulp-watch"),
    clean   = require("gulp-clean"),
    connect = require("gulp-connect"),
    changed = require("gulp-changed"),
    bower   = require("gulp-bower"),
	rename = require("gulp-rename"),	
    // compilers
    less    = require("gulp-less"),
    plumber = require('gulp-plumber'),
	// minifiers
	cleanCss = require("gulp-clean-css"),
	uglify = require("gulp-uglify");

var warn = function(err) { console.warn(err); };
var paths = {
  src: "./src/",
  dst: "./build/"
}

var onError = function (err) {
  gutil.beep();
  console.log(err);
};

gulp.task("default", ["bower", "build"]);

gulp.task("build", ["less"]);

gulp.task("minify", ["clean-css", "uglify"]);

gulp.task("server", ["build", "watch"], function() {
  connect.server({
    root: '.',
    port: 8000
  });
});

gulp.task("clean", function(){
  return gulp.src(paths.dst, {read: false})
    .pipe(clean());
})

gulp.task("watch", function(){
  return gulp.watch(paths.src + "**/*", ["build"]);
});

gulp.task("bower", function() {
  return bower("bower_components")
    .pipe(gulp.dest("bower_components"))
});

gulp.task("less", function(){
  return gulp.src(paths.src + "**/*.less")
    .pipe(changed(paths.dst, { extension: '.css' }))
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(less().on('error', warn))
    .pipe(gulp.dest(paths.dst))
    .pipe(connect.reload());
});

gulp.task("clean-css", function () {
    return gulp.src(paths.dst + "*.css")
    .pipe(cleanCss())
	.pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dst + "min"));
});

gulp.task("uglify", function () {
	return gulp.src(paths.src + "*.js")
	 .pipe(plumber({
      errorHandler: onError
    }))
	.pipe(uglify())
	.pipe(rename({ suffix: '.min' }))
	.pipe(gulp.dest(paths.dst))
});
//
