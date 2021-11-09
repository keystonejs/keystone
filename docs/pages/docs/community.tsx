/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';
import { Well } from '../../components/primitives/Well';
import { useMediaQuery } from '../../lib/media';
import { InlineCode } from '../../components/primitives/Code';
import { Alert } from '../../components/primitives/Alert';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <DocsPage
      noRightNav
      noProse
      title={'Examples'}
      description={
        "A growing collection of community contributions you can use in your project to extend Keystone's features."
      }
      editPath={'docs/examples.tsx'}
    >
      <Type as="h1" look="heading64">
        Community Contributions
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        A growing collection of community contributions you can use in your project to extend
        Keystone's features.
      </Type>

      <Alert look="tip" css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0.5rem 1rem 0.5rem 0',
          }}
        >
          <strong>Share your contributions!</strong> Got a suggestion for this page?{' '}
          <a
            href="https://github.com/keystonejs/keystone/edit/website_live/docs/pages/docs/examples.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            Edit this page
          </a>{' '}
          to let us know.
        </span>
      </Alert>

      <Alert look="error" css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0.5rem 1rem 0.5rem 0',
            lineHeight: '1.5rem',
          }}
        >
          <strong>Heads up!</strong> These projects are maintained by the community, they may be
          incompatible with the latest release of Keystone. Please contact the contributor with any
          issues or questions.
        </span>
      </Alert>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="authentication">
        Authentication
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Additional ways to authenticate users in the Admin UI.
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad1"
          heading="Keystone Next Auth"
          subheading="by Josh Calder"
          href="https://github.com/OpenSaasAU/keystone-nextjs-auth"
          target="_blank"
          rel="noopener noreferrer"
        >
          Enables the adition of social authentication to Keystone 6.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="feature-projects">
        Fields
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Additional fields to add to your schemas.
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad2"
          heading="Azure Storage"
          subheading="by Aaron Powell"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/fields-azure"
          target="_blank"
          rel="noopener noreferrer"
        >
          Store files in Microsoft Azure Storage.
        </Well>
        <Well
          grad="grad2"
          heading="BigInt"
          subheading="by Alexey Murz Korepov"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/fields-bigint"
          target="_blank"
          rel="noopener noreferrer"
        >
          BigInt value, represented in GraphQL as a string.
        </Well>
        <Well
          grad="grad2"
          heading="Dimension"
          subheading="by Gautam Singh"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/fields-dimension"
          target="_blank"
          rel="noopener noreferrer"
        >
          Store units, lengths, widths and heights. Supports inches, feet, millimeters, centimeters
          and meters.
        </Well>
        <Well
          grad="grad2"
          heading="Encrypted"
          subheading="by Gautam Singh"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/fields-encrypted"
          target="_blank"
          rel="noopener noreferrer"
        >
          Store an encrypted string with a secret.
        </Well>
        <Well
          grad="grad2"
          heading="S3"
          subheading="by Gautam Singh"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/fields-s3"
          target="_blank"
          rel="noopener noreferrer"
        >
          Store files in Amazon S3.
        </Well>
        <Well
          grad="grad2"
          heading="S3 Images"
          subheading="by Gautam Singh"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/fields-s3images"
          target="_blank"
          rel="noopener noreferrer"
        >
          Store images in Amazon S3 with{' '}
          <a href="https://github.com/lovell/sharp" target="_blank" rel="noopener noreferrer">
            Sharp
          </a>{' '}
          image processing.
        </Well>
        <Well
          grad="grad2"
          heading="Weight"
          subheading="by Gautam Singh"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/fields-weight"
          target="_blank"
          rel="noopener noreferrer"
        >
          Store weight units. Supports milligrams, grams, kilograms, pounds and ounces.
        </Well>
        <Well
          grad="grad2"
          heading="List Plugins"
          subheading="by Gautam Singh"
          href="https://github.com/keystonejs-contrib/k6-contrib/tree/main/packages/list-plugins"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adds created and updated meta fields to a list, as well as a logging system for testing
          mutations.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="deployment-projects">
        Deployment
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Examples to get a Keystone project hosted on the web.
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad4"
          heading="Microsoft Azure"
          subheading="by Aaron Powell"
          href="https://github.com/aaronpowell/keystone-6-azure-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Deploys a Keystone app backend to Microsoft Azure. Based on the{' '}
          <InlineCode>with-auth</InlineCode> project. <strong>One-click deployment</strong>{' '}
          included.
        </Well>
        <Well
          grad="grad4"
          heading="Docker"
          subheading="by Aurélien Leygues"
          href="https://github.com/aleygues/keystone6-docker"
          target="_blank"
          rel="noopener noreferrer"
        >
          Use Keystone 6 with Docker in a live reloading mode.
        </Well>
      </div>
    </DocsPage>
  );
}
