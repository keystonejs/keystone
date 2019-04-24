// @flow

export type ModuleFormat = 'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd';

type GlobalsOption = { [name: string]: string } | ((name: string) => string);

type OptionsPaths = { [key: string]: string } | ((id: string) => string);

export type OutputOptions =
  | {
      dir: string,
      entryFileNames: string,
      chunkFileNames: string,
      format: ModuleFormat,
      exports?: 'named',
    }
  | {
      format: 'umd',
      entryFileNames: string,
      dir: string,
      sourcemap: boolean,
      name: string,
      globals: Object,
    };

// https://github.com/rollup/rollup/blob/7746e0fd90a58e9ffa250e92c48410f49055584c/src/rollup/types.d.ts
// this is here for reference, i'm defining more strict types to use
// eslint-disable-next-line no-unused-vars
type ActualOutputOptions = {
  // only required for bundle.write
  file: string,
  // only required for bundles.write
  dir: string,
  // this is optional at the base-level of RollupWatchOptions,
  // which extends from this interface through config merge
  format?: ModuleFormat,
  name?: string,
  globals?: GlobalsOption,
  chunkFileNames?: string,
  entryFileNames?: string,
  assetFileNames?: string,

  paths?: OptionsPaths,
  banner?: string | (() => string | Promise<string>),
  footer?: string | (() => string | Promise<string>),
  intro?: string | (() => string | Promise<string>),
  outro?: string | (() => string | Promise<string>),
  sourcemap?: boolean | 'inline',
  sourcemapFile?: string,
  sourcemapPathTransform?: (sourcePath: string) => string,
  interop?: boolean,
  extend?: boolean,

  exports?: 'default' | 'named' | 'none' | 'auto',
  amd?: {
    id?: string,
    define?: string,
  },
  indent?: boolean,
  strict?: boolean,
  freeze?: boolean,
  esModule?: boolean,
  namespaceToStringTag?: boolean,
  compact?: boolean,

  // undocumented?
  noConflict?: boolean,

  // deprecated
  dest?: string,
  moduleId?: string,
};

export interface RollupError {
  message: string;
  code?: string;
  name?: string;
  url?: string;
  id?: string;
  loc?: {
    file?: string,
    line: number,
    column: number,
  };
  stack?: string;
  frame?: string;
  pos?: number;
  plugin?: string;
  pluginCode?: string;
  hook?: string;
}

interface SerializablePluginCache {
  [key: string]: [number, any];
}

interface RollupCache {
  plugins?: { [key: string]: SerializablePluginCache };
}

interface SerializedTimings {
  [label: string]: [number, number, number];
}

interface OutputChunk extends RenderedChunk {
  code: string;
  map?: SourceMap;
}

interface SourceMap {
  version: string;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;

  toString(): string;
  toUrl(): string;
}

export interface RenderedChunk {
  fileName: string;
  isEntry: boolean;
  imports: string[];
  exports: string[];
  modules: {
    [id: string]: RenderedModule,
  };
}

interface RenderedModule {
  renderedExports: string[];
  removedExports: string[];
  renderedLength: number;
  originalLength: number;
}

export interface RollupSingleFileBuild {
  // TODO: consider deprecating to match code splitting
  imports: string[];
  exports: { name: string, originalName: string, moduleId: string }[];
  cache: RollupCache;
  watchFiles: string[];

  generate: (outputOptions: OutputOptions) => Promise<OutputChunk>;
  write: (options: OutputOptions) => Promise<OutputChunk>;
  getTimings?: () => SerializedTimings;
}
