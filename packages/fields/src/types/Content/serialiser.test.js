import { Value, Node } from 'slate';
import { deserialiseToSlateValue } from './serialiser';

describe('Deserializing JSON -> a Slate.js Value', () => {
  describe('Basic Deserialization', () => {
    test('returns a Slate Value', () => {
      const value = deserialiseToSlateValue({ document: {} }, []);
      expect(Value.isValue(value)).toBeTruthy();
    });

    test('handles document with nodes', () => {
      const jsonValue = {
        document: {
          nodes: [
            {
              object: 'text',
              leaves: [
                {
                  text: '',
                },
              ],
            },
          ],
        },
      };

      const value = deserialiseToSlateValue(jsonValue, []);
      expect(value.toJSON()).toMatchObject({
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [{ object: 'text', leaves: [{ object: 'leaf', text: '', marks: [] }] }],
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
                  leaves: [
                    {
                      text: '',
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const value = deserialiseToSlateValue(jsonValue, []);
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
              nodes: [{ object: 'text', leaves: [{ object: 'leaf', text: '', marks: [] }] }],
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

      deserialiseToSlateValue(jsonValue, blocks);
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
                  leaves: [
                    {
                      text: '',
                    },
                  ],
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

      const value = deserialiseToSlateValue(jsonValue, blocks);
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
              nodes: [{ object: 'text', leaves: [{ object: 'leaf', text: '', marks: [] }] }],
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
                  leaves: [
                    {
                      text: '',
                    },
                  ],
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

      const value = deserialiseToSlateValue(jsonValue, blocks);
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

      deserialiseToSlateValue(jsonValue, blocks);
      expect(blocks.paragraph.deserialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error cases', () => {
    test('throws error when no document provided', () => {
      expect(() => deserialiseToSlateValue({}, [])).toThrow(
        /Must pass document to deserialiseToSlateValue/
      );
    });

    test('throws error when no blocks provided', () => {
      expect(() => deserialiseToSlateValue({ document: {} })).toThrow(
        /Must pass blocks to deserialiseToSlateValue/
      );
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

      expect(() => deserialiseToSlateValue(jsonValue, blocks)).toThrow(
        /must return a Slate.js Node/
      );
    });
  });
});
