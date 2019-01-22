'use strict';
const env = process.env.NODE_ENV || 'development',
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-html-minifier'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util'),
    del = require("del"),
    sequence = require("gulp-sequence"),
    notify = require("gulp-notify");

const publicDir = "dist",
    src = {
        sass: "source/sass/*.scss",
        coffee: "source/coffeescript/**/*",
        js: "source/javascript/",
        pug: "source/layouts/*.pug",
        img: "source/images/**/*",
        fonts: "source/css/fonts/**/*",
        plugins: "source/javascript/plugins/**/*.js",
        libsie: "source/javascript/libs-ie/**/*.js"
    },
    dist = {
        all: publicDir + "/**/*",
        css: publicDir + "/css/",
        js: publicDir + "/js/",
        img: publicDir + "/images/",
        fonts: publicDir + "/css/fonts/"
    };

/* Pug */
gulp.task('templates', function () {
    var local = {};
    gulp.src(src.pug)
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(pug({
            locals: local,
            pretty: env === 'development'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(publicDir))
        .pipe(notify({
            "title": "Pug",
            "message": "<%= file.relative %>"
        }));
});

/* Styles */
gulp.task('styles', function () {
    var config = {
        outputStyle: 'compressed'
    };
    return gulp.src(src.sass)
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(sass(config))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dist.css))
        .pipe(notify({
            "title": "Styles",
            "message": "<%= file.relative %>"
        }));
});

/* CoffeeScript */
gulp.task('coffee', function () {
    return gulp.src(src.coffee)
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(gulp.dest(src.js));
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
        .pipe(gulp.dest(dist.js))
        .pipe(notify({
            "title": "Javascript Final",
            "message": "<%= file.relative %>"
        }));
});

/*Tarea para concatenar Js con compatibilidad IE*/
gulp.task('scripts-ie', function () {
    return gulp.src(src.libsie)
        .pipe(concat('libs-ie.js', {newLine: ';'}))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dist.js))
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
        .pipe(gulp.dest(dist.js))
        .pipe(notify({
            "title": "Modernizr",
            "message": "<%= file.relative %>"
        }));
});

/* Copiar Fonts a dist */
gulp.task('fonts', function () {
    return gulp.src(src.fonts)
        .pipe(gulp.dest(dist.fonts));
});

/*Compresor de imagenes*/
gulp.task('image-compress', function () {
    return gulp.src(src.img)
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 3,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant({
                quality: '65-80',
                speed: 4
            })]
        }))
        .pipe(gulp.dest(dist.img))
        .pipe(notify({
            "title": "Compresor de imagenes",
            "message": "<%= file.relative %>"
        }));
});

/* Limpiando carpeta dist */
gulp.task('clean', function (cb) {
    del(dist.all, cb);
});

/* A la espera de alguna modificacion en los siguientes folders */
gulp.task('watch', function () {
    gulp.watch(src.pug, ['templates']);
    gulp.watch(src.sass, ['styles']);
    gulp.watch(src.fonts, ['fonts']);
    gulp.watch(src.coffee, ['coffee']);
    gulp.watch(src.js, ['javascript']);
    gulp.watch(src.plugins, ['javascript']);
    gulp.watch(src.libsie, ['scripts-ie']);
    gulp.watch(src.img, ['image-compress']);
});

gulp.task('default', ['clean', 'watch', 'styles', 'fonts', 'templates', 'scripts-ie', 'coffee', 'javascript', 'modernizr', 'image-compress']);