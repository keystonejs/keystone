export type CacheHintArgs = { results: any; operationName: string; meta: boolean };

// TODO: don't call this thing BaseKeystone
export type BaseKeystone = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};
