import Link from 'next/link';

import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { ApolloProvider, Mutation, Query } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'node-fetch';
import { useState } from 'react';

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import Layout from '../templates/layout';

/** @jsx jsx */

const client = new ApolloClient({
  link: createUploadLink({ uri: '/admin/api', fetch: fetch }),
  cache: new InMemoryCache(),
});

const FormGroup = styled.div({
  display: 'flex',
  marginBottom: 8,
  width: '100%',
  maxWidth: 500,
});

const Label = styled.label({
  width: 200,
});

const Input = styled.input({
  width: '100%',
  padding: 8,
  fontSize: '1em',
  borderRadius: 4,
  border: '1px solid hsl(200,20%,70%)',
});

const ADD_POST = gql`
  mutation AddPost(
    $title: String!
    $body: String!
    $authorId: ID!
    $posted: DateTime!
    $image: Upload!
  ) {
    createPost(
      data: {
        title: $title
        body: $body
        author: { connect: { id: $authorId } }
        posted: $posted
        image: $image
      }
    ) {
      id
    }
  }
`;

export default () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [id, setId] = useState('');

  return (
    <ApolloProvider client={client}>
      <Layout>
        <div css={{ margin: '48px 0' }}>
          <Link href="/">
            <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
          </Link>
          <h1>New Post</h1>

          {showBanner && (
            <div
              css={{
                background: id ? '#90ee9061' : '#ee909061',
                border: `1px solid ${id ? 'green' : 'red'}`,
                color: id ? 'green' : 'red',
                padding: 12,
                marginBottom: 32,
                borderRadius: 6,
              }}
            >
              {id ? (
                <span>
                  <strong>Success!</strong> Post has been created.{' '}
                  <a href={`/post?id=${id}`} css={{ color: 'green' }}>
                    Check it out
                  </a>
                </span>
              ) : (
                <span>
                  <strong>Whoops!</strong> Something has gone wrong
                </span>
              )}
            </div>
          )}

          <Query
            query={gql`
              {
                allUsers(where: { isAdmin: true }) {
                  name
                  email
                  id
                }
              }
            `}
          >
            {({ data, loading, error }) => {
              if (loading) return <p>loading...</p>;
              if (error) return <p>Error!</p>;

              return (
                <Mutation
                  mutation={ADD_POST}
                  update={(cache, { data: { createPost } }) => {
                    setId(createPost.id);
                    setShowBanner(true);
                  }}
                >
                  {createPost => {
                    return (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          createPost({
                            variables: {
                              title,
                              body,
                              image,
                              authorId: authorId || data.allUsers[0].id,
                              posted: new Date(),
                            },
                          });

                          setTitle('');
                          setBody('');
                        }}
                      >
                        <FormGroup>
                          <Label htmlFor="title">Title:</Label>
                          <Input
                            type="text"
                            name="title"
                            value={title}
                            onChange={event => {
                              setTitle(event.target.value);
                            }}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="body">Body:</Label>
                          <textarea
                            css={{
                              width: '100%',
                              padding: 8,
                              fontSize: '1em',
                              borderRadius: 4,
                              border: '1px solid hsl(200,20%,70%)',
                              height: 200,
                              resize: 'none',
                            }}
                            name="body"
                            value={body}
                            onChange={event => {
                              setBody(event.target.value);
                            }}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="image">Image URL:</Label>
                          <Input
                            type="file"
                            name="image"
                            // value={image}
                            onChange={event => {
                              setImage(event.target.files[0]);
                            }}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="admin">Post as:</Label>
                          <select
                            name="admin"
                            css={{
                              width: '100%',
                              height: 32,
                              fontSize: '1em',
                              borderRadius: 4,
                              border: '1px solid hsl(200,20%,70%)',
                            }}
                            value={authorId}
                            onSelect={event => {
                              setAuthorId(event.target.value);
                            }}
                          >
                            {data.allUsers.map(user => (
                              <option value={user.id} key={user.id}>{`${user.name} <${
                                user.email
                              }>`}</option>
                            ))}
                          </select>
                        </FormGroup>
                        <input type="submit" value="submit" />
                      </form>
                    );
                  }}
                </Mutation>
              );
            }}
          </Query>
        </div>
      </Layout>
    </ApolloProvider>
  );
};
