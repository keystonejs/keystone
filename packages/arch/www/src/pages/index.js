import React from 'react';
import graphql from 'graphql-anywhere';

export default ({ data }) => {
  return (
    <div>
      <h1>Introduction = {data.site.siteMetadata.title}</h1>
      <p>
        Our goal is to create a system that enables us to build consistent user experiences with
        ease, yet with enough flexibility to support the broad spectrum of Keystone websites. This
        goal is embedded in our design and code decisions. Our approach to CSS is influenced by
        Object Oriented CSS principles, functional CSS, and BEM architecture.
      </p>
      <p>
        This style guide is living documentation that will be updated as we continue to improve and
        evolve our design system.
      </p>
      <hr
        style={{
          height: 0,
          overflow: 'hidden',
          background: 'transparent',
          border: '0',
          borderBottom: '1px solid #dfe2e5',
          margin: '80px auto',
          width: 200,
        }}
      />
      <h2>Highly reusable, flexible styles</h2>
    </div>
  );
};

export const query = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
