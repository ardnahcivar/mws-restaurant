const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('default',['copy-html','copy-images','styles','scripts-dist'],function(){
	console.log('Started Gulp');
    
	// gulp.watch('sass/**/*.scss',['styles']);
	// gulp.watch('js/**/*.js',[lint]);
	// gulp.watch('/index.html',[copy-html]);
    
	browserSync.init({
		server:'./dist'
	});
});

gulp.task('styles',function(){
	gulp
		.src('sass/**/*.scss')
		.pipe(sass({
			outputStyle:'compressed'
		}))
		.on('error',sass.logError)
		.pipe(
			autoprefixer({
				browsers:['last 2 versions']
			})
		)
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream());
});

gulp.task('lint',function(){
	return (
		gulp.src(['js/**/*.js'])
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failOnError())
	);
});

gulp.task('copy-html',function(){
	gulp.src('./index.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images',function(){
	gulp.src('img/*')
		.pipe(gulp.dest('./dist/img'));
});

gulp.task('scripts',function(){
	gulp.src('js/**/*.js')
		.pipe(babel())
		.pipe(concat('app.js'))
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('scripts-dist',function(){
	gulp.src('js/**/*.js')
		.pipe(babel())
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.on('error',function(error){console.log(error);})
		.pipe(gulp.dest('/dist/js'));
});