import type { StaticPaths } from '..';
import { dev } from './dev';

export const prototype = async (staticPaths: StaticPaths) => dev(staticPaths, 'prototype');
