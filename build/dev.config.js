// 引入所需模块
import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import del from 'del'; // 清空文件
// 配置文件
import {Dir, File} from '../config/dir.config';
// gulp插件不需要写gulp-前缀
let plugins = gulpPlugins();
// 服务器
let browserSync = require('browser-sync').create();
let reload = browserSync.reload;
let autoprefixer = require('autoprefixer');
let pngquant = require('imagemin-pngquant'); // 使用pngquant深度压缩png图片的imagemin插件
let devFn = (opt) => {
  // let date = new Date();
  // let year = date.getFullYear();
  // let month = date.getMonth() + 1;
  // let day = date.getDate();
  // let hour = date.getHours();
  // let minute = date.getMinutes();
  // let second = date.getSeconds();
  // let DATE_TIME = `${year}-${month}-${day}-${hour}:${minute}:${second}`;
	// 清空文件夹
	gulp.task('clean', function() {
		return del(opt.dir);
	});
	// * static文件夹下的所有静态文件处理
  gulp.task('static', function() {
    return gulp.src(File.static)
      .pipe(plugins.changed(`${opt.dir}/static`))
      .pipe(gulp.dest(`${opt.dir}/static`))
      .pipe(reload({
        stream: true
      }));
  });
	// HTML处理
  gulp.task('html', function() {
    var options = {
      removeComments: true,//清除HTML注释
      collapseWhitespace: true,//清除空格，压缩HTML
      collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
      removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true,//删除<style>和<mixin>的type="text/css"
      minifyJS: true,//压缩页面JS
      minifyCSS: true//压缩页面CSS
    };
    return gulp.src([File.html, `!${Dir.static}`, `!${Dir.src}/pages/include/**.html`])
        .pipe(plugins.plumber({
          errorHandler: true
        }))
        .pipe(plugins.fileInclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(plugins.if(opt.pro, plugins.htmlReplace({
          'css': {
            src: '/css',
            tpl: `<link rel="stylesheet" type="text/css" href="%s/app.min.css">`,
          },
          // 'css': ['css/build.min.css'],
          'js': [`js/app.min.js`],
        })))
        .pipe(plugins.flatten())
        .pipe(plugins.if(opt.pro, plugins.htmlmin(options)))
        .pipe(gulp.dest(opt.dir))
        .pipe(reload({
          stream: true
        }));
  });
  // * CSS执行前，先删掉合并的app.css
  gulp.task('clean-css', function () {
	  return gulp.src(`${opt.dir}/css/app.css`, {read: false})
			.pipe(plugins.clean());
	});
  // * CSS样式处理
  gulp.task('css', ['clean-css'], function() {
    return gulp.src(File.css)
    	.pipe(plugins.changed(`${opt.dir}/css`))
    	.pipe(plugins.plumber({
        errorHandler: true
      }))
      .pipe(gulp.dest(`${opt.dir}/css`)).
      pipe(reload({
        stream: true
      }));
  });
  // * SASS样式处理
  gulp.task('sass', ['clean-css'], function() {
    var plug = [
      autoprefixer({
      	browsers: ['> 1%', 'last 2 version'],
      	cascade: false
	    })
    ];
    return gulp.src(File.sass)
    	.pipe(plugins.plumber({
          errorHandler: true
        }))
    	.pipe(plugins.changed(`${opt.dir}/css`))
    	.pipe(plugins.base64({
          baseDir: `${Dir.src}/sass`,
          extensions: ['svg', 'png', /\.jpg#datauri$/i],
          maxImageSize: 100 * 1024, // 小于100kb转码
          debug: true,
        }))
    	.pipe(plugins.sourcemaps.init({loadMaps: true}))
    	.pipe(plugins.sass())
    	.pipe(plugins.postcss(plug)) // 放到编译后面，否则可能报错
      .pipe(plugins.sourcemaps.write('./map/'))
      .pipe(gulp.dest(`${opt.dir}/css`))
      .pipe(reload({
        stream: true
      }));
  });
  // * 合并css并压缩
  //  sass/import 用于@import引入的scss样式
  gulp.task('css-cssnano',['sass', 'css'], function() {
    return gulp.src([`${opt.dir}/css/**/*.css`, `!${opt.dir}/css/import/**/*.css`])
      .pipe(plugins.plumber({
        errorHandler: true
      }))
      .pipe(plugins.concat('app.css')) // 合并css
      .pipe(plugins.if(opt.pro, plugins.cssnano())) // 压缩css
			.pipe(plugins.if(opt.pro, plugins.rename({
				suffix: '.min'
			})))
			.pipe(gulp.dest(`${opt.dir}/css`))
			.pipe(reload({
				stream: true
			}));
  });
  // * js处理
  gulp.task('js', function() {
    return gulp.src(File.js)
    	.pipe(plugins.plumber({
        errorHandler: true
      }))
    	.pipe(plugins.if(!opt.pro, plugins.sourcemaps.init({loadMaps: true})))
    	.pipe(plugins.babel({
				presets: ['env']
			}))
    	.pipe(gulp.dest(`${opt.dir}/js`))
    	.pipe(plugins.webpack({ // 合并js，并将import改成requite方式
        output: {
          filename: 'app.js',
        },
			}))
      .pipe(plugins.if(opt.pro, plugins.uglify())) // 压缩js
    	.pipe(plugins.if(opt.pro, plugins.rename({
				suffix: '.min'
			})))
    	.pipe(plugins.if(!opt.pro, plugins.sourcemaps.write('./map/')))
    	.pipe(gulp.dest(`${opt.dir}/js`))
    	.pipe(reload({
        stream: true
      }));
  });
  // * 图片处理
  gulp.task('images', function() {
    return gulp.src(File.img)
			.pipe(plugins.plumber({
				errorHandler: true
			}))
			.pipe(plugins.cache(plugins.imagemin({
			  optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
			  progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
			  interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
			  multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
			  svgoPlugins: [{removeViewBox: false}], //不要移除svg的viewbox属性
			  use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
			})))
			.pipe(gulp.dest(`${opt.dir}/img`))
			.pipe(reload({
			  stream: true
			}));
  });
  // 启动服务器
  gulp.task('build', function(cb) {
    plugins.sequence('clean', ['css-cssnano', 'static', 'js', 'images'], 'html')(function() {
    	if (opt.autoOpenBrowser) {
    		browserSync.init({
	        server: {
	          baseDir: opt.dir
	        }
	        , notify: false
	        , port: opt.port // 默认3000,
	        , index: opt.index
	      });
	      if (!opt.pro) { // 开发环境
	      	gulp.watch(File.static, ['static']);
		      gulp.watch(File.sass, ['css-cssnano']);
		      gulp.watch(File.css, ['css-cssnano']);
		      // gulp.watch(`${dist}/css/**/*.css`, ['css-concat']);
		      gulp.watch(File.js, ['js']);
		      gulp.watch(File.images, ['images']);
		      gulp.watch(File.html, ['html']);
	      }
    	} else {
    		console.log('执行完毕！');
    	}
    });
  });
};

export default devFn;