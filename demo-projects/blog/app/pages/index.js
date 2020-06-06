import Link from 'next/link';

import { gql, useQuery } from '@apollo/client';

import { jsx } from '@emotion/core';
import { format, parseISO } from 'date-fns';

import Layout from '../templates/layout';
import Header from '../components/header';
import { withApollo } from '../lib/apollo';

/** @jsx jsx */

const Post = ({ post }) => {
  return (
    <Link href={`/post/[slug]?slug=${post.slug}`} as={`/post/${post.slug}`} passHref>
      <a
        css={{
          display: 'block',
          background: 'white',
          boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
          marginBottom: 32,
          cursor: 'pointer',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {post.image ? <img src={post.image.publicUrl} css={{ width: '100%' }} /> : null}
        <article css={{ padding: '1em' }}>
          <h3 css={{ marginTop: 0 }}>{post.title}</h3>
          <section dangerouslySetInnerHTML={{ __html: post.body }} />
          <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
            <p css={{ fontSize: '0.8em', marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
              Posted by {post.author ? post.author.name : 'someone'} on{' '}
              {format(parseISO(post.posted), 'dd/MM/yyyy')}
            </p>
          </div>
        </article>
      </a>
    </Link>
  );
};

export default withApollo(() => {
  const { data, loading, error } = useQuery(gql`
    query {
      allPosts {
        title
        id
        body
        posted
        slug
        image {
          publicUrl
        }
        author {
          name
        }
      }
    }
  `);

  return (
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
        {loading ? (
          <p>loading...</p>
        ) : error ? (
          <p>Error!</p>
        ) : (
          <div>
            {data.allPosts.length ? (
              data.allPosts.map(post => <Post post={post} key={post.id} />)
            ) : (
              <p>No posts to display</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
});
