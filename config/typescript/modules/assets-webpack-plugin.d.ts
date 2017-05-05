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

declare module 'looks-same' {
  interface looksSame {
    (options: looksSame.Options): void,
    createDiff(options: looksSame.DiffOptions): void,
  }

  namespace looksSame {
    export interface Options {
      strict?: boolean,
      tolerance?: boolean,
      ignoreAntialiasing?: boolean,
    }

    export interface DiffOptions extends Options {
      reference: string,
      current: string,
      diff?: string,
      highlightColor?: string,
    }
  }

  export = looksSame;
}
