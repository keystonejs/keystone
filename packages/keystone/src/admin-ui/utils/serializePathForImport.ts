import Path from 'path';
export function serializePathForImport(path: string) {
  // JSON.stringify is important here because it will escape windows style paths(and any thing else that might potentially be in there)
  return JSON.stringify(
    path
      // Next is unhappy about imports that include .ts/tsx in them because TypeScript is unhappy with them because when doing a TypeScript compilation with tsc, the imports won't be written so they would be wrong there
      .replace(/\.tsx?$/, '')
      .replace(new RegExp(`\\${Path.sep}`, 'g'), '/')
  );
}
