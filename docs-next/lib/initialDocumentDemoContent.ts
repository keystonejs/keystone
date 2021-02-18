export const initialContent = [
  {
    type: 'heading',
    children: [
      {
        text: 'This is the document editor.',
      },
    ],
    level: 1,
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '🔥 For real',
        bold: true,
      },
      {
        text: ', ',
      },
      {
        text: 'try it out',
        italic: true,
      },
      {
        text: '! click anywhere to start editing.',
      },
    ],
  },
  {
    type: 'layout',
    layout: [1, 1],
    children: [
      {
        type: 'layout-area',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: "It's got layout blocks",
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'and all the usual ',
              },
              {
                text: 'formatting',
                code: true,
              },
              {
                text: ' options',
              },
            ],
          },
        ],
      },
      {
        type: 'layout-area',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'You can insert ',
              },
              {
                type: 'link',
                href: 'https://next.keystonejs.com/',
                children: [
                  {
                    text: 'links',
                  },
                ],
              },
              {
                text: '',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'and format text with **',
              },
              {
                text: 'markdown syntax',
                bold: true,
              },
              {
                text: '**',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'component-block',
    component: 'quote',
    props: {},
    children: [
      {
        type: 'component-block-prop',
        propPath: ['content'],
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text:
                  "We're really excited to show you what we've built, and what you can build with it!",
              },
            ],
          },
        ],
      },
      {
        type: 'component-inline-prop',
        propPath: ['attribution'],
        children: [
          {
            text: 'The KeystoneJS Team',
          },
        ],
      },
    ],
  },
  {
    type: 'component-block',
    component: 'notice',
    props: {
      intent: 'info',
    },
    children: [
      {
        type: 'component-block-prop',
        propPath: ['content'],
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'The really cool stuff is behind the ',
              },
              {
                text: '+',
                code: true,
                bold: true,
              },
              {
                text: ' button on the right of the toolbar – these are the ',
              },
              {
                text: 'Custom Components',
                bold: true,
              },
              {
                text: '.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'This one is the ',
              },
              {
                text: 'Notice',
                bold: true,
              },
              {
                text:
                  ', but you can build your own, by just defining their prop types (like you do your Keystone schema) and providing a React Compoent to render the preview.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text:
                  'They store structured data, and can be inserted (and edited!) anywhere in the document. You can even link them to other item in your database with the Realtionship field type.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'component-block',
    component: 'notice',
    props: {
      intent: 'success',
    },
    children: [
      {
        type: 'component-block-prop',
        propPath: ['content'],
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text:
                  'They can also have props that are edited with an inline form, for more complex use cases (including conditional fields)',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'Try inserting a ',
              },
              {
                text: 'Hero',
                bold: true,
              },
              {
                text:
                  " component and you'll see how it works. Remember, you can build your own, so your content authors can insert components from your website's Design System, and your front-end still gets structured data to render!",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Everything above this line 👇🏻 is editable. Expand the block below to see how the data is stored.',
      },
    ],
  },
];
