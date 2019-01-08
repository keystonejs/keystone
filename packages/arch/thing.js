let fs = require('fs-extra');
let path = require('path');
let globby = require('globby');

__dirname = path.join(__dirname, 'packages');

(async () => {
  let packages = (await Promise.all(
    (await fs.readdir(__dirname)).map(async folder => {
      return (await fs.stat(path.join(__dirname, folder))).isDirectory() ? folder : false;
    })
  )).filter(x => x);
  await Promise.all(
    packages.map(async pkg => {
      let dir = path.join(__dirname, pkg);
      let files = await globby(['**/*.js'], { cwd: dir });
      await Promise.all(
        files.map(async file => {
          await fs.move(path.join(dir, file), path.join(dir, 'src', file));
        })
      );
    })
  );
})();
