import React from 'react';
import graphql from 'graphql-anywhere';

export default ({ data }) => (
  <div>
    <h1>About {data.site.siteMetadata.title}</h1>
    <p>
      KeystoneJS is an open source framework for developing database-driven websites, applications
      and APIs in Node.js. Built on Express and MongoDB.
    </p>
  </div>
);

export const query = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
