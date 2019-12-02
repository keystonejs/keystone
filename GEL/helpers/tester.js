const Spawn = require('child_process');
const cfonts = require('cfonts');
const getWorkspaces = require('get-workspaces').default;

(async () => {
	const workspaces = await getWorkspaces();

	workspaces.map(workspace => {
		cfonts.say(`${workspace.name.split('/')[1]}`, {
			colors: ['redBright', 'magenta', 'whiteBright'],
			font: 'chrome',
		});

		const command = Spawn.spawnSync('npm', ['test'], {
			cwd: workspace.dir,
			stdio: process.env.DEBUG ? [process.stdin, process.stdout, process.stderr] : [],
			encoding: 'utf-8',
		});

		if (command.status) {
			console.error(`The test for ${workspace.name} failed!\n`, command.stderr.toString());
			console.log(command.stdout);
			process.exit(1);
		} else {
			console.log(`✅ success`);
		}
	});

	console.log('Tests done 🎉');
	process.exit(0);
})();
