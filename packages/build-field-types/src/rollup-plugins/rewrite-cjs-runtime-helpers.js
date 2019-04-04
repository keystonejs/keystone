import { getWorker } from "../worker-client";

export default function rewriteCjsRuntimeHelpers() {
  return {
    name: "rewrite-cjs-runtime-helpers",
    renderChunk(code, chunkInfo, { format }) {
      if (format !== "cjs") {
        return null;
      }

      return getWorker()
        .transformBabel(
          code,
          JSON.stringify({
            babelrc: false,
            configFile: false,
            plugins: [
              require.resolve("../babel-plugins/rewrite-cjs-runtime-helpers")
            ]
          })
        )
        .then(({ code }) => code);
    }
  };
}
