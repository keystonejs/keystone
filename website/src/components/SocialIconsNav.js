/** @jsx jsx */
import { jsx } from '@emotion/core';

import { colors } from '@arch-ui/theme';
import { mq } from '../utils/media';

const SocialIconsNav = props => (
  <nav aria-label="Social Media Menu" {...props}>
    <ul css={mq({ display: 'flex', listStyle: 'none', margin: 0, padding: 0 })}>
      <li css={{ marginRight: [`1rem`] }}>
        <IconTwitter href="https://twitter.com/keystonejs" target="_blank" title="Twitter" />
      </li>
      <li css={{ marginRight: [`1rem`] }}>
        <IconGithub href="https://github.com/keystonejs/keystone" target="_blank" title="Github" />
      </li>
      <li css={{ marginRight: [`0`] }}>
        <IconSlack href="http://community.keystonejs.com/" target="_blank" title="Slack" />
      </li>
    </ul>
  </nav>
);

// ==============================
// Social Icons
// ==============================

const Icon = ({ children, ...props }) => (
  <a
    css={{
      color: colors.N60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 24,
      width: 24,

      ':not(:first-of-type)': {
        marginLeft: '0.5em',
      },
      ':not(:last-of-type)': {
        marginRight: '0.5em',
      },

      ':hover,:focus': {
        color: colors.N80,
      },

      svg: {
        width: '100%',
      },
    }}
    {...props}
  >
    {children}
  </a>
);
const IconGithub = props => (
  <Icon {...props}>
    <svg viewBox="0 0 16 16" version="1.1" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
    <A11yText>KeystoneJS repository on GitHub</A11yText>
  </Icon>
);
const IconTwitter = props => (
  <Icon {...props}>
    <svg viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.548 20c9.056 0 14.01-7.695 14.01-14.368 0-.219 0-.437-.015-.653.964-.715 1.796-1.6 2.457-2.614a9.638 9.638 0 0 1-2.828.794A5.047 5.047 0 0 0 23.337.366a9.72 9.72 0 0 1-3.127 1.226C18.684-.072 16.258-.48 14.294.598c-1.964 1.078-2.98 3.374-2.475 5.6C7.859 5.994 4.17 4.076 1.67.922.363 3.229 1.031 6.18 3.195 7.662A4.795 4.795 0 0 1 .96 7.032v.064c0 2.403 1.653 4.474 3.95 4.95a4.797 4.797 0 0 1-2.223.087c.645 2.057 2.494 3.466 4.6 3.506A9.725 9.725 0 0 1 0 17.732a13.688 13.688 0 0 0 7.548 2.264"
        fill="currentColor"
        fillRule="nonzero"
      />
    </svg>
    <A11yText>Hear about KeystoneJS on Twitter</A11yText>
  </Icon>
);
const IconSlack = props => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor" fillRule="nonzero">
        <path d="M5.11 15.135a2.503 2.503 0 0 1-2.497 2.497 2.503 2.503 0 0 1-2.497-2.497 2.503 2.503 0 0 1 2.497-2.496H5.11v2.496zM6.368 15.135a2.503 2.503 0 0 1 2.497-2.496 2.503 2.503 0 0 1 2.496 2.496v6.252a2.503 2.503 0 0 1-2.496 2.497 2.503 2.503 0 0 1-2.497-2.497v-6.252zM8.865 5.11a2.503 2.503 0 0 1-2.497-2.497A2.503 2.503 0 0 1 8.865.116a2.503 2.503 0 0 1 2.496 2.497V5.11H8.865zM8.865 6.368a2.503 2.503 0 0 1 2.496 2.497 2.503 2.503 0 0 1-2.496 2.496H2.613A2.503 2.503 0 0 1 .116 8.865a2.503 2.503 0 0 1 2.497-2.497h6.252z" />
        <path d="M18.89 8.865a2.503 2.503 0 0 1 2.497-2.497 2.503 2.503 0 0 1 2.497 2.497 2.503 2.503 0 0 1-2.497 2.496H18.89V8.865zM17.632 8.865a2.503 2.503 0 0 1-2.497 2.496 2.503 2.503 0 0 1-2.496-2.496V2.613A2.503 2.503 0 0 1 15.135.116a2.503 2.503 0 0 1 2.497 2.497v6.252z" />
        <path d="M15.135 18.89a2.503 2.503 0 0 1 2.497 2.497 2.503 2.503 0 0 1-2.497 2.497 2.503 2.503 0 0 1-2.496-2.497V18.89h2.496zM15.135 17.632a2.503 2.503 0 0 1-2.496-2.497 2.503 2.503 0 0 1 2.496-2.496h6.252a2.503 2.503 0 0 1 2.497 2.496 2.503 2.503 0 0 1-2.497 2.497h-6.252z" />
      </g>
    </svg>
    <A11yText>Discuss KeystoneJS on Slack</A11yText>
  </Icon>
);

// ==============================
// Misc
// ==============================

const A11yText = ({ tag: Tag = 'span', ...props }) => (
  <Tag
    css={{
      border: 0,
      clip: 'rect(1px, 1px, 1px, 1px)',
      height: 1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1,
    }}
    {...props}
  />
);

export { SocialIconsNav };
