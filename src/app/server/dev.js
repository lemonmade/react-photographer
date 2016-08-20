/* eslint-disable no-console */

const path = require('path');
const notifier = require('node-notifier');
const chokidar = require('chokidar');
const webpack = require('webpack');
const express = require('express');
const createWebpackMiddleware = require('webpack-dev-middleware');
const createWebpackHotMiddleware = require('webpack-hot-middleware');

function createNotification(options = {}) {
  const title = options.title && `🔥  ${options.title.toUpperCase()}`;

  notifier.notify({
    title,
    message: options.message,
    open: options.open,
  });

  console.log(`==> ${title} -> ${options.message}`);
}

class ListenerManager {
  constructor(listener) {
    this.lastConnectionKey = 0;
    this.connectionMap = {};
    this.listener = listener;

    this.listener.on('connection', (connection) => {
      const connectionKey = ++this.lastConnectionKey;
      this.connectionMap[connectionKey] = connection;
      connection.on('close', () => {
        delete this.connectionMap[connectionKey];
      });
    });
  }

  dispose() {
    return new Promise((resolve) => {
      Object.keys(this.connectionMap).forEach((connectionKey) => {
        this.connectionMap[connectionKey].destroy();
      });

      if (this.listener) {
        this.listener.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}

class HotServer {
  constructor(compiler) {
    this.compiler = compiler;

    const compiledOutputPath = path.resolve(
      compiler.options.output.path, `${Object.keys(compiler.options.entry)[0]}.js`
    );

    try {
      this.listenerManager = new ListenerManager(require(compiledOutputPath).default);

      const url = `http://localhost:${process.env.SERVER_PORT}`;

      createNotification({
        title: 'server',
        message: `🌎  Running on ${url}`,
        open: url,
      });
    } catch (err) {
      createNotification({
        title: 'server',
        message: '😵  Bundle invalid, check console for error',
      });
      console.log(err);
    }
  }

  dispose() {
    return Promise.all([
      this.listenerManager && this.listenerManager.dispose(),
    ]);
  }
}

class HotClient {
  constructor(compiler) {
    const app = express();
    this.webpackDevMiddleware = createWebpackMiddleware(compiler, {
      quiet: true,
      noInfo: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      publicPath: compiler.options.output.publicPath,
    });

    app.use(this.webpackDevMiddleware);
    app.use(createWebpackHotMiddleware(compiler));

    const listener = app.listen(process.env.CLIENT_DEVSERVER_PORT);
    this.listenerManager = new ListenerManager(listener);

    createNotification({
      title: 'client',
      message: '✅  Running',
    });
  }

  dispose() {
    this.webpackDevMiddleware.close();

    return Promise.all([
      this.listenerManager && this.listenerManager.dispose(),
    ]);
  }
}

class HotServers {
  constructor() {
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this._configureHotClient = this._configureHotClient.bind(this);
    this._configureHotServer = this._configureHotServer.bind(this);

    this.clientBundle = null;
    this.clientCompiler = null;
    this.serverBundle = null;
    this.serverCompiler = null;
  }

  start() {
    try {
      const clientConfig = require('../../config/webpack.client.config')({mode: 'development'});
      const serverConfig = require('../../config/webpack.server.config')({mode: 'development'});

      this.clientCompiler = webpack(clientConfig);
      this.serverCompiler = webpack(serverConfig);
    } catch (err) {
      createNotification({
        title: 'webpack',
        message: '😵  Webpack config invalid, check console for error',
      });
      console.log(err);
      return;
    }

    this._configureHotClient();
    this._configureHotServer();
  }

  restart() {
    function clearWebpackConfigsCache() {
      Object.keys(require.cache).forEach((modulePath) => {
        if (modulePath.indexOf('webpack') >= 0) {
          delete require.cache[modulePath];
        }
      });
    }

    Promise.all([
      this.serverBundle && this.serverBundle.dispose(),
      this.clientBundle && this.clientBundle.dispose(),
    ])
      .then(clearWebpackConfigsCache)
      .then(this.start, (err) => console.log(err));
  }

  _configureHotClient() {
    this.clientCompiler.plugin('done', (stats) => {
      if (stats.hasErrors()) {
        createNotification({
          title: 'client',
          message: '😵  Build failed, check console for error',
        });
        console.log(stats.toString());
      } else {
        createNotification({
          title: 'client',
          message: '✅  Built',
        });
      }
    });

    this.clientBundle = new HotClient(this.clientCompiler);
  }

  _configureHotServer() {
    const compileHotServer = () => {
      const runCompiler = () => this.serverCompiler.run(() => {});

      if (this.serverBundle) {
        this.serverBundle.dispose().then(runCompiler);
      } else {
        runCompiler();
      }
    };

    this.clientCompiler.plugin('done', (stats) => {
      if (!stats.hasErrors()) {
        compileHotServer();
      }
    });

    this.serverCompiler.plugin('done', (stats) => {
      if (stats.hasErrors()) {
        createNotification({
          title: 'server',
          message: '😵  Build failed, check console for error',
        });
        console.log(stats.toString());
        return;
      }

      createNotification({
        title: 'server',
        message: '✅  Built',
      });

      // Make sure our newly built server bundles aren't in the module cache.
      Object.keys(require.cache).forEach((modulePath) => {
        if (modulePath.indexOf(this.serverCompiler.options.output.path) >= 0) {
          delete require.cache[modulePath];
        }
      });

      this.serverBundle = new HotServer(this.serverCompiler);
    });

    this.watcher = chokidar.watch([path.resolve(__dirname, './src/server')]);
    this.watcher.on('ready', () => {
      this.watcher
        .on('add', compileHotServer)
        .on('addDir', compileHotServer)
        .on('change', compileHotServer)
        .on('unlink', compileHotServer)
        .on('unlinkDir', compileHotServer);
    });
  }
}

const hotServers = new HotServers();
const watcher = chokidar.watch(path.resolve(__dirname, './webpackConfigFactory.js'));

watcher.on('ready', () => {
  watcher.on('change', hotServers.restart);
});

hotServers.start();
