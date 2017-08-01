var gulp = require('gulp');
var pump = require('pump');
var tinify = require('gulp-tinify');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

// identify Shopify assets
var assets = './assets/'
var jsScripts = [assets + 'tricky3.*js', '!' + assets + 'tricky3*.min.js'];

// minify scripts
gulp.task('scripts', function(){
  pump([
    gulp.src(jsScripts),
    rename(function(script) {
      script.extname = '.min.js';
      return script;
    }),
    uglify(),
    gulp.dest(assets)
  ])
});

// Watch
gulp.task('watch-scripts', function(){
  var tasks = ['scripts'];
  gulp.watch([jsScripts], tasks);
});

gulp.task('default', ['watch-scripts']);