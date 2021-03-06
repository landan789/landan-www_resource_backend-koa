import oCluster from 'cluster';
import Os from 'os';
import Koa from 'koa';
import KoaBodyParser from 'koa-bodyparser';
import json from 'koa-json';

import { NonexistentURIMiddleware } from './middleware';

import oRouter from './routers/index';
import { HTTP, CLUSTER } from './configs/index';

let oNonexistentURIMiddleware = new NonexistentURIMiddleware();
var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);
const iCPULength = Os.cpus().length;

if (true === CLUSTER.STATUS && oCluster.isMaster && false != argv.cluster) {

  console.log(`主进程 ${process.pid} 正在运行`);
  for (let i = 0; i < iCPULength; i++) {
    oCluster.fork();
  }
  oCluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {

  const oMain = new Koa();
  oMain.use(KoaBodyParser());
  oMain.use(json({ pretty: true, param: 'pretty' }));
  oMain.use(oRouter.routes()).use(oRouter.allowedMethods());
  oMain.use(oNonexistentURIMiddleware.handle());
  
  oMain.listen(HTTP.PORT, () => {
    console.log('server is running on port ' + HTTP.PORT);
  });
}