import build from 'next/dist/build';
import Path from 'path';

export async function buildAdminUI(dotKeystoneDir: string) {
  await build(Path.join(dotKeystoneDir, 'admin'));
}
