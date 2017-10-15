var less = require('gulp-less');
var path = require('path');
var gulp = require('gulp');
var debug = require('gulp-debug');
var argv = require('yargs');
var gulpif = require('gulp-if');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var merge = require('merge-stream');
var validator = require('gulp-html');

 var paths = {
    js: ['./node_modules/jquery/dist/jquery.min.js'
        , './node_modules/bootstrap/dist/js/bootstrap.min.js'
        , './node_modules/jquery-ui-dist/jquery-ui.js'
        , 'src/js/*.js'],
    less: ['application.less'],
    css: ['application.less'],
    pages:['./src/html/index.html'],
    static: {
        img: ['./src/images/**']
        ,
        js: ['./node_modules/html5shiv/src/html5shiv.js',
            './node_modules/respond.js/src/respond.js']
        ,
        font: ['./node_modules/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}'
            , './node_modules/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}']
    },
    target: './build'
};
var output = "./build";
var outputCss = output + '/css/';
var outputFonts = output + '/fonts/';
var outputJs = output + '/js/';
var outputImg = output + '/images/';
var outputHtml = output + '/html/';

var debugMode = true;

gulp.task('scripts', function () {
    return gulp.src(paths.js)
        .pipe(gulpif(debugMode, debug({title: 'scripts'})))
        .pipe(concat('application.js'))
        .pipe(gulp.dest(outputJs));
});

gulp.task('compile-less', function () {
    return gulp.src(paths.less)
        .pipe(gulpif(debugMode, debug({title: 'less'})))
        .pipe(less())
        .pipe(gulpif(argv.production, minifyCSS()))
        .pipe(gulp.dest(outputCss));
});

gulp.task('styles', ['compile-less'], function () {
    return merge(
        gulp.src(paths.static.font)
            .pipe(gulpif(debugMode, debug({title: 'copy-font'})))
            .pipe(gulp.dest(outputFonts))
        ,
        gulp.src([outputCss + 'application.css',
            './node_modules/@typopro/web-montserrat/TypoPRO-Montserrat-Regular.css'])
        	.on('error', swallowError)
            .pipe(concat('application.css'))
            .pipe(gulpif(debugMode, debug({title: 'concat-css'})))
            .pipe(gulp.dest(outputCss))
    );
});

gulp.task('target-html', function() {
  return gulp.src(paths.pages)
	  .pipe(gulpif(debugMode, debug({title: 'target-html'})))
	  .pipe(gulp.dest(outputHtml));
});
gulp.task('target-images', function(){
    return gulp.src(paths.static.img)
      .pipe(gulpif(debugMode, debug({title: 'target-images'})))
      .pipe(gulp.dest(outputImg));
});

gulp.task('static', function () {
    return merge(
        gulp.src(paths.static.js)
            .pipe(gulpif(debugMode, debug({title: 'static-js'})))
            .pipe(gulp.dest(outputJs))
        ,
        gulp.src(paths.static.img)
            .pipe(gulpif(debugMode, debug({title: 'static-img'})))
            .pipe(gulp.dest(outputImg)));
});

gulp.task('target-css', ['styles'], function () {
    return gulp.src([output + '/**.css', output + './**/**.css'])
        .pipe(gulpif(debugMode, debug({title: 'target-css'})))
        .pipe(gulp.dest(paths.target));
});
gulp.task('target-js', ['scripts'], function () {
    return gulp.src([output + '/**.js', output + './**/**.js'])
        .pipe(gulpif(debugMode, debug({title: 'target-js'})))
        .pipe(gulp.dest(paths.target));
});

gulp.task('build', ['target-html','scripts', 'static', 'styles']);

gulp.task('default', ['build'], function () {
    gulp.watch(paths.js.concat(paths.static.js), ['target-js']);
    gulp.watch(['**.less', './**/**.less'], ['target-css']);
    gulp.watch(['src/html/*.html'], ['target-html', 'target-images'])
    gulp.src(output + '/**')
        .pipe(gulpif(debugMode, debug({title: 'target'})))
        .pipe(gulp.dest(paths.target));
});

function swallowError (error) {
  console.log(error.toString())
  this.emit('end')
}