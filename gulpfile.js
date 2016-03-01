'use strict';
var env = process.env.NODE_ENV || 'development',
	gulp = require('gulp'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	jade = require('gulp-jade'),
	sass = require('gulp-sass'),
	coffee = require('gulp-coffee'),
	uglify = require('gulp-uglify'),
	htmlmin = require('gulp-html-minifier'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	concat = require('gulp-concat'),
	gutil = require('gulp-util'),
	notify = require("gulp-notify");

/* Jade */
gulp.task('templates', function () {
	var local = {};
	gulp.src('source/layouts/*.jade')
		.pipe(plumber())
		.pipe(jade({
			locals: local,
			pretty: env === 'development'
		}))
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('dist'))
		.pipe(notify({
			"title": "Jade",
			"message": "<%= file.relative %>"
		}));
});

/* Styles */
gulp.task('styles', function () {
	var config = {
		outputStyle: 'compressed'
	};
	return gulp.src('source/sass/*.scss')
		.pipe(plumber())
		.pipe(sass(config))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/css'))
		.pipe(notify({
			"title": "Styles",
			"message": "<%= file.relative %>"
		}));
});

/* CoffeeScript */
gulp.task('coffee', function () {
	return gulp.src('source/coffeescript/**/*')
		.pipe(plumber())
		.pipe(coffee({bare: true}).on('error', gutil.log))
		.pipe(gulp.dest('source/javascript/'));
});

/* Javascript Final */
gulp.task('javascript', function () {
	return gulp.src([
			'source/javascript/jquery.js',
			'source/javascript/plugins/**/*',
			'source/javascript/application.js'
		])
		.pipe(concat('apps.js', {newLine: ';'}))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/js/'))
		.pipe(notify({
			"title": "Javascript Final",
			"message": "<%= file.relative %>"
		}));
});

/*Tarea para concatenar Js con compatibilidad IE*/
gulp.task('scripts-ie', function () {
	return gulp.src('source/javascript/libs-ie/**/*.js')
		.pipe(concat('libs-ie.js', {newLine: ';'}))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/js/'))
		.pipe(notify({
			"title": "Js con compatibilidad IE",
			"message": "<%= file.relative %>"
		}));
});

/* Modernizr */
gulp.task('modernizr', function () {
	return gulp.src('source/javascript/modernizr.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/js/'))
		.pipe(notify({
			"title": "Modernizr",
			"message": "<%= file.relative %>"
		}));
});

/* Copiar Fonts a dist */
gulp.task('fonts', function () {
	return gulp.src('source/sass/fonts/**/*')
		.pipe(gulp.dest('dist/css/fonts'));
});

/*Compresor de imagenes*/
gulp.task('image-compress', function () {
	return gulp.src('source/images/**/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [pngquant({
				quality: '65-80',
				speed: 4
			})]
		}))
		.pipe(gulp.dest('dist/images'))
		.pipe(notify({
			"title": "Compresor de imagenes",
			"message": "<%= file.relative %>"
		}));
});

gulp.task('watch', function () {
	gulp.watch('source/layouts/**/*.jade', ['templates']);
	gulp.watch('source/sass/**/*.scss', ['styles']);
	gulp.watch('source/sass/fonts/**/*', ['fonts']);
	gulp.watch('source/coffeescript/**/*.coffee', ['coffee']);
	gulp.watch('source/javascript/*.js', ['javascript']);
	gulp.watch('source/javascript/plugins/**/*.js', ['javascript']);
	gulp.watch('source/javascript/libs-ie/**/*.js', ['scripts-ie']);
	gulp.watch('source/images/**/*', ['image-compress']);
});

gulp.task('default', ['watch', 'styles', 'fonts', 'templates', 'scripts-ie', 'coffee', 'javascript', 'modernizr']);