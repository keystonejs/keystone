// @flow

export interface TransformSourceDescription extends SourceDescription {
  ast?: Object /*ESTree.Program*/;
  dependencies?: string[];
}

export type GlobalsOption = { [name: string]: string } | ((name: string) => string);

export type ModuleFormat =
  | 'amd'
  | 'cjs'
  | 'commonjs'
  | 'es'
  | 'esm'
  | 'iife'
  | 'module'
  | 'system'
  | 'umd';

export type OptionsPaths = { [key: string]: string } | ((id: string) => string);

export interface OutputOptions {
  amd?: {
    define?: string,
    id?: string,
  };
  assetFileNames?: string;
  banner?: string | (() => string | Promise<string>);
  chunkFileNames?: string;
  compact?: boolean;
  // only required for bundle.write
  dir: string;
  dynamicImportFunction?: string;
  entryFileNames?: string;
  esModule?: boolean;
  exports?: 'default' | 'named' | 'none' | 'auto';
  extend?: boolean;
  // only required for bundle.write
  file?: string;
  footer?: string | (() => string | Promise<string>);
  // this is optional at the base-level of RollupWatchOptions,
  // which extends from this interface through config merge
  format?: ModuleFormat;
  freeze?: boolean;
  globals?: GlobalsOption;
  indent?: boolean;
  interop?: boolean;
  intro?: string | (() => string | Promise<string>);
  name?: string;
  namespaceToStringTag?: boolean;
  noConflict?: boolean;
  outro?: string | (() => string | Promise<string>);
  paths?: OptionsPaths;
  preferConst?: boolean;
  sourcemap?: boolean | 'inline';
  sourcemapExcludeSources?: boolean;
  sourcemapFile?: string;
  sourcemapPathTransform?: (sourcePath: string) => string;
  strict?: boolean;
}

export interface ExistingRawSourceMap {
  file?: string;
  mappings: string;
  names: string[];
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: string[];
  version: number;
}

export type RawSourceMap = { mappings: '' } | ExistingRawSourceMap;

export interface SourceDescription {
  code: string;
  map?: string | RawSourceMap;
}

export interface ResolvedId {
  external?: boolean | void;
  id: string;
}

export interface RenderedModule {
  originalLength: number;
  removedExports: string[];
  renderedExports: string[];
  renderedLength: number;
}

export interface RenderedChunk {
  dynamicImports: string[];
  exports: string[];
  facadeModuleId: string | null;
  fileName: string;
  imports: string[];
  isDynamicEntry: boolean;
  isEntry: boolean;
  modules: {
    [id: string]: RenderedModule,
  };
  name: string;
}

export type ResolveIdResult = string | false | void | ResolvedId;

export type ResolveIdHook = (
  id: string,
  parent: string
) => Promise<ResolveIdResult> | ResolveIdResult;

export type IsExternal = (id: string, parentId: string, isResolved: boolean) => boolean | void;

export interface SerializablePluginCache {
  [key: string]: [number, any];
}

export interface RollupCache {
  plugins?: { [key: string]: SerializablePluginCache };
}

export interface RollupWarning extends RollupLogProps {
  exporter?: string;
  exportName?: string;
  guess?: string;
  importer?: string;
  missing?: string;
  modules?: string[];
  names?: string[];
  reexporter?: string;
  source?: string;
  sources?: string[];
}

export interface RollupLogProps {
  code?: string;
  frame?: string;
  hook?: string;
  id?: string;
  loc?: {
    column: number,
    file?: string,
    line: number,
  };
  message: string;
  name?: string;
  plugin?: string;
  pluginCode?: string;
  pos?: number;
  url?: string;
}

export type InputOption = string | Array<string> | { [entryAlias: string]: string };

export type ExternalOption = Array<string> | IsExternal;

export type WarningHandler = (warning: string | RollupWarning) => void;

export interface TreeshakingOptions {
  annotations?: boolean;
  propertyReadSideEffects?: boolean;
  pureExternalModules?: boolean;
}

export interface InputOptions {
  acorn?: any;
  acornInjectPlugins?: Function[];
  cache?: false | Object;
  chunkGroupingSize?: number;
  context?: string;
  experimentalCacheExpiry?: number;
  experimentalOptimizeChunks?: boolean;
  experimentalTopLevelAwait?: boolean;
  external?: ExternalOption;
  inlineDynamicImports?: boolean;
  input: InputOption;
  manualChunks?: { [chunkAlias: string]: string[] };
  moduleContext?: ((id: string) => string) | { [id: string]: string };
  onwarn?: WarningHandler;
  perf?: boolean;
  plugins?: Plugin[];
  preserveModules?: boolean;
  preserveSymlinks?: boolean;
  shimMissingExports?: boolean;
  treeshake?: boolean | TreeshakingOptions;
  watch?: WatcherOptions;
}

export interface WatchOptions {
  alwaysStat?: boolean;
  atomic?: boolean | number;
  awaitWriteFinish?:
    | {
        pollInterval?: number,
        stabilityThreshold?: number,
      }
    | boolean;
  binaryInterval?: number;
  cwd?: string;
  depth?: number;
  disableGlobbing?: boolean;
  followSymlinks?: boolean;
  ignored?: any;
  ignoreInitial?: boolean;
  ignorePermissionErrors?: boolean;
  interval?: number;
  persistent?: boolean;
  useFsEvents?: boolean;
  usePolling?: boolean;
}

export interface WatcherOptions {
  chokidar?: boolean | WatchOptions;
  clearScreen?: boolean;
  exclude?: string[];
  include?: string[];
}

export type LoadHook = (
  id: string
) => Promise<SourceDescription | string | null> | SourceDescription | string | null;

export type TransformHook = (
  code: string,
  id: string
) =>
  | Promise<TransformSourceDescription | string | void>
  | TransformSourceDescription
  | string
  | void;

export type TransformChunkHook = (
  code: string,
  options: OutputOptions
) =>
  | Promise<{ code: string, map: RawSourceMap } | void>
  | { code: string, map: RawSourceMap }
  | void
  | null;

export type RenderChunkHook = (
  code: string,
  chunk: RenderedChunk,
  options: OutputOptions
) =>
  | Promise<{ code: string, map: RawSourceMap } | null>
  | { code: string, map: RawSourceMap }
  | string
  | null;

export type ResolveDynamicImportHook = (
  specifier: string | Object /*ESTree.Node*/,
  parentId: string
) => Promise<string | void> | string | void;

export interface SourceMap {
  file: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent: string[];
  version: string;
  toString(): string;
  toUrl(): string;
}

export type OutputAsset = {
  code?: void,
  fileName: string,
  isAsset: true,
  source: string | Buffer,
};

export interface OutputChunk extends RenderedChunk {
  code: string;
  map?: SourceMap;
}

export interface OutputBundle {
  [fileName: string]: OutputAsset | OutputChunk;
}

export type AddonHook = string | (() => string | Promise<string>);
export interface Plugin {
  banner?: AddonHook;
  buildEnd?: (err?: Error) => Promise<void> | void;
  buildStart?: (options: InputOptions) => Promise<void> | void;
  cacheKey?: string;
  footer?: AddonHook;
  generateBundle?: (
    options: OutputOptions,
    bundle: OutputBundle,
    isWrite: boolean
  ) => void | Promise<void>;
  intro?: AddonHook;
  load?: LoadHook;
  name: string;
  options?: (options: InputOptions) => InputOptions | void | null;
  outputOptions?: (options: OutputOptions) => OutputOptions | void | null;
  outro?: AddonHook;
  renderChunk?: RenderChunkHook;
  renderError?: (err?: Error) => Promise<void> | void;
  renderStart?: () => Promise<void> | void;
  resolveDynamicImport?: ResolveDynamicImportHook;
  resolveId?: ResolveIdHook;
  transform?: TransformHook;
  watchChange?: (id: string) => void;
  writeBundle?: (bundle: OutputBundle) => void | Promise<void>;
}
