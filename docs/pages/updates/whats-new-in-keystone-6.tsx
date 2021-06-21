/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { getServerSideProps } from '../../components/Markdown';
import { Alert } from '../../components/primitives/Alert';
import { Badge } from '../../components/primitives/Badge';
import { Emoji } from '../../components/primitives/Emoji';
import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';

export default function WhatsNew(props) {
  return (
    <DocsPage noRightNav noProse {...props}>
      <Type as="h1" look="heading48">
        What's New in Keystone 6
      </Type>

      <Alert look="tip" css={{ margin: '1rem 0' }}>
        <Badge look="info">Note</Badge> This page is a working draft, we have more to talk about!
      </Alert>

      <Type as="p" look="body18" margin="1rem 0">
        In this major update, we've focused on improving Keystone's <strong>interfaces</strong>,
        including the way you configure and run Keystone projects, and a whole new Admin UI.
      </Type>
      <Type as="p" look="body18" margin="1rem 0">
        We're also adding powerful new features to make Keystone the best headless content
        management system around, especially when you're using a component-based front-end like
        React and Vue.
      </Type>

      <Type as="h2" look="heading30" margin="2rem 0">
        <Emoji symbol="🌟" alt="Star" /> Here are some of the highlights:
      </Type>

      <Type as="h3" look="heading48" margin="1rem 0">
        Simpler Config with TypeScript
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        We've massively simplified how you configure a Keystone project, and now have full
        TypeScript support so you get autocomplete and validation as you work.
      </Type>

      <Type as="h3" look="heading48" margin="1rem 0">
        All New Admin UI
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        Our Admin UI has been completely rewritten with Next.js behind the scenes and a new Design
        System. It's a lot faster, and more customisable than ever before.
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        Among other improvements, the Keystone Authoring UX is now aware of your application
        permissions, so users get the right field interfaces based on whether they can view or edit
        a field.
      </Type>

      <Type as="h3" look="heading48" margin="1rem 0">
        Document Field
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        You can now set up a visual editor that manages components you have created - with custom
        props, and WYSIWYG previews. Perfect for authoring content that works with a Design System
        on the front-end.
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        Check out the{' '}
        <Link href="/guides/document-fields">
          <a>Live Demo and Docs</a>
        </Link>
      </Type>

      <Type as="h3" look="heading48" margin="1rem 0">
        Extensible GraphQL Schema
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        Keystone now gives you an executable GraphQL Schema that you can extend with your own custom
        types, queries and mutations. It's perfect for adding your own logic into your app, or
        integrating with external services through a unified API.
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        And the best part is, it's the GraphQL Standard, so you can integrate any other project that
        produces a GraphQL API with no additional work, and no lock-in!
      </Type>

      <Type as="h3" look="heading48" margin="1rem 0">
        Next.js-based Server
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        Both Keystone's Admin UI and GraphQL API are now generated into a Next.js app. So anywhere
        you can host Next.js, you can host Keystone.
      </Type>

      <Type as="h3" look="heading48" margin="1rem 0">
        More Flexible Session Management
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        We've replaced `express-session` with our own Session implementation, which gives you full
        control over how user data is stored and initialised for every request.
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        And it flows straight through into access control, with shortcuts for querying the GraphQL
        API and loading exactly the data you need to secure your system.
      </Type>

      <Type as="h3" look="heading48" margin="1rem 0">
        Updated Reference Examples
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        We're building out a comprehensive new set of example projects, so you can see how to easily
        build anything from a simple blog to a complete e-Commerce app back-end.
      </Type>

      <Type as="p" look="body16" margin="1rem 0">
        We also have new reference examples for how to use advanced features, like implementing your
        own roles-based access control system.
      </Type>
    </DocsPage>
  );
}

export { getServerSideProps };
