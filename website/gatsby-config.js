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
      // TODO: the name from our 'gatsby-source-filesystem' plugins is being lost by the transformer.
      // It would be great if the name was passed down.
      // I wouldn't mind finding a way to include some package.json info here as well
      `gatsby-transformer-remark`,
      // TODO: The remark plugin can be made a lot smarter with its own plugins. I've left them off.
    ],
  };
}

module.exports = getGatsbyConfig();
