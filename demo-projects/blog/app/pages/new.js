import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { ApolloProvider, Query } from 'react-apollo';
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

export default ({
  url: {
    query: { id },
  },
}) => (
  <ApolloProvider client={client}>
    <Layout>
      <div css={{ margin: '48px 0' }}>
        <Link href="/">
          <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Go Back'}</a>
        </Link>
        <h1>New Post</h1>
        <form>
          <FormGroup>
            <Label htmlFor="title">Title:</Label>
            <Input type="text" name="title" />
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
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="image">Image URL:</Label>
            <Input type="url" name="image" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="image">Post as:</Label>
            <select
              name="admin"
              css={{
                width: '100%',
                height: 32,
                fontSize: '1em',
                borderRadius: 4,
                border: '1px solid hsl(200,20%,70%)',
              }}
            >
              <option>Nathan</option>
              <option>Daniel</option>
            </select>
          </FormGroup>
        </form>
      </div>
    </Layout>
  </ApolloProvider>
);
