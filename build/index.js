'use strict'
// 配置文件
import env from '../env';
// 引入dev
import {dev, build} from '../config';
import devFn from './dev.config';

// 判断环境
let builds = () => {
	if (env === 'production') { // 生产环境
	  devFn(build);
	} else { // 开发环境
	  devFn(dev);
	}
}

export default builds;