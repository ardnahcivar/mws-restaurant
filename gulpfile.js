const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');

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
	console.log('Started gulp for production build');
});

gulp.task('styles', function () {
	gulp
		.src('css/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.on('error', sass.logError)
		.pipe(
			autoprefixer({
				browsers: ['last 2 versions']
			})
		)
		.pipe(concat('styles.css'))
		.pipe(gulp.dest('./'))
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
	gulp.src('js/**/*.js')
		// .pipe(sourcemaps.init())
		// .pipe(sourcemaps.write('.'))
		.pipe(babel({plugins:['@babel/transform-runtime']}))
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./'));
});

gulp.task('scripts-dist', function () {
	gulp.src('js/**/*.js')
		.pipe(babel({plugins:['@babel/transform-runtime']}))
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dist/'));
});

