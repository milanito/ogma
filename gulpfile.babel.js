import gulp from 'gulp';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import changed from 'gulp-changed';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import gulpSequence from 'gulp-sequence';

const SRC = './src/**/*.js';
const DEST = 'dist';

gulp.task('clean', done =>
  rimraf('dist', () => done()));

gulp.task('pre-build', done =>
  mkdirp('dist', () => done()));

gulp.task('babel', () =>
  gulp.src(SRC)
  .pipe(changed(DEST))
  .pipe(babel({
    presets: ['env']
  }))
  .pipe(gulp.dest(DEST)));

gulp.task('watch', ['build'], () =>
  nodemon({
    script: 'dist',
    watch: 'src',
    tasks: 'babel'
  }));

gulp.task('build', gulpSequence('clean', 'pre-build', 'babel'));
