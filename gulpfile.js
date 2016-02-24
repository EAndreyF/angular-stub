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
var seq = require('run-sequence');

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
var dest = './build';
var tmp = './.tmp';

var templates = {
  fonts: ['eot', 'woff', 'ttf', 'svg'],
  img: ['png', 'jpg', 'gif', 'svg']
};

var paths = {
  css: ['./app.styl'],
  js: ['./**/*.js', '!./**/*.test.js', '!./**/*.e2e.js'],
  templates: ['./**/*.slim'], // need to installed slim
  img: ['./**/*.{' + templates.img.join(',') + '}'],
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

gulp.task('bower js', function () {
  return gulp.src(bowerLib.ext('js').files)
    .pipe(concat('bower.js'))
    .pipe(gulp.dest(path.join(tmp, 'bower')));
});

gulp.task('bower css', function () {
  return gulp.src(bowerLib.ext('css').files)
    .pipe(concat('bower.css'))
    .pipe(gulp.dest(path.join(tmp, 'bower')));
});

gulp.task('bower fonts', function () {
  return gulp.src(bowerLib.ext(templates.fonts).files)
    .pipe(gulp.dest(path.join(dest, 'bower')));
});

gulp.task('bower', ['bower js', 'bower css', 'bower fonts']);

// Compile all template files
gulp.task('slim template compile', function () {
  return gulp.src(path.joinArray(src, paths.templates))
    .pipe(slim({
      pretty: true,
      options: "attr_list_delims={'(' => ')', '[' => ']'}"
    }))
    .on('error', swallowError)
    .pipe(gulp.dest(path.join(tmp, 'html')))
});

gulp.task('create template cache', ['slim template compile'], function () {
  return gulp.src(path.join(tmp, 'html/**/*.html'))
    .pipe(templateCache('templates.js', {standalone: true}))
    .pipe(gulp.dest(path.join(tmp, 'js')));
});

// Compile all css files
gulp.task('compile css app', function () {
  return gulp.src(path.joinArray(src, paths.css))
    .pipe(stylus())
    .pipe(gulp.dest(path.join(tmp, 'css')))
    .on('error', swallowError);
});

gulp.task('compile css', ['compile css app', 'bower'], function () {
  return gulp.src([
    path.join(tmp, 'bower/*.css'),
    path.join(tmp, 'css/*.css')
  ])
    .pipe(concat('main.css'))
    .pipe(gulp.dest(path.join(dest, 'css')));
});

// copy js files
gulp.task('compile js', ['create template cache'], function () {
  var files = path.joinArray(src, paths.js);
  files.push(path.join(tmp, 'js/*.js'));
  files.push(path.join(tmp, 'bower/*.js'));
  return gulp.src(files)
    .pipe(angularFilesort())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(path.join(dest, 'js')));
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

// Insert all css files
gulp.task('inject files', ['compile js', 'compile css', 'create template cache', 'bower'], function () {
  return gulp.src(path.join(tmp, 'html/index.html'))
    .pipe(gulp.dest(dest))
    .pipe(inject(
      gulp.src([path.join(dest, 'css', '**/*.css')], {read: false}),
      {
        relative: true,
        name: 'css'
      }))
    .pipe(inject(
      gulp.src(path.join(dest, 'js/*')),
      {
        relative: true,
        name: 'angular'
      }))
    .pipe(gulp.dest(dest));
});

gulp.task('build', function (done) {
  seq('clean', ['copy img', 'copy fonts', 'inject files'], done);
});

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
  server.then(function () {
    done();
  });
});

gulp.task('serve-end', ['run-protractor'], function () {
  process.exit();
});

gulp.task('run-protractor', ['serve-start'], shell.task('protractor protractor.conf.js'));

gulp.task('e2e', ['build', 'serve-start', 'serve-end']);

gulp.task('dev', ['watch', 'serve-start']);

gulp.task('prod', ['serve-start']);

gulp.task('default', ['dev']);

