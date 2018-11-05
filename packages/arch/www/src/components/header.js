import React from 'react';
import Link from 'gatsby-link';

const Header = () => (
  <div
    style={{
      background: 'linear-gradient(145deg, #00c1da, #003bca)',
      color: 'white',
      margin: 0,
      padding: '2rem 0',
      position: 'relative',
      width: '100vw',
    }}
  >
    <div
      style={{
        margin: '0 auto',
        maxWidth: 960,
        padding: '1.45rem 1.0875rem',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        <img
          src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMTAwIDEwMS40IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAgMTAxLjQiIHhtbDpzcGFjZT0icHJlc2VydmUiPgoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik05NS42LDBINC40QzIsMCwwLDIsMCw0LjV2OTIuNWMwLDIuNSwyLDQuNSw0LjQsNC41aDkxLjJjMi40LDAsNC40LTIsNC40LTQuNVY0LjVDMTAwLDIsOTgsMCw5NS42LDB6DQoJCQkgTTYzLjgsODYuOEw0Mi40LDU3LjhsLTUuNSw2Ljd2MjIuM0gyMi4zdi03MmgxNC41djMyLjJsMjUtMzIuMmgxOC41TDUyLjMsNDguNWwzMCwzOC4zSDYzLjh6Ii8+DQoJPC9nPgo8L3N2Zz4NCg=="
          alt="KeystoneJS"
          title="KeystoneJS"
          style={{ height: '3rem', margin: '0 1rem 0 0' }}
        />
        <h1 style={{ margin: 0 }}>Arch - Keystone UI Kit</h1>
      </Link>
    </div>
  </div>
);

export default Header;
