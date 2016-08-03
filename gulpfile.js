// For development => gulp
// For production  => gulp -p

// Call Plugins
var env       = require('minimist')(process.argv.slice(2)),
  gulp        = require('gulp'),
  gutil       = require('gulp-util'),
  plumber     = require('gulp-plumber'),
  nunjucks    = require('gulp-nunjucks-render'),
  minifyHtml  = require('gulp-minify-html'),
  browserSync = require('browser-sync'),
  uglify      = require('gulp-uglify'),
  concat      = require('gulp-concat'),
  gulpif      = require('gulp-if'),
  sass        = require('gulp-sass'),
  cache       = require('gulp-cache'),
  clean       = require('gulp-clean'),
  prefixer    = require('gulp-autoprefixer'),
  imagemin    = require('gulp-imagemin'),
  eslint      = require('gulp-eslint'),
  jasmine     = require('gulp-jasmine'),
  Reporter    = require('jasmine-spec-reporter'),
  rollup      = require('gulp-rollup'),
  path        = require('path');

// Call Nunjucks for compile Templates
gulp.task('nunjucks', function(){
  return gulp.src('src/templates/*.html')
    .pipe(plumber())
    .pipe(nunjucks({
      path: path.join(__dirname, 'src/templates')
    })).on('error', console.log)
    .pipe(gulpif(env.p, minifyHtml()))
    .pipe(gulp.dest('build/'));
});

// Call Uglify and Concat JS
gulp.task('js', function(){
  return gulp.src(['src/js/**/*.js'])
    .pipe(plumber())
    // .pipe(concat('app.js'))
    .pipe(rollup({
      entry: './src/js/app.js',
    }))
    .pipe(gulpif(env.p, uglify()))
    .pipe(gulp.dest('build/js'));
});

// Call sass
gulp.task('sass', function(){
  gulp.src('src/scss/app.scss')
    .pipe(plumber())
    .pipe(sass({
      style: 'expanded',
      sourcemap: false 
    })).on('error', console.log)
    .pipe(prefixer())
    .pipe(gulp.dest('build/css'));
});

// Call Imagemin
gulp.task('imagemin', function() {
  return gulp.src('src/img/**/*')
    .pipe(plumber())
    //.pipe(cache())
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('build/img'));
});

// Call Watch
gulp.task('watch', function(){
  gulp.watch('src/templates/**/*.html', ['nunjucks']);
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/js/**/*.js', ['js', 'lint']);
  gulp.watch('src/img/**/*.{jpg,png,gif}', ['imagemin']);
});

gulp.task('clean', function () {
  return gulp.src('build')
    .pipe(plumber())
    .pipe(clean({force: true}));
});

gulp.task('lint', () => {
  return gulp.src(['src/js/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', () => {
  return gulp.src('tests/**/*_test.js')
    .pipe(jasmine({
      reporter: new Reporter(),
    }));
});

gulp.task('browser-sync', function () {
  var files = [
    'build/**/*.html',
    'build/css/**/*.css',
    'build/img/**/*',
    'build/js/**/*.js'
  ];

  browserSync.init(files, {
    server: {
      baseDir: './build/'
    }
  });
});

// Default task
gulp.task('default', ['nunjucks', 'js', 'lint', 'sass', 'imagemin', 'watch', 'browser-sync']);