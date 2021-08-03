import { CreateContext } from './core';

// TODO: don't call this thing BaseKeystone
export type BaseKeystone = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  createContext: CreateContext;
};
