import Head from 'next/head';
import Link from 'next/link';

import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { ApolloProvider, Query } from 'react-apollo';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { jsx } from '@emotion/core';
import { format } from 'date-fns';

import Layout from '../templates/layout';
import Header from '../components/header';

/** @jsx jsx */

const fetch = require('node-fetch');

const client = new ApolloClient({
  link: new HttpLink({ uri: '/admin/api', fetch: fetch }),
  cache: new InMemoryCache(),
});

const Comments = ({ data }) => (
  <div>
    <h2>Comments</h2>
    {data.allComments.length
      ? data.allComments.map(comment => (
          <div
            css={{
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              css={{ width: 48, height: 48, borderRadius: 32 }}
            />
            <div css={{ marginLeft: 16 }}>
              <p
                css={{
                  color: 'hsl(200,20%,50%)',
                  fontSize: '0.8em',
                  fontWeight: 800,
                  margin: '8px 0',
                }}
              >
                {comment.author.name} on {format(comment.posted, 'DD MMM YYYY')}
              </p>
              <p css={{ margin: '8px 0' }}>{comment.body}</p>
            </div>
          </div>
        ))
      : 'No comments yet'}
  </div>
);

const AddComments = () => {
  // let commentInput;

  return (
    // <Mutation
    // mutation={gql`
    //   mutation AddComment($body: String!, $postId: ID!, $authorId: ID!) {
    //     createComment(
    //       data: {
    //         body: $body
    //         author: { connect: { id: $authorId } }
    //         postId: { connect: { id: $postId } }
    //       }
    //     ) {
    //       id
    //     }
    //   }
    // `}
    // update={(cache, { data: { createComment } }) => {

    //   const { allComments } = data;

    //   allComments.push(createComment);

    //   // cache.writeQuery({
    //   //   query: GET_COMMENTS,
    //   //   data: { allTodos },
    //   // });
    // }}
    // >
    //   {createComment => (
    <div>
      <h2>Add new Comment</h2>
      <form
      // onSubmit={e => {
      //   e.preventDefault();
      //   createComment({
      //     variables: {
      //       body: commentInput.value,
      //       authorId: data.allUsers[0].id,
      //     },
      //   });
      // }}
      >
        <div>
          <textarea
            type="text"
            placeholder="Write a comment"
            name="comment"
            css={{
              padding: 12,
              fontSize: 16,
              width: '100%',
              height: 60,
              border: 0,
              borderRadius: 6,
              resize: 'none',
            }}
            // ref={node => {
            //   commentInput = node;
            // }}
          />
        </div>

        <input
          type="submit"
          value="Submit"
          css={{
            padding: '6px 12px',
            borderRadius: 6,
            background: 'hsl(200, 20%, 50%)',
            fontSize: '1em',
            color: 'white',
            border: 0,
            marginTop: 6,
          }}
        />
      </form>
    </div>
    //   )}
    //   ;
    // </Mutation>
  );
};

export default ({
  url: {
    query: { id },
  },
}) => (
  <ApolloProvider client={client}>
    <Layout>
      <Header />
      <div css={{ margin: '48px 0' }}>
        <Link href="/">
          <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
        </Link>
        <Query
          query={gql`
            {
              allPosts(where: { id: "${id}" }) {
                  title
                  body
                  posted
                  image {
                    publicUrl
                  }
                  author {
                    name
                  }
              }

              allComments(where: {originalPost: {id: "${id}"}}){
                  body
                  author {
                    name
                  }
                  posted
              }

              allUsers {
                name
                email
                id
              }
            }`}
        >
          {({ data, loading, error }) => {
            if (loading) return <p>loading...</p>;
            if (error) return <p>Error!</p>;

            const post = data.allPosts[0];

            return (
              <>
                <div
                  css={{
                    background: 'white',
                    margin: '24px 0',
                    boxShadow: '0px 10px 20px hsla(200, 20%, 20%, 0.20)',
                    marginBottom: 32,
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <Head>
                    <title>{post.title}</title>
                  </Head>
                  <img
                    src={
                      post.image ? post.image.publicUrl : 'https://picsum.photos/900/200/?random'
                    }
                    css={{ width: '100%' }}
                  />
                  <div css={{ padding: '1em' }}>
                    <h1 css={{ marginTop: 0 }}>{post.title}</h1>
                    <p>{post.body}</p>
                    <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
                      <p
                        css={{
                          fontSize: '0.8em',
                          marginBottom: 0,
                          color: 'hsl(200, 20%, 50%)',
                        }}
                      >
                        Posted by {post.author.name} on {format(post.posted, 'DD/MM/YYYY')}
                      </p>
                    </div>
                  </div>
                </div>
                <Comments data={data} />
                <AddComments data={data} />
              </>
            );
          }}
        </Query>
      </div>
    </Layout>
  </ApolloProvider>
);
