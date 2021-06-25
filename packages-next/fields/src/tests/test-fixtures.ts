import { KeystoneContext } from '@keystone-next/types';
import { text } from '../types/text';

export const name = 'ID';

export const exampleValue = () => '"foo"';

export const newInterfaces = true;
export const getTestFields = () => {
  return {
    name: text(),
  };
};

export const initItems = () => {
  return [{ name: 'person1' }, { name: 'person2' }, { name: 'person3' }, { name: 'person4' }];
};

export const skipCrudTest = true;
export const skipCommonFilterTest = true;
export const skipRequiredTest = true;
export const skipUniqueTest = true;

const getIDs = async (context: KeystoneContext) => {
  const items = await context.lists.Test.findMany({ query: 'id name' });
  return Object.fromEntries(items.map(({ id, name }) => [name, id]));
};

export const filterTests = (withKeystone: any) => {
  const match = async (
    context: KeystoneContext,
    where: Record<string, any> | undefined,
    expected: any[]
  ) =>
    expect(
      await context.lists.Test.findMany({ where, orderBy: { name: 'asc' }, query: 'id name' })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      return match(context, undefined, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Empty filter',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      return match(context, {}, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id = IDs['person2'];
      return match(context, { id }, [{ id: IDs['person2'], name: 'person2' }]);
    })
  );

  test(
    'Filter: id_not',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id = IDs['person2'];
      return match(context, { id_not: id }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id_in',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id2 = IDs['person2'];
      const id3 = IDs['person3'];
      return match(context, { id_in: [id2, id3] }, [
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
      ]);
    })
  );

  test(
    'Filter: id_in - empty list',
    withKeystone(({ context }: { context: KeystoneContext }) => {
      return match(context, { id_in: [] }, []);
    })
  );

  test(
    'Filter: id_in - missing id',
    withKeystone(({ context }: { context: KeystoneContext }) => {
      const fakeID = 'cdafasdfasd';
      return match(context, { id_in: [fakeID] }, []);
    })
  );

  test(
    'Filter: id_not_in',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id2 = IDs['person2'];
      const id3 = IDs['person3'];
      return match(context, { id_not_in: [id2, id3] }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id_not_in - empty list',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      return match(context, { id_not_in: [] }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: id_not_in - missing id',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const fakeID = 'cdafasdfasd';
      return match(context, { id_not_in: [fakeID] }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );
};
