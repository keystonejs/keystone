import Head from 'next/head';
import Link from 'next/link';

import gql from 'graphql-tag';
import React from 'react';
import { Mutation, Query } from 'react-apollo';
import { useState } from 'react';

import { jsx } from '@emotion/core';
import { format } from 'date-fns';

import Layout from '../templates/layout';
import Header from '../components/header';

/** @jsx jsx */

const ADD_COMMENT = gql`
  mutation AddComment($body: String!, $author: ID!, $postId: ID!, $posted: DateTime!) {
    createComment(
      data: {
        body: $body
        author: { connect: { id: $author } }
        originalPost: { connect: { id: $postId } }
        posted: $posted
      }
    ) {
      id
      body
      author {
        name
        avatar {
          publicUrl
        }
      }
      posted
    }
  }
`;

const ALL_QUERIES = gql`
  query AllQueries($id: ID!) {
    Post(where: { id: $id }) {
      title
      body
      posted
      id
      image {
        publicUrl
      }
      author {
        name
      }
    }

    allComments(where: { originalPost: { id: $id } }) {
      id
      body
      author {
        name
        avatar {
          publicUrl
        }
      }
      posted
    }

    allUsers {
      name
      email
      id
    }
  }
`;

const imagePlaceholder = name => `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width="100" height="100">
<rect width="100" height="100" fill="hsl(200,20%,50%)" />
<text text-anchor="middle" x="50" y="67" fill="white" style="font-size: 50px; font-family: 'Rubik', sans-serif;">
${name.charAt(0)}</text></svg>`;

const Comments = ({ data }) => (
  <div>
    <h2>Comments</h2>
    {data.allComments.length
      ? data.allComments.map(comment => (
          <div
            key={comment.id}
            css={{
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={
                comment.author.avatar
                  ? comment.author.avatar.publicUrl
                  : imagePlaceholder(comment.author.name)
              }
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

const AddComments = ({ users, postId }) => {
  let user = users.filter(u => u.email == 'a@demo.user')[0];
  let [comment, setComment] = useState('');

  return (
    <div>
      <h2>Add new Comment</h2>
      <Mutation
        mutation={ADD_COMMENT}
        update={(cache, { data: data }) => {
          const { allComments, allUsers, allPosts } = cache.readQuery({
            query: ALL_QUERIES,
            variables: { id: postId },
          });

          cache.writeQuery({
            query: ALL_QUERIES,
            variables: { id: postId },
            data: {
              allPosts,
              allUsers,
              allComments: allComments.concat([data.createComment]),
            },
          });
        }}
      >
        {createComment => (
          <form
            onSubmit={e => {
              e.preventDefault();

              createComment({
                variables: {
                  body: comment,
                  author: user.id,
                  postId: postId,
                  posted: new Date(),
                },
              });

              setComment('');
            }}
          >
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
              value={comment}
              onChange={event => {
                setComment(event.target.value);
              }}
            />

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
        )}
      </Mutation>
    </div>
  );
};

class PostPage extends React.Component {
  static getInitialProps({ query }) {
    return { id: query.id };
  }
  render() {
    const { id } = this.props;
    return (
      <Layout>
        <Header />
        <div css={{ margin: '48px 0' }}>
          <Link href="/">
            <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
          </Link>
          <Query query={ALL_QUERIES} variables={{ id }}>
            {({ data, loading, error }) => {
              if (loading) return <p>loading...</p>;
              if (error) return <p>Error!</p>;

              const post = data.Post;

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
                    {post.image ? <img src={post.image.publicUrl} css={{ width: '100%' }} /> : null}
                    <div css={{ padding: '1em' }}>
                      <h1 css={{ marginTop: 0 }}>{post.title}</h1>
                      <p>{post.body}</p>
                      <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
                        <p
                          css={{ fontSize: '0.8em', marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}
                        >
                          Posted by {post.author ? post.author.name : 'someone'} on{' '}
                          {format(post.posted, 'DD/MM/YYYY')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Comments data={data} id={id} />

                  <AddComments postId={post.id} users={data.allUsers} />
                </>
              );
            }}
          </Query>
        </div>
      </Layout>
    );
  }
}

export default PostPage;
