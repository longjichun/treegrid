let  gulp = require("gulp"),
   jshint = require("gulp-jshint");

gulp.task("jshint",function(){
	gulp.src("dataset/*.js")
	.pipe(jshint())
	.pipe(jshint.reporter("default"))
});
gulp.task('default',['jshint']);
