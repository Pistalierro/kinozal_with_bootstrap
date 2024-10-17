/** @format */

const { task, src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const concat = require('gulp-concat');
const terser = require('gulp-terser');

const PATH = {
  htmlFiles: './*.html',
  cssFolred: './assets/css',
  cssFiles: './assets/css/**/*.css',
  cssMinFiles: './assets/css/**/*.min.css',
  scssRoot: './assets/scss/style.scss',
  scssFiles: './assets/scss/**/*.scss',
  scssFolder: './assets/scss',
  jsFiles: [
    './assets/js/**/*.js',
    '!./assets/js/**/*.min.js',
    '!./assets/js/**/bundle.js',
  ],
  jsMinFiles: './assets/js/**/*.min.js',
  jsFolder: './assets/js',
  jsBundleName: 'bundle.js',
  buildFolder: './dist',
};

const PLUGINS = [
  autoprefixer({
    overrideBrowserslist: ['last 5 versions', '> 1%'],
    cascade: true,
  }),
  mqpacker({
    sort: sortCSSmq,
  }),
];

function scss() {
  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(csscomb())
    .pipe(dest(PATH.cssFolred))
    .pipe(
      notify({
        message: 'Compiled!',
      })
    )
    .pipe(browserSync.reload({ stream: true }));
}

function scssMin() {
  const pluginsExtended = [...PLUGINS, cssnano({ preset: 'default' })];
  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(pluginsExtended))
    .pipe(csscomb())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssFolred));
}

function scssDev() {
  return src(PATH.scssRoot, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssFolred, { sourcemaps: true }))
    .pipe(browserSync.reload({ stream: true }));
}

function comb() {
  return src(PATH.scssFiles).pipe(csscomb()).pipe(dest(PATH.scssFolder));
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
}

async function sync() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.scssFiles, scss);
  watch(PATH.htmlFiles, sync);
  watch(PATH.jsFiles, sync);
  // watch(PATH.cssFiles, sync);
}

function watchDevFiles() {
  syncInit();
  watch(PATH.scssFiles, scssDev);
  watch(PATH.htmlFiles, sync);
  watch(PATH.jsFiles, sync);
}

function concatJS() {
  return src(PATH.jsFiles)
    .pipe(concat(PATH.jsBundleName))
    .pipe(dest(PATH.jsFolder));
}

function uglifyJS() {
  return src(PATH.jsFiles)
    .pipe(
      terser({
        toplevel: true,
        output: { quote_style: 3 },
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsFolder));
}

function buildHTML() {
  return src(PATH.htmlFiles).pipe(dest(PATH.buildFolder + '/tamplates'));
}
function buildCSS() {
  return src(PATH.cssMinFiles).pipe(dest(PATH.buildFolder + '/css'));
}
function buildJS() {
  return src(PATH.jsMinFiles).pipe(dest(PATH.buildFolder + '/js'));
}

task('min', scssMin);
task('scss', series(scss, scssMin));
task('dev', scssDev);
task('watch', watchFiles);
task('watchDev', watchDevFiles);
task('comb', comb);
task('concat', concatJS);
task('uglify', uglifyJS);
task('build', parallel(buildHTML, buildCSS, buildJS));
