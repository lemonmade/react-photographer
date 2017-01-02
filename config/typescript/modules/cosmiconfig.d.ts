declare module 'cosmiconfig' {
  export = cosmiconfig;

  function cosmiconfig<T>(moduleName: string, options?: cosmiconfig.Options): cosmiconfig.Explorer<T>;

  namespace cosmiconfig {
    type NameOrExclude = string | false;

    type LoadResult<T> = Promise<{config: T, filepath: string} | null>;

    export interface Explorer<T> {
      load(searchPath: null, configPath: string): LoadResult<T>,
      load(searchPath?: string): LoadResult<T>,
      clearFileCache(): void,
      clearDirectoryCache(): void,
      clearCaches(): void,
    }

    export interface Options {
      packageProp?: NameOrExclude,
      rc?: NameOrExclude,
      js?: NameOrExclude,
      argv?: NameOrExclude,
      rcStrictJson?: boolean,
      rcExtensions?: boolean,
      stopDir?: string,
      cache?: boolean,
    }
  }
}
