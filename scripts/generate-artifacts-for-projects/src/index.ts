import path from 'path';
import fs from 'fs/promises';
import { format } from 'util';
import { createSystem, initConfig } from '@keystone-6/core/system';
import {
  validateCommittedArtifacts,
  generateNodeModulesArtifacts,
  generateCommittedArtifacts,
} from '@keystone-6/core/artifacts';
import { requireSource } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/require-source';

async function main() {
  const repoRoot = path.resolve(__dirname, '../../../');
  const directoriesOfProjects = [
    path.join(repoRoot, 'examples'),
    path.join(repoRoot, 'examples-staging'),
    path.join(repoRoot, 'tests/test-projects'),
  ];
  const projectDirectories = (
    await Promise.all(
      directoriesOfProjects.map(async dir => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return entries.filter(x => x.isDirectory()).map(x => path.join(dir, x.name));
      })
    )
  ).flat();

  const mode = process.env.UPDATE_SCHEMAS ? 'generate' : 'validate';

  await Promise.all(
    projectDirectories.map(async projectDir => {
      try {
        const config = initConfig(requireSource(path.join(projectDir, 'keystone')).default);
        const { graphQLSchema } = createSystem(config, false);
        if (mode === 'validate') {
          await validateCommittedArtifacts(graphQLSchema, config, projectDir);
        } else {
          await generateCommittedArtifacts(graphQLSchema, config, projectDir);
        }
        await generateNodeModulesArtifacts(graphQLSchema, config, projectDir);
      } catch (err) {
        throw new Error(
          `An error occurred generating/validating the artifacts for the project at ${projectDir}:\n${format(
            err
          )}\n`
        );
      }
    })
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
