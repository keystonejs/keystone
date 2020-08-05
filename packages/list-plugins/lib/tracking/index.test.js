import { byTracking } from './byTracking';
import { atTracking } from './atTracking';

const listWithByTracking = byTracking()({ fields: {}, hooks: {} });
const listWithAtTracking = atTracking()({ fields: {}, hooks: {} });

const mockAuthedContext = { authedItem: { id: 'mock' } };
const mockUnAuthedContext = { authedItem: { id: null } };

describe('byTracking', () => {
  test('has resolveInput hook', async () => {
    expect(listWithByTracking).toHaveProperty('hooks.resolveInput');
  });

  test('has created and updated fields', async () => {
    expect(listWithByTracking).toHaveProperty('fields.createdBy');
    expect(listWithByTracking).toHaveProperty('fields.updatedBy');
  });

  test('resolvedInput matches the original resolvedData for "create" operation', async () => {
    const {
      hooks: { resolveInput },
      fields,
    } = listWithByTracking;
    const resolvedData = { test: 'matches' };
    const res = await resolveInput({
      resolvedData: { ...resolvedData },
      originalInput: { test: '' },
      context: mockAuthedContext,
      operation: 'create',
    });
    // This matches because createdBy is handled by the default values for an authedRelationship
    // For the authedRelationship createdBy must be null in the resolvedData
    expect(res).toEqual(resolvedData);
    // We're not testing authedRelationship here, but let's confim the type is added
    expect(fields.createdBy.type.type).toEqual('AuthedRelationship');
  });

  test('Adds `updatedBy` to resolvedData for "update" operation', async () => {
    const {
      hooks: { resolveInput },
      fields,
    } = listWithByTracking;
    const resolvedData = { test: 'matches' };
    const res = await resolveInput({
      resolvedData: { ...resolvedData },
      originalInput: { test: '' },
      context: mockAuthedContext,
      operation: 'update',
    });

    // Adds updatedBy because the default value for an authedRelationship only updated on create
    // (or when `updatedBy` is explicitly null)

    // ToDo: we could set this to null, but it's kinda weird...
    // I don't think we should use AutheRelationship field but explisitly set this value each time.
    // AutheRelationship is not handling any additional complexity for us - only adding it

    expect(res).toEqual({ ...resolvedData, updatedBy: 'mock' });
    // We're not testing authedRelationship here, but let's confim the type is added
    expect(fields.updatedBy.type.type).toEqual('AuthedRelationship');
  });

  test('resolves `null` for an unAuthed "update" operation', async () => {
    const {
      hooks: { resolveInput },
      fields,
    } = listWithByTracking;
    const resolvedData = { test: 'matches' };
    const res = await resolveInput({
      resolvedData: { ...resolvedData },
      originalInput: { test: '' },
      context: mockUnAuthedContext,
      operation: 'update',
    });
    // Adds updatedBy because the default value for an authedRelationship is only updated on create
    // (or when `updatedBy` is explicitly null) - which then resolves to null for unauthed updates
    // Why this added complexity and round tripping? Who knows, see the ToDo above.
    expect(res).toEqual({ ...resolvedData, updatedBy: null });
    // We're not testing authedRelationship here, but let's confim the correct type is added
    expect(fields.updatedBy.type.type).toEqual('AuthedRelationship');
  });
});

describe('atTracking', () => {
  test('Has resolveInput hook', async () => {
    expect(listWithAtTracking).toHaveProperty('hooks.resolveInput');
  });

  test('Has created and updated fields', async () => {
    expect(listWithAtTracking).toHaveProperty('fields.createdAt');
    expect(listWithAtTracking).toHaveProperty('fields.updatedAt');
  });

  test('resolves `createdAt` AND `updatedAt` for a "create" operation', async () => {
    const { resolveInput } = listWithAtTracking.hooks;
    const resolvedData = { test: 'matches' };
    const res = await resolveInput({
      resolvedData: { ...resolvedData },
      originalInput: { test: '' },
      context: mockAuthedContext,
      operation: 'create',
    });
    expect(res).toHaveProperty('createdAt');
    expect(res).toHaveProperty('updatedAt');
  });

  test('resolves ONLY `updatedAt` for an "update" operation', async () => {
    const { resolveInput } = listWithAtTracking.hooks;
    const resolvedData = { test: 'matches' };
    const res = await resolveInput({
      resolvedData: { ...resolvedData },
      originalInput: { test: '' },
      context: mockAuthedContext,
      operation: 'update',
    });
    expect(res).not.toHaveProperty('createdAt');
    expect(res).toHaveProperty('updatedAt');
  });
});
