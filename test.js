const fs = require('fs');

console.log(JSON.stringify(fs.readFileSync(process.env.GITHUB_ENV, 'utf-8')));
