import React from 'react';
import { H1, H2 } from '../../../components/docs/Heading';
import { DocsPage } from '../../../components/Page';
import {
  DocumentEditorDemo,
  DocumentFeaturesProvider,
} from '../../../components/docs/DocumentEditorDemo';
import { Well } from '../../../components/primitives/Well';
import { RelatedContent } from '../../../components/RelatedContent';
import { InlineCode } from '../../../components/primitives/Code';

export default function DocumentFieldDemo() {
  const title = 'Document Fields Demo';
  return (
    <DocsPage
      noProse
      title={title}
      description={
        'Try Keystone’s powerful new Document field. Experiment with its config settings in real time to shape custom editing experiences.'
      }
      headings={[
        {
          label: 'Document Fields Demo',
          id: 'title',
          depth: 1,
        },
        {
          label: 'Configure the demo',
          id: 'configure-the-demo',
          depth: 2,
        },
        {
          label: 'Related resources',
          depth: 2,
          id: 'related-resources',
        },
      ]}
    >
      <DocumentFeaturesProvider>
        <div className="prose">
          <H1 id="title">{title}</H1>
          <p>
            The{' '}
            <a href="../apis/fields#document">
              <InlineCode>document</InlineCode>
            </a>{' '}
            field type is a highly customisable rich text editor that lets content creators quickly
            and easily edit content in your system.
          </p>
          <p>
            You can experiment with different configuration settings to see how these impact the
            editor experience.
          </p>
          <p>
            See the <a href="./document-fields">document field guide</a> for details on how to
            configure and render the document field in your Keystone application.
          </p>
          <H2 id="configure-the-demo">Configure the demo</H2>
          <p>
            The document field is highly configurable. The form below lets you control which
            features are enabled in the demo editor. You can see the changes both in the toolbar of
            the editor, and in the field configuration itself.
          </p>
        </div>
        <DocumentEditorDemo />
        <div className="prose">
          <H2 id="related-resources">Related resources</H2>
          <RelatedContent>
            <Well heading="Document Field Guide" href="/docs/guides/document-fields">
              Keystone’s document field is a highly customisable rich text editor that stores
              content as structured JSON. Learn how to configure it and incorporate your own custom
              React components.
            </Well>
            <Well
              heading="Example Project: Document Field"
              href="https://github.com/keystonejs/keystone/tree/main/examples/document-field"
              target="_blank"
              rel="noopener noreferrer"
            >
              Illustrates how to configure <InlineCode>document</InlineCode> fields in your Keystone
              system and render their data in a frontend application. Builds on the Blog starter
              project.
            </Well>
          </RelatedContent>
        </div>
      </DocumentFeaturesProvider>
    </DocsPage>
  );
}
