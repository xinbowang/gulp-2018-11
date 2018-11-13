import path from 'path';
// 文件夹路径
export let Dir = {
  dist: path.resolve(__dirname,'../dist'), // 开发环境文件目录
  builder: path.resolve(__dirname,'../builder'),// 生产环境文件目录
  src: path.resolve(__dirname,'../src'), // 编译前文件目录
  static: path.resolve(__dirname,'../src/static') // 放置不被编译文件，直接输出
};
// 配置文件路径
export let File = {
  html: Dir.src + '/**/*.html',
  css: Dir.src + '/css/**/*.css',
  js: Dir.src + '/js/**/*.js',
  sass: Dir.src + '/sass/**/*.scss',
  img: Dir.src + '/img/**/*',
  static: Dir.src + '/static/**/*'
};