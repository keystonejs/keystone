const { generateCode } = require('./generate-code');
const { getProjectDirectory } = require('./util');
const fs = require('fs');
const path = require('path');

const replaceKeystoneMagicComments = async () => {
  const generatedCode = await generateCode();
  const projectDirectory = await getProjectDirectory();
  const filePath = path.join(projectDirectory, 'index.js');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const regex = /\/\*[\s]*keystone-cli:.* \*\/(.|[\r\n])*\/\*[\s]*\/keystone-cli.*\*\//;
  const newFileContent = fileContent.replace(regex, generatedCode);
  return fs.writeFileSync(filePath, newFileContent, 'utf8');
};

module.exports = { replaceKeystoneMagicComments };
