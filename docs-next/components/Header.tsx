/** @jsx jsx  */
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';

export function Header() {
  return (
    <header
      css={{
        borderBottom: '1px solid var(--gray-200)',
      }}
    >
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'start',
          padding: '1rem',
          maxWidth: '66rem',
          margin: '0 auto',
        }}
      >
        <h2>
          <Link href="/" passHref>
            <a
              css={{
                backgroundImage: 'linear-gradient(to right, var(--blue-500), var(--indigo-600))',
                backgroundClip: 'text',
                fontWeight: 600,
                fontSize: '1.25rem',
                lineHeight: '1.75rem',
                color: 'transparent',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 220 220"
                css={{
                  display: 'inline-block',
                  width: '2rem',
                  height: '2rem',
                  marginRight: '0.5rem',
                }}
              >
                <defs>
                  <linearGradient id="logo-a" x1="0%" x2="50%" y1="0%" y2="71.9%">
                    <stop offset="0%" stop-color="#5AE8FA" />
                    <stop offset="100%" stop-color="#2684FF" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#logo-a)"
                  fill-rule="evenodd"
                  d="M290.1 47h117.5c17.8 0 24.3 1.9 30.8 5.3a36.3 36.3 0 0115.1 15.2c3.5 6.5 5.4 13 5.4 30.8v117.4c0 17.9-1.9 24.3-5.4 30.8a36.3 36.3 0 01-15.1 15.2c-6.5 3.4-13 5.3-30.8 5.3H290c-17.8 0-24.3-1.9-30.8-5.3a36.3 36.3 0 01-15.1-15.2c-3.5-6.5-5.3-13-5.3-30.8V98.3c0-17.9 1.8-24.3 5.3-30.8a36.3 36.3 0 0115.1-15.2c6.5-3.4 13-5.3 30.8-5.3zm11.8 56.8V218H327v-36.8l14.4-14.6 34.4 51.4h31.5l-49-69.1 44.7-45.1h-31.3L327 151v-47.3H302z"
                  transform="translate(-238.9 -47)"
                />
              </svg>
              Keystone Next
            </a>
          </Link>
          <span
            css={{
              display: 'inline-block',
              padding: '0 0.25rem',
              borderRadius: '0.25rem',
              background: 'var(--gray-100)',
              color: 'var(--gray-500)',
              border: '1px solid var(--gray-200)',
              fontSize: '0.75rem',
              lineHeight: '1rem',
              marginLeft: '0.5rem',
            }}
          >
            preview
          </span>
        </h2>
        <div
          css={{
            display: 'inline-grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1rem',
            alignItems: 'center',
            marginLeft: 'auto',
          }}
        >
          <a
            href="https://github.com/keystonejs/keystone"
            target="_blank"
            rel="noopener noreferrer"
            css={{
              color: 'var(--gray-700)',
              ':hover': {
                color: 'var(--gray-900)',
              },
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-label="KeystoneJS on GitHub"
              role="img"
            >
              <path
                fillRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>

          <a
            href="https://twitter.com/keystonejs"
            target="_blank"
            rel="noopener noreferrer"
            css={{
              color: 'var(--blue-400)',
              ':hover': {
                color: 'var(--blue-500)',
              },
            }}
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              aria-label="KeystoneJS on Twitter"
              role="img"
            >
              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>

          <a href="https://community.keystonejs.com/" target="_blank" rel="noopener noreferrer">
            <svg
              width="20"
              height="20"
              viewBox="0 0 127 127"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="KeystoneJS on Slack"
              role="img"
            >
              <path
                d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z"
                fill="#E01E5A"
              />
              <path
                d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z"
                fill="#36C5F0"
              />
              <path
                d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z"
                fill="#2EB67D"
              />
              <path
                d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z"
                fill="#ECB22E"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
