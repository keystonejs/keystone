// Custom Theme Attempt

const colors = {
  blue: '#0065FF',
  red: '#DE350B',
  yellow: '#FF991F',
  green: '#36B37E',
  teal: '#00B8D9',
  purple: '#6554C0',
  gray: '#5E6C84',
  grayLight: '#97A0AF',
  grayDark: '#172B4D',
};

export default {
  plain: {
    color: colors.text,
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: colors.grayLight,
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: colors.gray,
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['property', 'function'],
      style: {
        color: colors.blue,
      },
    },
    {
      types: ['operator'],
      style: {
        color: colors.purple,
      },
    },
    {
      types: ['tag-id', 'selector', 'atrule-id', 'string'],
      style: {
        color: colors.green,
      },
    },
    {
      types: ['attr-name', 'class-name'],
      style: {
        color: colors.red,
      },
    },
    {
      types: ['keyword', 'unit', 'statement', 'regex', 'at-rule', 'tag'],
      style: {
        color: colors.purple,
      },
    },
    {
      types: ['attr-value', 'boolean', 'control', 'directive', 'entity', 'number', 'url'],
      style: {
        color: colors.yellow,
      },
    },
    {
      types: ['placeholder', 'variable'],
      style: {
        color: colors.grayLight,
      },
    },
    {
      types: ['deleted'],
      style: {
        textDecorationLine: 'line-through',
      },
    },
    {
      types: ['inserted'],
      style: {
        textDecorationLine: 'underline',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['important'],
      style: {
        color: colors.red,
      },
    },
  ],
};
