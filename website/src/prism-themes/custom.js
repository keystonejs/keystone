// Custom Theme Attempt

const colors = {
  blue: '#0052CC',
  red: '#DE350B',
  yellow: '#FF991F',
  green: '#00875A',
  teal: '#00A3BF',
  purple: '#5243AA',
  gray: '#5E6C84',
  grayLight: '#8993A4',
  grayDark: '#172B4D',
};

export default {
  plain: {
    color: colors.text,
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata', 'punctuation'],
      style: {
        color: colors.grayLight,
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
      types: ['attr-name'],
      style: {
        color: colors.purple,
      },
    },
    {
      types: ['keyword', 'unit', 'statement', 'regex', 'at-rule', 'tag'],
      style: {
        color: colors.red,
      },
    },
    {
      types: [
        'attr-value',
        'boolean',
        'class-name',
        'control',
        'directive',
        'entity',
        'number',
        'url',
      ],
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
