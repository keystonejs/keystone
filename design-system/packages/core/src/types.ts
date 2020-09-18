import { theme } from './themes/default';

// Theme Types

export type Theme = typeof theme;

export type ResponsiveProp<T> = T | readonly (T | null)[];
