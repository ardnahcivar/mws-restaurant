const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'scripts'], function () {
	console.log('Started Gulp for development build');

	// gulp.watch('sass/**/*.scss',['styles']);
	// gulp.watch('js/**/*.js',[lint]);
	// gulp.watch('/index.html',[copy-html]);

	// browserSync.init({
	// 	server: './'
	// });
});

gulp.task('dist', ['copy-html', 'copy-images', 'styles', 'scripts-dist'], function () {
	console.log("Started gulp for production build");
})

gulp.task('styles', function () {
	gulp
		.src('sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.on('error', sass.logError)
		.pipe(
		autoprefixer({
			browsers: ['last 2 versions']
		})
		)
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream());
});

gulp.task('lint', function () {
	return (
		gulp.src(['js/**/*.js'])
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failOnError())
	);
});

gulp.task('copy-html', function () {
	gulp.src('./index.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function () {
	gulp.src('img/*')
		.pipe(gulp.dest('./dist/img'));
});

gulp.task('scripts', function () {
	gulp.src(['js/babel-polyfill.js', 'js/**/*.js'])
		.pipe(babel())
		.pipe(uglify())
		.pipe(concat('app.min.js'))
		.pipe(gulp.dest('./'));
});

gulp.task('scripts-dist', function () {
	gulp.src(['js/babel-polyfill.js', 'js/**/*.js'])
		.pipe(babel())
		.pipe(uglify())
		.pipe(concat('app.min.js'))
		.pipe(gulp.dest('./dist/js'));
});

