import { Value, Node } from 'slate';
import { deserialize } from './src/slate-serializer';

describe('Deserializing JSON -> a Slate.js Value', () => {
  describe('Basic Deserialization', () => {
    test('returns a Slate Value', () => {
      const value = deserialize({ document: {} }, []);
      expect(Value.isValue(value)).toBeTruthy();
    });

    test('handles document with nodes', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'text',
              text: '',
            },
          ],
        },
      };

      const value = deserialize(jsonValue, []);
      expect(value.toJSON()).toMatchObject({
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [{ object: 'text', text: '' }],
        },
      });
    });

    test('handles document with blocks', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [
                {
                  object: 'text',
                  text: '',
                },
              ],
            },
          ],
        },
      };

      const value = deserialize(jsonValue, []);
      expect(value.toJSON()).toMatchObject({
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              data: {},
              nodes: [{ object: 'text', text: '' }],
            },
          ],
        },
      });
    });
  });

  describe('Block Deserialization', () => {
    test('executes block#deserialize() once per block', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [],
            },
            {
              object: 'block',
              type: 'paragraph',
              nodes: [],
            },
          ],
        },
      };

      const blocks = {
        paragraph: {
          type: 'paragraph',
          deserialize: jest.fn(() => {}),
        },
      };

      deserialize(jsonValue, blocks);
      expect(blocks.paragraph.deserialize).toHaveBeenCalledTimes(2);
    });

    test('uses default serialization if block#deserialize() returns falsey', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [
                {
                  object: 'text',
                  text: '',
                },
              ],
            },
          ],
        },
      };

      const blocks = {
        paragraph: {
          type: 'paragraph',
          deserialize: jest.fn(() => {}),
        },
      };

      const value = deserialize(jsonValue, blocks);
      expect(value.toJSON()).toMatchObject({
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              data: {},
              nodes: [{ object: 'text', text: '' }],
            },
          ],
        },
      });
    });

    test('injects serialized node into node array', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [
                {
                  object: 'text',
                  text: '',
                },
              ],
            },
          ],
        },
      };

      const blocks = {
        paragraph: {
          type: 'paragraph',
          deserialize: jest.fn(() =>
            Node.fromJSON({ data: { foo: 'bar' }, object: 'block', type: 'zip' })
          ),
        },
      };

      const value = deserialize(jsonValue, blocks);
      expect(value.toJSON()).toMatchObject({
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'zip',
              data: {
                foo: 'bar',
              },
            },
          ],
        },
      });
    });

    test('does not recurse if block deserialised', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [
                {
                  object: 'block',
                  type: 'paragraph',
                  data: { foo: 'bar' },
                },
              ],
            },
          ],
        },
      };

      const blocks = {
        paragraph: {
          type: 'paragraph',
          deserialize: jest.fn(() =>
            Node.fromJSON({ data: { foo: 'bar' }, object: 'block', type: 'zip' })
          ),
        },
      };

      deserialize(jsonValue, blocks);
      expect(blocks.paragraph.deserialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error cases', () => {
    test('throws error when no document provided', () => {
      expect(() => deserialize({}, [])).toThrow(/Must pass document to deserialize/);
    });

    test('throws error when no blocks provided', () => {
      expect(() => deserialize({ document: {} })).toThrow(/Must pass blocks to deserialize/);
    });

    test('throws if block#deserialize() returns a non-block truthy value', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [],
            },
          ],
        },
      };

      const blocks = {
        paragraph: {
          type: 'paragraph',
          deserialize: jest.fn(() => 'hello'),
        },
      };

      expect(() => deserialize(jsonValue, blocks)).toThrow(/must return a Slate.js Node/);
    });
  });
});
