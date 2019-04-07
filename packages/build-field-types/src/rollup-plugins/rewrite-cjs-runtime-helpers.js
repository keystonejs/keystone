import { getWorker } from '../worker-client';

export default function rewriteCjsRuntimeHelpers() {
  return {
    name: 'rewrite-cjs-runtime-helpers',
    renderChunk(code, chunkInfo, { format }) {
      if (format === 'cjs') {
        return getWorker()
          .transformBabel(
            code,
            JSON.stringify({
              babelrc: false,
              configFile: false,
              sourceType: 'script',
              plugins: [
                // require.resolve('../babel-plugins/rewrite-cjs-runtime-helpers'),
                [
                  require.resolve('../babel-plugins/ks-field-types-render-chunk'),
                  { moduleFormat: 'esm' },
                ],
              ],
            })
          )
          .then(output => output.code);
      }
      if (format === 'es') {
        return getWorker()
          .transformBabel(
            code,
            JSON.stringify({
              babelrc: false,
              configFile: false,
              plugins: [
                require.resolve('@babel/plugin-syntax-dynamic-import'),
                [
                  require.resolve('../babel-plugins/ks-field-types-render-chunk'),
                  { moduleFormat: 'esm' },
                ],
              ],
            })
          )
          .then(output => output.code);
      }
      return null;
    },
  };
}
