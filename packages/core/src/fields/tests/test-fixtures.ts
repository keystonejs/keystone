import { KeystoneContext } from '../../types';

export const name = 'ID';

export const exampleValue = () => '"foo"';

export const newInterfaces = true;
export const getTestFields = () => ({});

export const initItems = () => {
  return [{ name: 'person1' }, { name: 'person2' }, { name: 'person3' }, { name: 'person4' }];
};

export const skipCrudTest = true;
export const skipCommonFilterTest = true;
export const skipRequiredTest = true;
export const skipUniqueTest = true;

const getIDs = async (context: KeystoneContext) => {
  const items = await context.query.Test.findMany({ query: 'id name' });
  return Object.fromEntries(items.map(({ id, name }) => [name, id]));
};

export const filterTests = (withKeystone: any) => {
  const match = async (
    context: KeystoneContext,
    where: Record<string, any> | undefined,
    expected: any[]
  ) =>
    expect(
      await context.query.Test.findMany({ where, orderBy: { name: 'asc' }, query: 'id name' })
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
    'Filter: equals',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id = IDs['person2'];
      return match(context, { id: { equals: id } }, [{ id: IDs['person2'], name: 'person2' }]);
    })
  );

  test(
    'Filter: not equals',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id = IDs['person2'];
      return match(context, { id: { not: { equals: id } } }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: in',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id2 = IDs['person2'];
      const id3 = IDs['person3'];
      return match(context, { id: { in: [id2, id3] } }, [
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
      ]);
    })
  );

  test(
    'Filter: in - empty list',
    withKeystone(({ context }: { context: KeystoneContext }) => {
      return match(context, { id: { in: [] } }, []);
    })
  );

  test(
    'Filter: in - missing id',
    withKeystone(({ context }: { context: KeystoneContext }) => {
      const fakeID = 'cdafasdfasd';
      return match(context, { id: { in: [fakeID] } }, []);
    })
  );

  test(
    'Filter: not in',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const id2 = IDs['person2'];
      const id3 = IDs['person3'];
      return match(context, { id: { not: { in: [id2, id3] } } }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: not in - empty list',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      return match(context, { id: { not: { in: [] } } }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );

  test(
    'Filter: not in - missing id',
    withKeystone(async ({ context }: { context: KeystoneContext }) => {
      const IDs = await getIDs(context);
      const fakeID = 'cdafasdfasd';
      return match(context, { id: { not: { in: [fakeID] } } }, [
        { id: IDs['person1'], name: 'person1' },
        { id: IDs['person2'], name: 'person2' },
        { id: IDs['person3'], name: 'person3' },
        { id: IDs['person4'], name: 'person4' },
      ]);
    })
  );
};
