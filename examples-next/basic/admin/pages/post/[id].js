import React from 'react';
import { useRouter } from '@keystone-next/admin-ui/router';
import { gql, useQuery } from '@keystone-next/admin-ui/apollo';
import { DocumentRenderer } from '@keystone-next/document-renderer';

export default function Post() {
  const id = useRouter().query.id;
  const { data, error } = useQuery(
    gql`
      query Post($id: ID!) {
        Post(where: { id: $id }) {
          id
          title
          author {
            id
            name
          }
          content {
            document
          }
        }
      }
    `,
    { variables: { id } }
  );
  if (error) {
    return 'Error...';
  }
  if (!data) {
    return 'Loading...';
  }
  const post = data.Post;
  return (
    <article>
      <h1>{post.title}</h1>
      <address>{post.author?.name}</address>
      <DocumentRenderer componentBlocks={{}} document={post.content.document} />
    </article>
  );
}
