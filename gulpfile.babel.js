import { src, dest, watch, parallel, series } from 'gulp'
import { create } from 'browser-sync'
import del from 'del'
import rename from 'gulp-rename'
import concat from 'gulp-concat'
import rollup from 'gulp-rollup'
import babel from 'rollup-plugin-babel'
import pug from 'gulp-pug'
import sass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'
import { init, write } from 'gulp-sourcemaps'
import csso from 'gulp-csso'

const browserSync = create()

const PATHS = {
  dist: "./docs",
  assets: "./docs/assets",
  src: "./src",
  public: "./public",
}


// CLEAN
export const cleanTask = () => {
  return del(PATHS.dist)
}

// SERVER
export const serverTask = () => {
  return browserSync.init({
    server: PATHS.dist,
    https: false,
    open: false
  });
}

// PUBLIC
export const publicTask = () => {
  return src(PATHS.public + "/**/*.*")
    .pipe(dest(PATHS.dist))
    .on('end', browserSync.reload)
}

// PUG
export const pugTask = () => {
  return src(PATHS.src + '/views/**/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest(PATHS.dist))
    .on('end', browserSync.reload)
}

// STYLE
export const styleTask_Lib = () => {
  return src(PATHS.src + '/libs/**/*.css')
    .pipe(concat('libs.min.css'))
    .pipe(csso())
    .pipe(dest(PATHS.assets + '/css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}
export const styleTask_Dev = () => {
  return src(PATHS.src + '/sass/index.sass')
    .pipe(init())
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist:  ['last 10 versions']
    }))
    .pipe(write())
    .pipe(rename('main.css'))
    .pipe(dest(PATHS.assets + '/css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

// SCRIPT
export const scriptTask_Lib = () => {
  return src(PATHS.src + '/libs/**/*.js')
    .pipe(concat('libs.min.js'))
    .pipe(dest(PATHS.assets + '/js/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}
export const scriptTask_Dev = () => {
  return src(PATHS.src + '/js/index.js')
    .pipe(init())
    .pipe(rollup({
      allowRealFiles: true,
      input: PATHS.src + '/js/index.js',
      output: {
        format: 'cjs',
        sourcemap: 'inline'
      },
      plugins: [
        babel({
          exclude: 'node_modules/**'
        })
      ],
    }))
    .pipe(rename('main.js'))
    .pipe(write())
    .pipe(dest(PATHS.assets + '/js/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

// WATCH
export const watchTask = () => {
  watch(PATHS.public + "/**/*.*", series(publicTask));
  watch(
    [
      PATHS.src + "/views/**/*.pug",
      PATHS.src + "/layouts/**/*.pug",
      PATHS.src + "/components/**/*.pug",
    ],
    series(pugTask)
  );
  watch(PATHS.src + "/libs/**/*.css", series(styleTask_Lib));
  watch(
    [
      PATHS.src + "/sass/**/*.sass",
      PATHS.src + "/components/**/*.sass"
    ],
    series(styleTask_Dev)
  );
  watch(PATHS.src + "/libs/**/*.js", series(scriptTask_Lib));
  watch(
    [
      PATHS.src + "/js/**/*.js",
      PATHS.src + "/components/**/*.js"
    ],
    series(scriptTask_Dev)
  );
}

//DEV
export const devTask = series(
  cleanTask,
  parallel(
    publicTask,
    pugTask,
    styleTask_Lib,
    styleTask_Dev,
    scriptTask_Lib,
    scriptTask_Dev
  )
)

export default series(
  devTask,
  parallel(
    watchTask,
    serverTask
  )
)
