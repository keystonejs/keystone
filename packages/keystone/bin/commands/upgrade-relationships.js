const path = require('path');
const chalk = require('chalk');
const terminalLink = require('terminal-link');
const { DEFAULT_ENTRY } = require('../../constants');
const { getEntryFileFullPath } = require('../utils');

const c = s => chalk.cyan(s);

// Mongoose operations
const deleteField = (migration, field, _pluralize) =>
  migration
    ? `db.collection('${_pluralize(field.listKey)}').updateMany({}, { $unset: { "${
        field.path
      }": 1 } })`
    : `    * Delete ${c(`${_pluralize(field.listKey)}.${field.path}`)}`;

const moveData = (migration, left, tableName, near, far, _pluralize) =>
  migration
    ? `db.collection('${_pluralize(left.listKey)}').find({}).forEach(function(doc){ (doc.${
        left.path
      } || []).forEach(function(itemId) { db.${_pluralize(
        tableName
      )}.insert({ ${near}: doc._id, ${far}: itemId }) } ) });`
    : `    * Create a collection ${c(_pluralize(tableName))} with fields ${c(near)} and ${c(
        far
      )}\n    * Move the data from ${c(`${_pluralize(left.listKey)}.${left.path}`)} into ${c(
        _pluralize(tableName)
      )}`;

// Postgres operations
const dropTable = (migration, tableName, schemaName) =>
  migration ? `DROP TABLE ${schemaName}."${tableName}"` : `    * Drop table ${c(tableName)}`;

const dropColumn = (migration, tableName, columnName, schemaName) =>
  migration
    ? `ALTER TABLE ${schemaName}."${tableName}" DROP COLUMN "${columnName}";`
    : `    * Delete column ${c(`${tableName}.${columnName}`)}`;

const renameColumn = (migration, from, to, schemaName, tableName) =>
  migration
    ? `ALTER TABLE ${schemaName}."${tableName}" RENAME COLUMN "${from}" TO "${to}";`
    : `    * Rename column ${c(from)} to ${c(to)}`;

const renameTable = (migration, from, to, schemaName) =>
  migration
    ? `ALTER TABLE ${schemaName}."${from}" RENAME TO "${to}";`
    : `    * Rename table ${c(from)} to ${c(to)}`;

const ttyLink = (url, text) => {
  const link = terminalLink(url, url, { fallback: () => url });
  console.log(`🔗 ${chalk.green(text)}\t${link}`);
};

const printArrow = ({ migration, left, right }) => {
  if (!migration) {
    if (right) {
      console.log(`\n  ${left.listKey}.${left.path} -> ${right.listKey}.${right.path}`);
    } else {
      console.log(`\n  ${left.listKey}.${left.path} -> ${left.refListKey}`);
    }
  }
};

const strategySummary = (
  { one_many_to_many, two_one_to_one, two_one_to_many, two_many_to_many },
  keystone,
  migration
) => {
  const mongo = keystone.adapter.name === 'mongoose';

  if (!migration) {
    console.log('\n', chalk.bold('One-sided: one to many'));
    console.log('    ✅ No action required');
  }

  if (!migration) {
    console.log('\n\n', chalk.bold('One-sided: many to many'));
  }
  one_many_to_many.forEach(({ left, columnNames, tableName }) => {
    const { near, far } = columnNames[`${left.listKey}.${left.path}`];
    printArrow({ migration, left });
    if (mongo) {
      const { _pluralize } = keystone.adapter.mongoose;
      console.log(moveData(migration, left, tableName, near, far, _pluralize));
      console.log(deleteField(migration, left, _pluralize));
    } else {
      const { schemaName } = keystone.adapter;
      console.log(renameTable(migration, `${left.listKey}_${left.path}`, tableName, schemaName));
      console.log(renameColumn(migration, `${left.listKey}_id`, near, schemaName, tableName));
      console.log(renameColumn(migration, `${left.refListKey}_id`, far, schemaName, tableName));
    }
  });

  if (!migration) {
    console.log('\n\n', chalk.bold('Two-sided: one to one'));
  }
  two_one_to_one.forEach(({ left, right }) => {
    printArrow({ migration, left, right });
    if (mongo) {
      const { _pluralize } = keystone.adapter.mongoose;
      console.log(deleteField(migration, right, _pluralize));
    } else {
      const { schemaName } = keystone.adapter;
      console.log(dropColumn(migration, right.listKey, right.path, schemaName));
    }
  });

  if (!migration) {
    console.log('\n\n', chalk.bold('Two-sided: one to many'));
  }
  two_one_to_many.forEach(({ left, right, tableName }) => {
    const dropper = left.listKey === tableName ? right : left;
    printArrow({ migration, left, right });
    if (mongo) {
      const { _pluralize } = keystone.adapter.mongoose;
      console.log(deleteField(migration, dropper, _pluralize));
    } else {
      const { schemaName } = keystone.adapter;
      console.log(dropTable(migration, `${dropper.listKey}_${dropper.path}`, schemaName));
    }
  });

  if (!migration) {
    console.log('\n\n', chalk.bold('Two-sided: many to many'));
  }
  two_many_to_many.forEach(({ left, right, tableName, columnNames }) => {
    const { near, far } = columnNames[`${left.listKey}.${left.path}`];
    printArrow({ migration, left, right });
    if (mongo) {
      const { _pluralize } = keystone.adapter.mongoose;
      console.log(moveData(migration, left, tableName, near, far, _pluralize));
      console.log(deleteField(migration, left, _pluralize));
      console.log(deleteField(migration, right, _pluralize));
    } else {
      const { schemaName } = keystone.adapter;
      console.log(dropTable(migration, `${right.listKey}_${right.path}`, schemaName));
      console.log(renameTable(migration, `${left.listKey}_${left.path}`, tableName, schemaName));
      console.log(renameColumn(migration, `${left.listKey}_id`, near, schemaName, tableName));
      console.log(renameColumn(migration, `${left.refListKey}_id`, far, schemaName, tableName));
    }
  });
};

const upgradeRelationships = async (args, entryFile) => {
  const migration = !!args['--migration'];
  // Allow the spinner time to flush its output to the console.
  await new Promise(resolve => setTimeout(resolve, 100));
  const { keystone } = require(path.resolve(entryFile));

  const rels = keystone._consolidateRelationships();

  const one_many_to_many = rels.filter(({ right, cardinality }) => !right && cardinality === 'N:N');

  const two_one_to_one = rels.filter(({ right, cardinality }) => right && cardinality === '1:1');
  const two_one_to_many = rels.filter(
    ({ right, cardinality }) => right && (cardinality === '1:N' || cardinality === 'N:1')
  );
  const two_many_to_many = rels.filter(({ right, cardinality }) => right && cardinality === 'N:N');

  strategySummary(
    {
      one_many_to_many,
      two_one_to_one,
      two_one_to_many,
      two_many_to_many,
    },
    keystone,
    migration
  );

  console.log('');
  ttyLink('https://www.keystonejs.com/discussions/relationships', 'More info on relationships');

  if (!migration) {
    const mongo = keystone.adapter.name === 'mongoose';
    console.log('');
    console.log(
      chalk.green(
        `💡 Re-run with --migration flag to generate executable ${
          mongo ? 'MongoDB commands' : 'SQL statements'
        }`
      )
    );
    console.log('');
  }

  process.exit(0);
};

module.exports = {
  // prettier-ignore
  spec: {
    '--entry':      String,
    '--migration':  Boolean,
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} upgrade-relationships

    Options
      --entry       Entry file exporting keystone instance [${DEFAULT_ENTRY}]
      --migration   Generate code which can be used in a migration script
  `,
  exec: async (args, { exeName, _cwd = process.cwd() } = {}, spinner) => {
    spinner.stop(); // no thank you
    const entryFile = await getEntryFileFullPath(args, { exeName, _cwd });
    return upgradeRelationships(args, entryFile);
  },
};
