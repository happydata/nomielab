var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var jsdoc       = require('gulp-jsdoc');
var electron    = require('gulp-electron');
var packageJson = require('./package.json');



// Static server
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: "./src/"
    });
    gulp.watch("sass/*.scss", ['sass']);
    gulp.watch(["src/*.html","src/app/*","src/app/*/*"]).on('change', function() {
      browserSync.reload();
      // gulp.src("./app/**/**.js").pipe(jsdoc('./docs/js'));
    });
});

gulp.task('sass', function() {
    return gulp.src("sass/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("src/css"))
        .pipe(browserSync.stream());
});

gulp.task('electron', function() {
    gulp.src("")
    .pipe(electron({
        src: './src',
        packageJson: packageJson,
        release: './electron/release',
        cache: './electron/cache',
        version: 'v0.27.0',
        packaging: true,
        platforms: ['win32-ia32', 'darwin-x64'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version,
                iconx: 'gulp-electron.icns'
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "iconx": 'gulp-electron.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
});

gulp.task('docs', function() {
  return gulp.src("./app/**/**.js")
  .pipe(jsdoc('./docs/js'));
});

gulp.task('default', ['serve']);
