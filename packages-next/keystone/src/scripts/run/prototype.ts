import { dev } from './dev';
import type { StaticPaths } from '..';

export const prototype = async (staticPaths: StaticPaths) => dev(staticPaths, 'prototype');
