/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Button } from '../../components';
import { Container } from '../Container';
import { media } from '../../utils/media';

const HomepageSection = ({ children, description, heading, ctaTo, ctaText, ...rest }) => (
  <Section {...rest}>
    <Container css={{ width: '100%' }}>
      {(heading || description) && (
        <SectionHeader>
          {heading && <SectionHeading>{heading}</SectionHeading>}
          {description && <SectionDescription>{description}</SectionDescription>}
        </SectionHeader>
      )}
      {children}
      {ctaTo && ctaText && (
        <div css={{ marginTop: '5rem', textAlign: 'center' }}>
          <Button appearance="primary" variant="solid" to={ctaTo}>
            {ctaText}
          </Button>
        </div>
      )}
    </Container>
  </Section>
);

const Section = ({ children, variant, ...props }) => (
  <section {...props}>
    {variant === 'dark' && (
      <svg viewBox="0 0 10 1" css={{ transform: `translateY(4px)` }}>
        <path fill={colors.B.D80} d="M0 0.6L0 1 10 1 10 0z" />
      </svg>
    )}
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        backgroundColor: variant === 'dark' ? colors.B.D80 : null,
        color: variant === 'dark' ? colors.N05 : null,

        [media.sm]: {
          paddingTop: '4rem',
          paddingBottom: '4rem',
          minHeight: '60vh',
        },
      }}
    >
      {children}
    </div>
    {variant === 'dark' && (
      <svg viewBox="0 0 10 1" css={{ transform: `translateY(-4px) rotate(180deg)` }}>
        <path fill={colors.B.D80} d="M0 0.6L0 1 10 1 10 0z" />
      </svg>
    )}
  </section>
);

const SectionHeader = props => (
  <div css={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 2rem auto' }} {...props} />
);

const SectionHeading = props => (
  <h2
    css={{
      fontSize: '2.25rem',
      lineHeight: 1.2,
      fontWeight: 600,
      margin: 0,

      [media.sm]: {
        fontSize: '2.75rem',
      },
    }}
    {...props}
  />
);

const SectionDescription = props => (
  <p
    css={{
      fontSize: '1.25rem',
      lineHeight: 1.3,
      color: colors.N60,
      margin: '1.5rem 0 0 0',
    }}
    {...props}
  />
);

export { HomepageSection };
