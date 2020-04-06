const fs = require('fs');
const { getAdapterChoice } = require('./get-adapter-choice');
const path = require('path');

const getAdapterTemplateContent = async () => {
  const adapterConfig = await getAdapterChoice();
  const filePath = path.join(__dirname, '../templates', adapterConfig.file);
  return fs.readFileSync(filePath, 'utf8');
};

module.exports = { getAdapterTemplateContent };
