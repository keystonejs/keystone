/** @jsx jsx */

import { Fragment } from 'react';
import { jsx, Global } from '@emotion/core';
import { globalStyles } from '@arch-ui/theme';
import { BlogLayout, Content } from './layout';
import { HomepageFooter } from '../components/homepage/HomepageFooter';
import { Container } from '../components';
import { SidebarBlog } from '../components/SidebarBlog';

const Blog = ({ pageContext, ...rest }) => {
  const { group, index, first, last, pageCount } = pageContext;
  const previousUrl = index - 1 == 1 ? '/' : (index - 1).toString();
  const nextUrl = (index + 1).toString();

  return (
    <Fragment>
      <BlogLayout>
        {({ sidebarIsVisible, toggleSidebar }) => (
          <Fragment>
            <Container hasGutters={false} css={{ display: 'flex' }}>
              <SidebarBlog isVisible={sidebarIsVisible} toggleSidebar={toggleSidebar} />
              <Content css={{ paddingRight: '2rem' }}>
                <Global styles={globalStyles} />
                <h1
                  css={{
                    fontSize: '4rem',
                    padding: '0.5rem 1rem',
                    '@media min-width: 800px': { padding: '2rem 4rem' },
                  }}
                >
                  Keystone Blog
                </h1>
                {group.map(({ node }) => {
                  const { fields } = node;
                  return (
                    <article
                      key={node.id}
                      css={{
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.06)',
                        marginBottom: '2rem',
                      }}
                    >
                      <div
                        css={{
                          background: 'white',
                          display: 'flex',
                          padding: '1.25rem 2rem',
                          '@media min-width: 800px': { padding: '2rem 4rem' },
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <a
                          href={node.fields.slug}
                          css={{
                            fontSize: '2.75rem',
                            fontWeight: 'bold',
                            color: '#222',
                            ':hover': {
                              textDecoration: 'none',
                            },
                          }}
                        >
                          {fields.pageTitle}
                        </a>
                        <p css={{ margin: 0, marginTop: '0.75rem', padding: 0, fontSize: '.8rem' }}>
                          By <strong>{fields.author || 'Keystone'}</strong>, Published on{' '}
                          {fields.date}
                        </p>

                        <p css={{ lineHeight: '1.5' }}>
                          <a
                            href={node.fields.slug}
                            css={{
                              color: '#222',
                              ':hover': { color: '#222', textDecoration: 'none' },
                            }}
                          >
                            {fields.description}
                          </a>
                        </p>
                        <a
                          href={node.fields.slug}
                          css={{
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '.9rem',
                            ':hover': {
                              color: '#444',
                            },
                          }}
                        >
                          Continue Reading{' '}
                          <svg
                            css={{ width: 12, height: 12, margin: '0 5px' }}
                            aria-hidden="true"
                            focusable="false"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            data-fa-i2svg=""
                          >
                            <path
                              fill="currentColor"
                              d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"
                            />
                          </svg>
                        </a>
                      </div>
                    </article>
                  );
                })}
                <p>
                  Page {index} of {pageCount}
                </p>
                {!first && (
                  <a href={`/blog/${previousUrl === '/' ? '' : previousUrl}`}>Newer posts</a>
                )}
                {!first && ' / '}
                {!last && <a href={`/blog/${nextUrl}`}>Older posts</a>}
                <HomepageFooter />
              </Content>
            </Container>
          </Fragment>
        )}
      </BlogLayout>
    </Fragment>
  );
};

export default Blog;
