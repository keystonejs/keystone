/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Type } from '../../../components/primitives/Type';
import { Well } from '../../../components/primitives/Well';
import { DocsPage } from '../../../components/Page';
import { useMediaQuery } from '../../../lib/media';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <DocsPage noRightNav noProse>
      <Type as="h1" look="heading64">
        Keystone API
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 0 0">
        Lead text
      </Type>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Sub heading
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Intro text
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Sub heading
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Intro text
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad2" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad2" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad2" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad2" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Sub heading
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Intro text
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad3" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad3" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad3" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad3" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Sub heading
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Intro text
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad4" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad4" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad4" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
        <Well grad="grad4" heading="Your heading" href="/docs/apis/TODO">
          Your text
        </Well>
      </div>
    </DocsPage>
  );
}
