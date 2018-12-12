import React from 'react';
import { graphql } from 'gatsby';

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  console.log(data);
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { html } = markdownRemark;
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

/*
To my chagrin and fury, context is spread on to the available query options.
*/
export const pageQuery = graphql`
  query($mdPageId: String!) {
    markdownRemark(id: { eq: $mdPageId }) {
      html
    }
  }
`;
