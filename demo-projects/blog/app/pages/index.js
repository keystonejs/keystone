import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { ApolloProvider, Query } from 'react-apollo';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { jsx, css } from '@emotion/core';
import { format } from 'date-fns';

import Layout from '../templates/layout';
import Header from '../components/header';

/* @jsx jsx */

const fetch = require('node-fetch');

const client = new ApolloClient({
  link: new HttpLink({ uri: '/admin/api', fetch: fetch }),
  cache: new InMemoryCache(),
});

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
        <img src="https://picsum.photos/900/200/?random" css={{ width: '100%' }} />
        <div css={{ padding: '1em' }}>
          <h3 css={{ marginTop: 0 }}>{post.title}</h3>
          <p>{post.body}</p>
          <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
            <p css={{ fontSize: '0.8em', marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
              Posted by {post.author.name} on {format(post.posted, 'DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default () => (
  <ApolloProvider client={client}>
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
                <div css={{ margin: '24px 0' }}>
                  {data.allPosts.map(post => (
                    <Post post={post} key={post.id} />
                  ))}
                </div>
              </div>
            );
          }}
        </Query>
      </section>
    </Layout>
  </ApolloProvider>
);
