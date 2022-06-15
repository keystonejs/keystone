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
        text: 'Here’s just a few things you can do with it:',
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
                text: 'Add layout blocks',
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
                href: 'https://keystonejs.com/',
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
                text: 'We’re really excited to show you what we’ve built, and what you can build with it!',
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
                text: 'This component is the ',
              },
              {
                text: 'Notice',
                bold: true,
              },
              {
                text: ', but you can build your own by defining their data schema (like you do your Keystone schema) and providing a React Component to render the preview.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'They store structured data, and can be inserted (and edited!) anywhere in the document. You can even link them to other items in your database with the ',
              },
              {
                text: 'Relationship',
                bold: true,
              },
              {
                text: ' field type.',
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
                text: 'Custom components can also have props that are edited with an inline form, for more complex use cases (including conditional fields)',
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
                text: " component and you'll see how it works. Remember, you can build your own, so your content authors can insert components from your website's Design System, and your front-end still gets structured data to render!",
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
        text: 'This is the end of the editable document. Expand the blocks below to see how the editor has been configured and how the data is stored ↓',
        bold: true,
      },
    ],
  },
];
