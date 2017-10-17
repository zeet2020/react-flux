var gulp = require('gulp');
var inject = require('gulp-inject');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jsx = require('gulp-jsx');
var react = require('gulp-react');
var connect = require('gulp-connect');

gulp.task('index',function(){
   var target = gulp.src("./src/index.html");
   var sources = gulp.src(["./js/main.min.js","./css/main.css"],{read: false});
   return target.pipe(inject(sources))
	.pipe(gulp.dest('./'));

});



gulp.task("styles",function(){
      return gulp.src(["src/css/**/*.css"])
             .pipe(concat('main.css'))
             .pipe(gulp.dest('css/'))
  
});


gulp.task('babel',function(){
   return gulp.src(['src/app/**/*.jsx'])
          .pipe(babel({presets: ['react', 'es2015']}))
          .pipe(concat('main.js'))
          .pipe(gulp.dest('src/app/'));

});

gulp.task('scripts',['babel'],function(){
  var base = gulp.src(['src/lib/**/react.js','src/lib/**/react-dom.js','src/lib/**/*','src/app/main.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('js/'))
    .pipe(rename({suffix: '.min'}))
    //.pipe(uglify())
    .pipe(gulp.dest('js/'));
    return base;
});


gulp.task('webserver',function(){
   connect.server({
    livereload:false,
    port:8000,
    root:['.']
   });
});


gulp.task('default',['scripts','styles','index','webserver'],function(){
  gulp.watch(["src/**/*.jsx","src/**/*.html"], ['scripts']);
});
