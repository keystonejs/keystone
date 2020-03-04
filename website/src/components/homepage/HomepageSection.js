/** @jsx jsx */
import { jsx } from '@emotion/core';

import { colors } from '@arch-ui/theme';
import { Button } from '../../components';
import { Container } from '../Container';

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
        minHeight: '40vh',
        paddingTop: '4rem',
        paddingBottom: '4rem',
        backgroundColor: variant === 'dark' ? colors.B.D80 : null,
        color: variant === 'dark' ? colors.N05 : null,
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

const SectionHeader = props => <div css={{ textAlign: 'center', marginBottom: 40 }} {...props} />;

const SectionHeading = props => (
  <h2
    css={{
      fontSize: '2.75rem',
      lineHeight: 1.2,
      fontWeight: 600,

      margin: '0 auto 1rem auto',
      maxWidth: 800,
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
      margin: '1.5rem auto 0 auto',
      maxWidth: 640,
    }}
    {...props}
  />
);

export { HomepageSection };
