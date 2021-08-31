// DO NOT MOVE THIS FILE!!
// this file is in the root of src so that in the built and dev versions of the package
// __dirname resolves to a directory directly within the package directory
// so path.dirname on it will get the package directory

import path from 'path';

export const packagePath = path.dirname(__dirname);
