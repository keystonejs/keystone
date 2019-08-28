import Head from 'next/head';
import Link from 'next/link';

import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useState } from 'react';

import { jsx } from '@emotion/core';
import { format } from 'date-fns';

import Layout from '../../templates/layout';
import Header from '../../components/header';

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
  query AllQueries($slug: String) {
    allPosts(where: { slug: $slug }) {
      id
      title
      slug
      body
      posted
      image {
        publicUrl
      }
      author {
        name
      }
    }

    allComments(where: { originalPost: { slug: $slug } }) {
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

const AddComments = ({ users, post }) => {
  const [createComment] = useMutation(ADD_COMMENT, {
    update: (cache, { data: data }) => {
      const { allComments, allUsers, allPosts } = cache.readQuery({
        query: ALL_QUERIES,
        variables: { slug: post.slug },
      });

      cache.writeQuery({
        query: ALL_QUERIES,
        variables: { slug: post.slug },
        data: {
          allPosts,
          allUsers,
          allComments: allComments.concat([data.createComment]),
        },
      });
    },
  });
  let user = users.filter(u => u.email == 'user@keystonejs.com')[0];
  let [comment, setComment] = useState('');

  return (
    <div>
      <h2>Add new Comment</h2>
      <form
        onSubmit={e => {
          e.preventDefault();

          createComment({
            variables: {
              body: comment,
              author: user.id,
              postId: post.id,
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
    </div>
  );
};

const PostPage = ({ slug }) => {
  const { data, loading, error } = useQuery(ALL_QUERIES, { variables: { slug } });
  const post = data.allPosts && data.allPosts[0];
  return (
    <Layout>
      <Header />
      <div css={{ margin: '48px 0' }}>
        <Link href="/" passHref>
          <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
        </Link>
        {loading ? (
          <p>loading...</p>
        ) : error ? (
          <p>Error!</p>
        ) : post ? (
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
              <article css={{ padding: '1em' }}>
                <h1 css={{ marginTop: 0 }}>{post.title}</h1>
                <section dangerouslySetInnerHTML={{ __html: post.body }} />
                <div css={{ marginTop: '1em', borderTop: '1px solid hsl(200, 20%, 80%)' }}>
                  <p css={{ fontSize: '0.8em', marginBottom: 0, color: 'hsl(200, 20%, 50%)' }}>
                    Posted by {post.author ? post.author.name : 'someone'} on{' '}
                    {format(post.posted, 'DD/MM/YYYY')}
                  </p>
                </div>
              </article>
            </div>

            <Comments data={data} />

            <AddComments post={post} users={data.allUsers} />
          </>
        ) : (
          <p>404: Post not found</p>
        )}
      </div>
    </Layout>
  );
};

PostPage.getInitialProps = ({ query: { slug } }) => {
  return { slug };
};

export default PostPage;
