var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var jsdoc       = require('gulp-jsdoc');

// Static server
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: "./"
    });
    gulp.watch("sass/*.scss", ['sass']);
    gulp.watch(["*.html","app/*","app/*/*"]).on('change', function() {
      browserSync.reload();
      // gulp.src("./app/**/**.js").pipe(jsdoc('./docs/js'));
    });
});

gulp.task('sass', function() {
    return gulp.src("sass/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("css"))
        .pipe(browserSync.stream());
});

gulp.task('docs', function() {
  return gulp.src("./app/**/**.js")
  .pipe(jsdoc('./docs/js'));
});

gulp.task('default', ['serve']);
