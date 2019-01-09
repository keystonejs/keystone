import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { ApolloProvider, Mutation, Query } from 'react-apollo';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { jsx, Global } from '@emotion/core';
import styled from '@emotion/styled';

import { format } from 'date-fns';

import Layout from '../templates/layout';

/* @jsx jsx */

const fetch = require('node-fetch');

const client = new ApolloClient({
  link: new HttpLink({ uri: '/admin/api', fetch: fetch }),
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
  mutation AddPost($title: String!, $body: String!, $authorId: ID!) {
    createPost(data: { title: $title, body: $body, author: { connect: { id: $authorId } } }) {
      id
    }
  }
`;

let title;
let body;
let adminId;
// let imageUrl;

export default () => (
  <ApolloProvider client={client}>
    <Layout>
      <div css={{ margin: '48px 0' }}>
        <Link href="/">
          <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
        </Link>
        <h1>New Post</h1>
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
              <Mutation mutation={ADD_POST}>
                {createPost => (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      createPost({
                        variables: {
                          title: title.value,
                          body: body.value,
                          // imageUrl: imageUrl.value,
                          authorId: adminId.value,
                        },
                      });

                      console.log(
                        createPost({
                          variables: {
                            title: title.value,
                            body: body.value,
                            // imageUrl: imageUrl.value,
                            adminId: adminId.value,
                          },
                        })
                      );

                      title.value = '';
                      body.value = '';
                      // imageUrl.value = '';
                    }}
                  >
                    <FormGroup>
                      <Label htmlFor="title">Title:</Label>
                      <Input
                        type="text"
                        name="title"
                        ref={node => {
                          title = node;
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
                        ref={node => {
                          body = node;
                        }}
                        name="body"
                      />
                    </FormGroup>
                    {/* <FormGroup>
                      <Label htmlFor="image">Image URL:</Label>
                      <Input
                        type="url"
                        name="image"
                        ref={node => {
                          imageUrl = node;
                        }}
                      />
                    </FormGroup> */}
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
                        ref={node => {
                          adminId = node;
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
                )}
              </Mutation>
            );
          }}
        </Query>
      </div>
    </Layout>
  </ApolloProvider>
);
