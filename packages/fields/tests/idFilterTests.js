import { matchFilter } from './fields.test';
import Text from '../types/Text';
// import Checkbox from './';

export const name = 'ID';

export const getTestFields = () => {
  return {
    name: { type: Text },
  };
};

export const initItems = () => {
  return [{ name: 'person1' }, { name: 'person2' }, { name: 'person3' }, { name: 'person4' }];
};

const getIDs = async keystone => {
  const IDs = {};
  await keystone.lists['test'].adapter
    .findAll()
    .exec()
    .then(data => {
      data.forEach(entry => {
        IDs[entry.name] = entry._id.toString();
      });
    });
  return IDs;
};

export const filterTests = (app, keystone) => {
  const match = (filter, targets, done) => {
    matchFilter(app, filter, '{ id name }', targets, done, 'name');
  };

  test('No filter', async done => {
    const IDs = await getIDs(keystone);
    match(
      undefined,
      [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ],
      done
    );
  });

  test('Empty filter', async done => {
    const IDs = await getIDs(keystone);
    match(
      'where: { }',
      [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ],
      done
    );
  });

  test('Filter: id', async done => {
    const IDs = await getIDs(keystone);
    const id = IDs['person2'];
    match(`where: { id: "${id}" }`, [{ id: IDs['person2'], name: 'person2' }], done);
  });

  test('Filter: id_not', async done => {
    const IDs = await getIDs(keystone);
    const id = IDs['person2'];
    match(
      `where: { id_not: "${id}" }`,
      [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ],
      done
    );
  });

  test('Filter: id_in', async done => {
    const IDs = await getIDs(keystone);
    const id2 = IDs['person2'];
    const id3 = IDs['person3'];
    match(
      `where: { id_in: ["${id2}", "${id3}"] }`,
      [{ id: IDs['person2'], name: 'person2' }, { id: IDs['person3'], name: 'person3' }],
      done
    );
  });

  test('Filter: id_in - empty list', async done => {
    match('where: { id_in: [] }', [], done);
  });

  test('Filter: id_in - missing id', async done => {
    match('where: { id_in: ["0123456789abcdef01234567"] }', [], done);
  });

  test('Filter: id_not_in', async done => {
    const IDs = await getIDs(keystone);
    const id2 = IDs['person2'];
    const id3 = IDs['person3'];
    match(
      `where: { id_not_in: ["${id2}", "${id3}"] }`,
      [{ id: IDs['person1'], name: 'person1' }, { id: IDs['person4'], name: 'person4' }],
      done
    );
  });

  test('Filter: id_not_in - empty list', async done => {
    const IDs = await getIDs(keystone);
    match(
      'where: { id_not_in: [] }',
      [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ],
      done
    );
  });

  test('Filter: id_not_in - missing id', async done => {
    const IDs = await getIDs(keystone);
    match(
      'where: { id_not_in: ["0123456789abcdef01234567"] }',
      [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ],
      done
    );
  });
};
