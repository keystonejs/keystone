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

const mode = process.env.UPDATE_SCHEMAS ? 'generate' : 'validate';

async function generateArtifactsForProjectDir(projectDir: string) {
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
}
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
        const projectPaths: string[] = [];
        await Promise.all(
          entries.map(async entry => {
            if (entry.isDirectory()) {
              const projectPath = path.join(dir, entry.name);
              const packageJsonPath = path.join(projectPath, 'package.json');
              try {
                if ((await fs.stat(packageJsonPath)).isFile()) {
                  projectPaths.push(projectPath);
                }
              } catch (err: any) {
                if (err.code !== 'ENOENT') {
                  throw err;
                }
              }
            }
          })
        );
        return projectPaths;
      })
    )
  ).flat();

  // this breaks if we do this entirely in parallel (it only seemed to consistently fail on Vercel though)
  // because of Prisma's loading native libraries and child processes stuff and it seems racey
  // it's fine if we just do one and then the rest together though
  // so we do that so we get decent parallelism
  const [firstProject, ...otherProjects] = projectDirectories;

  await generateArtifactsForProjectDir(firstProject);

  await Promise.all(
    otherProjects.map(async projectDir => {
      await generateArtifactsForProjectDir(projectDir);
    })
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
