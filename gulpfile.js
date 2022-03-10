//----------------------------------------------------------------------
//  mode
//----------------------------------------------------------------------
'use strict';

//----------------------------------------------------------------------
//  require
//----------------------------------------------------------------------
const gulp = require('gulp');
const { src, dest, series, parallel, watch } = require('gulp');

const dartSass = require('gulp-sass')(require('sass'));

const del = require('del');
const bs = require('browser-sync');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const connect = require('gulp-connect-php');
const browserSync = require('browser-sync');

const $ = require('gulp-load-plugins')();


//----------------------------------------------------------------------
//  path
//----------------------------------------------------------------------
const proj = {
    dev: './src',
    pro: './dist',
};

const paths = {
    clean: {
        src: `${proj.pro}/**`,
    },

    css: {
        src: `${proj.dev}/css/**`,
        dest: `${proj.pro}/css`,
    },
    font: {
        src: `${proj.dev}/font/**`,
        dest: `${proj.pro}/font`,
    },
    html: {
        src: `${proj.dev}/**/*.html`,
        dest: `${proj.pro}/`,
    },
    php:{
        src: `${proj.dev}/**/*.php`,
        dest: `${proj.pro}/`,
    },
    image: {
        src: `${proj.dev}/image/**`,
        dest: `${proj.pro}/image`,
    },
    js: {
        src: `${proj.dev}/js/**/*.js`,
        dest: `${proj.pro}/js`,
    },
    scss: {
        src: `${proj.dev}/scss/**.scss`,
        dest: `${proj.pro}/css/`,
    },
    vendor: {
        src: `${proj.dev}/vendor/**`,
        dest: `${proj.pro}/vendor`,
    },

    watch: {
        src: [`${proj.dev}/**`, `!${proj.dev}/css/**`],
    },
};

const bsConf = {
    base: `./`,
    start: `${proj.pro}/index.html`,
};

const clean = (done) => {
    del(paths.clean.src);

    done();
};

const development = (done) => {
    // css
    // 処理なし

    // font
    // 処理なし

    // html
    // 処理なし

    // image
    // 処理なし

    // js
    // 処理なし

    // sass
    src(paths.scss.src) // コンパイル
        .pipe($.plumber())
        .pipe($.sassGlobUseForward())
        .pipe(dartSass())
        .pipe($.autoprefixer())
        .pipe(dest(paths.scss.dest));

    // vendor
    // 処理なし

    done();
};

const production = (done) => {

    // font
    src(paths.font.src) // コピー
        .pipe($.plumber())
        .pipe(dest(paths.font.dest));

    // html
    src(paths.html.src) // コピー
        .pipe($.plumber())
        .pipe(dest(paths.html.dest));
    // php
    src(paths.php.src)
        .pipe($.plumber())
        .pipe(dest(paths.php.dest));
    // image
    src(paths.image.src) // 圧縮、コピー
        .pipe($.plumber())
        .pipe($.changed(paths.image.dest))
        .pipe(
            $.imagemin([
                pngquant({
                    quality: [0.6, 0.7],
                    speed: 1,
                }),
                mozjpeg({ quality: 65 }),
                $.imagemin.svgo(),
                $.imagemin.optipng(),
                $.imagemin.gifsicle({
                    optimizationLevel: 3,
                }),
            ])
        )
        .pipe(dest(paths.image.dest));

    // js
    src(paths.js.src) // 圧縮、コピー
        .pipe($.plumber())
        .pipe($.uglify())
        .pipe(dest(paths.js.dest));

    // sass
    src(paths.scss.src) // コンパイル
        .pipe($.plumber())
        .pipe($.sassGlobUseForward())
        .pipe(dartSass())
        .pipe($.autoprefixer())
        .pipe(dest(paths.scss.dest));

    // vendor
    src(paths.vendor.src) // コピー
        .pipe($.plumber())
        .pipe(dest(paths.vendor.dest));

    done();
};


const bsInit = (done) => {
    connect.server({
        base:'./dist',
        bin: 'C:/xampp/php/php.exe',
        ini: 'C:/xampp/php/php.ini'
    }, function(){
        browserSync({
            proxy: 'localhost:8000'
        });
    });

    done();
};

const bsReload = (done) => {
    bs.reload();

    done();
};


//----------------------------------------------------------------------
//  watchTask
//----------------------------------------------------------------------
const watchTask = (done) => {
    watch(paths.watch.src, series(production, bsReload));

    done();
};

//----------------------------------------------------------------------
//  export
//----------------------------------------------------------------------
exports.clean = clean;
exports.development = series(development, bsInit, bsReload, watchTask);
exports.default = series(clean, production, bsInit, bsReload, watchTask);

/************************************************************************/
/*  END OF FILE                                                         */
/************************************************************************/
