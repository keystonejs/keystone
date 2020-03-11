export const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'TEST' }],
  },
  {
    type: 'link',
    href: 'https://reactjs.org/docs/introducing-jsx.html/',
    children: [{ text: 'React' }],
  },
  {
    type: 'heading',
    children: [{ text: 'HEADER' }],
  },
  {
    type: 'link',
    href: 'https://www.keystonejs.com/',
    children: [{ text: 'Link test' }],
  },
  {
    type: 'ordered-list',
    children: [
      { type: 'list-item', children: [{ text: 'lelelelelel' }] },
      { type: 'list-item', children: [{ text: 'lalalala' }]  },
    ],
  },
];
