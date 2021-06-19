/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { Type } from '../../components/primitives/Type';
import { Page } from '../../components/Page';
import { getStaticProps } from '../../components/Markdown';

export default function WhatsNew({ test }) {
  return (
    <Page>
      <Type as="h1" look="heading48">
        What's New in Keystone 6
      </Type>
      <ul>
        <li>
          <Link href="/updates/">
            <a>What's New</a>
          </Link>
        </li>
        <li>
          <Link href="/updates/roadmap">
            <a>Roadmap</a>
          </Link>
        </li>
        <li>
          <Link href="/releases">
            <a>Releases</a>
          </Link>
        </li>
        <li>
          <Link href="/releases/2021-03-22">
            <a>2021-03-22 {test}</a>
          </Link>
        </li>
      </ul>
      Note: this page is a working draft, we have more to talk about! In this major update, we've
      focused on improving Keystone's **interfaces**, including the way you configure and run
      Keystone projects, and a whole new Admin UI. We're also adding powerful new features to make
      Keystone the best headless content management system around, especially when you're using a
      component-based front-end like React and Vue. #### 🌟 Here are some of the highlights: ##
      Simpler Config with TypeScript We've massively simplified how you configure a Keystone
      project, and now have full TypeScript support so you get autocomplete and validation as you
      work. ## All New Admin UI Our Admin UI has been completely rewritten with Next.js behind the
      scenes and a new Design System. It's a lot faster, and more customisable than ever before.
      Among other improvements, the Keystone Authoring UX is now aware of your application
      permissions, so users get the right field interfaces based on whether they can view or edit a
      field. ## Document Field You can now set up a visual editor that manages components you have
      created - with custom props, and WYSIWYG previews. Perfect for authoring content that works
      with a Design System on the front-end. Check out the [Live Demo and
      Docs](./guides/document-fields) ## Extensible GraphQL Schema Keystone now gives you an
      executable GraphQL Schema that you can extend with your own custom types, queries and
      mutations. It's perfect for adding your own logic into your app, or integrating with external
      services through a unified API. And the best part is, it's the GraphQL Standard, so you can
      integrate any other project that produces a GraphQL API with no additional work, and no
      lock-in! ## Next.js-based Server Both Keystone's Admin UI and GraphQL API are now generated
      into a Next.js app. So anywhere you can host Next.js, you can host Keystone. ## More Flexible
      Session Management We've replaced `express-session` with our own Session implementation, which
      gives you full control over how user data is stored and initialised for every request. And it
      flows straight through into access control, with shortcuts for querying the GraphQL API and
      loading exactly the data you need to secure your system. ## Updated Reference Examples We're
      building out a comprehensive new set of example projects, so you can see how to easily build
      anything from a simple blog to a complete e-Commerce app back-end. We also have new reference
      examples for how to use advanced features, like implementing your own roles-based access
      control system.
    </Page>
  );
}

export { getStaticProps };
