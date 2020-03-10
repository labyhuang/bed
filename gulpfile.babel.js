import gulp from 'gulp'
import babel from 'gulp-babel'
import mocha from 'gulp-mocha'
import uglifyes from 'uglify-es'
import composer from 'gulp-uglify/composer'
import del from 'del'

const uglify = composer(uglifyes, console)

const paths = {
  js: ['src/**/*.js'],
  nonJs: [],
  test: {
    src: 'test/*.js',
    dist: 'test-dist/',
    run: 'test-dist/*.js'
  },
  data: []
}

const clean = () => del(['dist/**', 'dist/.*', '!dist'])
const cleanTest = () => del(['test-dist/**'])
// const copy = () => gulp.src(paths.nonJs).pipe(newer('dist')).pipe(gulp.dest('dist'))
const babelTest = () => gulp.src(paths.test.src).pipe(babel()).pipe(gulp.dest(paths.test.dist))

export function runTest () {
  return gulp.src('test-dist/index-test.js')
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', err => console.log(err.stack))
}

export function scripts () {
  return gulp.src([...paths.js, '!gulpfile.babel.js'])
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
}

gulp.task('build', gulp.series(clean, scripts))
gulp.task('test', gulp.series(clean, scripts, cleanTest, babelTest, runTest))
