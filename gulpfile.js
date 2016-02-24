var gulp = require('gulp');
var bower = require('bower');
var concat = require('gulp-concat');
var stylus = require('gulp-stylus');
var inject = require('gulp-inject');
var bowerLib = require('bower-files')();
var angularFilesort = require('gulp-angular-filesort');
var slim = require('gulp-slim');
var del = require('del');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var templateCache = require('gulp-angular-templatecache');
var path = require('path');
var protractor = require("gulp-protractor").protractor;
var shell = require("gulp-shell");

path._joinArrayToArray = function (arr, arr2) {
  var res = [];
  if (!arr.length) {
    return arr2;
  }
  if (!arr2.length) {
    return arr;
  }
  arr.forEach(function (el) {
    arr2.forEach(function (el2) {
      if (el2[0] === '!') {
        res.push('!' + path.join(el, el2.slice(1)));
      } else {
        res.push(path.join(el, el2));
      }
    });
  });
  return res;
};

path.joinArray = function () {
  var args = Array.prototype.slice.call(arguments);
  return args.reduce(function (last, cur) {
    cur = Array.isArray(cur) ? cur : [cur];
    last = path._joinArrayToArray(last, cur);
    return last;
  }, []);
};

var src = './frontend';
var dest = './.tmp';
var release = './build';

var paths = {
  css: ['./app.styl'],
  js: ['./**/*.js', '!./**/*.test.js', '!./**/*.e2e.js'],
  templates: ['./**/*.slim'], // need to installed slim
  vendors: ['./vendors/*'],
  img: ['./**/*.{png,jpg,gif,svg}'],
  fonts: ['./fonts/*'],
  e2e: ['./**/*.e2e.js']
};

var swallowError = function (error) {
  console.log('error', error);
  this.emit('end');
};

// Clean dest folder
gulp.task('clean', function () {
  return del(path.join(dest, '**/*'));
});

// Compile all template files
gulp.task('slim template compile', function () {
  return gulp.src(path.joinArray(src, paths.templates))
    .pipe(slim({
      pretty: true,
      options: "attr_list_delims={'(' => ')', '[' => ']'}"
    }))
    .on('error', swallowError)
    .pipe(gulp.dest(path.join(dest, 'html')));
});

gulp.task('create template cache', ['slim template compile'], function () {
  return gulp.src(path.join(dest, 'html/**/*.html'))
    .pipe(templateCache('templates.js', {standalone: true}))
    .pipe(gulp.dest(path.join(dest, 'js')));
});

// Compile all css files
gulp.task('css compile', function () {
  return gulp.src(path.joinArray(src, paths.css))
    .pipe(stylus())
    .pipe(gulp.dest(path.join(dest, 'css')))
    .on('error', swallowError);
});

// Insert all css files
gulp.task('inject files', ['css compile', 'create template cache'], function () {
  return gulp.src(path.join(dest, 'html/index.html'))
    .pipe(gulp.dest(dest))
    .pipe(inject(
      gulp.src([path.join(dest, 'css', '**/*.css')], {read: false}),
      {
        relative: true,
        name: 'css'
      }))
    .pipe(inject(
      gulp.src(path.joinArray(dest, 'js', paths.js)) // gulp-angular-filesort depends on file contents, so don't use {read: false} here
        .pipe(angularFilesort())
        .on('error', swallowError),
      {
        relative: true,
        name: 'angular'
      }))
    .pipe(inject(
      gulp.src(bowerLib.ext(['js', 'css']).files),
      {
        name: 'bower'
      }))
    .pipe(inject(
      gulp.src(path.joinArray(src, paths.vendors))
        .pipe(gulp.dest(path.join(dest, 'vendors'))),
      {
        relative: true,
        name: 'vendors'
      }))
    .pipe(gulp.dest(dest));
});

// copy img files
gulp.task('copy img', function () {
  return gulp.src(path.joinArray(src, paths.img))
    .pipe(gulp.dest(dest));
});

// copy fonts files
gulp.task('copy fonts', function () {
  return gulp.src(path.joinArray(src, paths.fonts))
    .pipe(gulp.dest(path.join(dest, 'fonts')))
});

// copy js files
gulp.task('copy js', function () {
  return gulp.src(path.joinArray(src, paths.js))
    .pipe(gulp.dest(path.join(dest, 'js')))
});

gulp.task('build', ['copy img', 'copy fonts', 'copy js', 'inject files']);

gulp.task('watch', ['build'], function () {
  var w = path.joinArray(src, '**/*');
  w.push('./bower.json');
  watch(w, function () {
    console.log(arguments);
    gulp.run('build');
  });
});

gulp.task('serve-start', function (done) {
  var server = require('./serve');
  server.then(function(app) { done(); });
});

gulp.task('serve-end', ['run-protractor'], function (done) {
  process.exit();
});

gulp.task('run-protractor', ['serve-start'], shell.task('protractor protractor.conf.js'));

gulp.task('e2e', ['build', 'serve-start', 'serve-end']);

gulp.task('dev', ['watch', 'serve-start']);

gulp.task('prod', ['serve-start']);

gulp.task('release', ['build'], function () {
  return gulp.src(path.join(dest, '**/*'))
    .pipe(gulp.dest(release))
});

gulp.task('default', ['dev']);

