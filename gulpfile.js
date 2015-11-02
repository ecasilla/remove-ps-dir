'use strict';
var path             = require('path');
var gulp             = require('gulp');
var eslint           = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha            = require('gulp-mocha');
var istanbul         = require('gulp-istanbul');
var nsp              = require('gulp-nsp');
var plumber          = require('gulp-plumber');
var coveralls        = require('gulp-coveralls');
var notify           = require('gulp-notify');
var header           = require('gulp-header');

gulp.task('static', function () {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('nsp', function (cb) {
  nsp('package.json', cb);
});

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {
  var mochaErr;

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function (err) {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', function () {
      cb(mochaErr);
    });
});

gulp.task('banner', function () {
  var pkg = require('./package.json');
  var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' * @author <%= pkg.author.name %> - <%= pkg.author.email %>',
    ' */',
    ''].join('\n');
  gulp.src('./lib/**/*.js')
    .pipe(header(banner, { pkg: pkg }));
});

gulp.task('coveralls', ['test'], function () {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('prepublish', ['nsp', 'banner']);
gulp.task('default', ['static', 'coveralls']);
gulp.task('chai', ['watch']);

gulp.task('watch', function () {
  gulp.watch('./lib/**/*.js', ['test']).on('error', handleErrors);
  gulp.watch('./test/**/*.js', ['test']).on('error', handleErrors);
});

function handleErrors() {

  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: 'Compile Error',
    message: '<%= error %>'
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
}
