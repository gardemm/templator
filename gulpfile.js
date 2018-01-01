const gulp          = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    browserSync     = require('browser-sync'),
    del             = require('del'),
    runSequence     = require('run-sequence')
    pump            = require('pump');
;

// --------------- ENVIRONMENT ------- //

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const log = $.util.log;

const appDir = 'app/';
const publicDir = 'public/';

// --------------- TASKS ------------- //

// default
gulp.task('default', ['serve'], () => {

});



// clean
gulp.task('clean', () => {
    return del(['public']);
});



// styles + sass
gulp.task('styles', ['sass'], () => {
    gulp.src(appDir + 'css/**/*.css')
        .pipe(gulp.dest(publicDir + 'css'));
});



// sass
gulp.task('sass', () => {
    gulp.src(appDir + 'sass/custom.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({ browsers: ['> 1%', 'last 3 versions', 'Firefox ESR'] }))
        .pipe($.cleanCss({debug: true}, function(details) {
            console.log(details.name + ' origin: ' + details.stats.originalSize);
            console.log(details.name + ' minify: ' + details.stats.minifiedSize);
        }))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(appDir + 'css'));
});



// browser synchro
gulp.task('sync', () => {
    browserSync({
        notify: true,
        port: 9000,
        browser: "google chrome",
        server: {
          baseDir: publicDir
        }
    });

    gulp.watch([
        appDir + 'images/*',
        appDir + '*.html',
        appDir + 'partials/**/*.html',
        appDir + 'sass/**/*.scss',
        appDir + 'js/**/*.js'
    ]).on('change', reload);
});



// serve (public)
gulp.task('serve', () => {
    // sequence
    runSequence('build', 'sync');

    gulp.watch(appDir + 'sass/**/*.scss', ['styles']);
    gulp.watch(appDir + 'images/**/*', ['images']);
    gulp.watch(appDir + 'js/**/*', ['js']);
    gulp.watch([appDir + '*.html', appDir + 'partials/**/*.html'], ['html']);
});



// fonts
gulp.task('fonts', () => {
    gulp.src(appDir + 'fonts/*')
        .pipe(gulp.dest(publicDir + 'fonts'));
});



// js
gulp.task('js', (cb) => {
    pump([
        gulp.src( appDir + 'js/**/*.js' ),
        $.size(function (details) {
            console.log(details);
        }),
        $.uglify(),
        $.size(function (details) {
            console.log(details);
        }),
        gulp.dest( publicDir + 'js' )
    ], cb);
});



// extras
gulp.task('extras', () => {

    // vendor
    gulp.src(appDir + 'vendor/**/*')
        .pipe(gulp.dest(publicDir + 'vendor'));

    // php
    gulp.src(appDir + 'php/**/*.php')
        .pipe(gulp.dest(publicDir + 'php'));

    gulp.src([
        appDir + '*.*',
        appDir + '.htaccess',
        '!' + appDir + 'index.html'])
        .pipe(gulp.dest( publicDir ));
});



// images
gulp.task('images', () => {
    gulp.src(appDir + 'images/**/*.{jpg,png,svg}')
        .pipe($.cache($.imagemin({
          progressive: true,
          interlaced: true,
          // don't remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{cleanupIDs: false}]
        })))
        .pipe(gulp.dest(publicDir + 'images'))
        .pipe($.rename({
            suffix: "@2x"
        }))
        .pipe(gulp.dest(publicDir + 'images'))
});



// html
gulp.task('html', () => {
    gulp.src(appDir + '*.html')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.inject(gulp.src([ appDir + 'partials/**/*.html' ]), {
            starttag: '<!-- inject:{{path}} -->',
            relative: true,
            transform: function (filePath, file) {
                // return file contents as string
                return file.contents.toString('utf8');
            }
        }))
        .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
        //.pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cleanCss({debug: true}, function(details) {
            console.log(details.name + ' origin: ' + details.stats.originalSize);
            console.log(details.name + ' minify: ' + details.stats.minifiedSize);
        })))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest( publicDir ));
});



// build
gulp.task('build', () => {
    // without clean
    return runSequence(['fonts', 'extras', 'styles', 'images'], 'js', 'html');
});
