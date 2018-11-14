import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../layouts';

export default ({ data }) => (
  <Layout>
    <div>
      <h1>About {data.site.siteMetadata.title}</h1>
      <p>
        KeystoneJS is an open source framework for developing database-driven websites, applications
        and APIs in Node.js. Built on Express and MongoDB.
      </p>
    </div>
  </Layout>
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
