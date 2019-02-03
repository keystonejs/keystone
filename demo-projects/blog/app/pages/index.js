import Link from 'next/link';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { jsx } from '@emotion/core';
import { format } from 'date-fns';

import Layout from '../templates/layout';
import Header from '../components/header';

/** @jsx jsx */

const Post = ({ post }) => {
  return (
    <Link href={{ pathname: '/post', query: { id: post.id } }}>
      <div
        css={{
          background: 'white',
          boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
          marginBottom: 32,
          cursor: 'pointer',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <img
          src={post.image ? post.image.publicUrl : 'https://picsum.photos/900/200/?random'}
          css={{ width: '100%' }}
        />
        <div css={{ padding: '1em' }}>
          <h3 css={{ marginTop: 0 }}>{post.title}</h3>
          <p>{post.body}</p>
          <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
            <p css={{ fontSize: '0.8em', marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
              Posted by {post.author ? post.author.name : 'someone'} on{' '}
              {format(post.posted, 'DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default () => (
  <Layout>
    <Header />
    <section css={{ margin: '48px 0' }}>
      <h2>About</h2>
      <p>
        This blog was created in KeystoneJS, a fantastic open source framework for developing
        database-driven websites, applications and APIs in Node.js and GraphQL.
      </p>
    </section>

    <section css={{ margin: '48px 0' }}>
      <h2>Latest Posts</h2>
      <Query
        query={gql`
          {
            allPosts {
              title
              id
              body
              posted
              image {
                publicUrl
              }
              author {
                name
              }
            }
          }
        `}
      >
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) return <p>Error!</p>;
          return (
            <div>
              {data.allPosts.length ? (
                data.allPosts.map(post => <Post post={post} key={post.id} />)
              ) : (
                <p>No posts to display</p>
              )}
            </div>
          );
        }}
      </Query>
    </section>
  </Layout>
);
