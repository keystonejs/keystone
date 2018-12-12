const bolt = require('bolt');
const fs = require('fs');

async function getPackagePlugins() {
  const { dir: rootDir } = await bolt.getProject({ cwd: '../' });

  const workspaces = await bolt.getWorkspaces({ cwd: rootDir });

  return workspaces
    .map(({ dir, config }) => ({ dir, name: config.name }))
    .filter(({ dir }) => fs.existsSync(dir))
    .map(({ name, dir }) => ({
      resolve: 'gatsby-source-filesystem',
      options: {
        // This `name` will show up as `sourceInstanceName` on a node's "parent"
        // See `gatsby-node.js` for where it's used.
        name,
        path: `${dir}/`,
      },
    }));
}

async function getGatsbyConfig() {
  const packageFilesPlugins = await getPackagePlugins();
  return {
    plugins: [
      ...packageFilesPlugins,
      {
        resolve: 'gatsby-source-filesystem',
        options: { name: 'tutorials', path: `${__dirname}/tutorials/` },
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: { name: 'guides', path: `${__dirname}/guides/` },
      },
      `gatsby-transformer-remark`,
      // TODO: The remark plugin can be made a lot smarter with its own plugins. I've left them off.
    ],
  };
}

module.exports = getGatsbyConfig();
