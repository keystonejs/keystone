import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient, { gql } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';
import { jsx, Global } from '@emotion/core';

import { format } from 'date-fns';

/* @jsx jsx */

const client = new ApolloClient({
      uri: '/admin/api',
});

const GET_POSTS = gql`
  {
    allPosts {
      name
      body
      posted
      author{
            name
      }
    }
  }
`;

const Card = ({ post }) => {
      return (
            <div css={{
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  flexBasis: 300,
                  flexGrow: 0,
                  flexShrink: 0,
                  boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
                  margin: 10,
                  justifyContent: 'space-between',

                  ':first-child': {
                        marginLeft: 50
                  }
            }}>
                  <div>
                        <img src='https://picsum.photos/200/150/?random' css={{ width: '100%' }} />
                        <div css={{ padding: 12 }}>
                              <h3 css={{ margin: 0 }}>{post.name}</h3>
                              <p css={{ margin: '10px 0 0 0' }}>{post.body}</p>

                        </div>
                  </div>
                  <div css={{ margin: 12, borderTop: '1px solid black' }}>
                        <p css={{ fontSize: '0.8em', color: '#aaa' }}>Posted by {post.author.name} on {format(post.posted, 'DD/MM/YYYY')}</p>
                  </div>
            </div >
      )
}

const App = () => (
      <ApolloProvider client={client}>
            <Global
                  styles={{
                        body: {
                              paddingTop: '3em',
                              margin: 0,
                              background: '#EFEFEF',
                              fontFamily: "'Merriweather', system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif",
                        },
                        '*': { boxSizing: 'border-box' },
                  }}
            />
            <h1 css={{ paddingLeft: '1.5em', paddingBottom: '1em' }}>My Blog</h1>
            <Query query={GET_POSTS}>
                  {({ data, loading, error }) => {
                        if (loading) return <p>loading...</p>;
                        if (error) return <p>Error!</p>;
                        return (
                              <div>
                                    <h3 css={{ fontSize: '1em', textTransform: 'uppercase', opacity: 0.5, paddingLeft: '3em', }}>Latest Posts</h3>
                                    <div css={{
                                          width: '100%',
                                          display: 'flex',
                                          flexDirection: 'row',
                                          overflow: 'scroll',
                                          padding: '10px 0',
                                    }}>
                                          {data.allPosts.map((post, index) => (
                                                <Card post={post} key={index} />
                                          ))}
                                    </div>
                              </div>
                        );
                  }}
            </Query>
      </ApolloProvider >
);

ReactDOM.render(<App />, document.getElementById('app'));
