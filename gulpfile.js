var gulp = require('gulp');
var plumber = require('gulp-plumber');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

// gulp plumber error handler
var onError = function(err){
  console.log(err);
}

// identify Shopify assets
var assets = './assets/'
var jsScripts = [assets + 'tricky3.infinitescroll.v1.*js', '!' + assets + 'tricky3.infinitescroll.v1*.min.js'];

// minify custom scripts
gulp.task('scripts', function(){
  return gulp.src(jsScripts)
  .pipe(plumber({
    errorHandler:onError
  }))
  .pipe(rename(function(script) {
    script.extname = '.min.js';
    return script;
  }))
  .pipe(uglify())
  .pipe(gulp.dest(assets));
});

gulp.task('watch-scripts', function(){
  var tasks = ['scripts'];
  gulp.watch([jsScripts], tasks);
});

gulp.task('default', ['watch-scripts']);