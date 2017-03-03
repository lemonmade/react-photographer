declare module 'assets-webpack-plugin' {
  interface Options {
    filename: string,
    path: string,
  }

  class AssetsPlugin {
    constructor(options: Options)
  }

  export = AssetsPlugin;
}
