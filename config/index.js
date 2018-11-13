'use strict'
import {Dir} from './dir.config';
// const path = require('path')
// const mockServerPort = 8081;
module.exports = {
  dev: {
    dir: Dir.dist,
    port: 8000,
    index: 'index.html',
    autoOpenBrowser: true, // 自启动浏览器
  },
  build: {
    pro: true,
    dir: Dir.builder,
    port: 9000,
    index: 'index.html',
    autoOpenBrowser: true, // 自启动浏览器
  }
}
