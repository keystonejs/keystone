/** @jsx jsx */

import { Fragment, useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Slugger from 'github-slugger';
import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/core';
import { SkipNavContent } from '@reach/skip-nav';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import { Layout, Content } from '../templates/layout';
import mdComponents from '../components/markdown';
import { SiteMeta } from '../components/SiteMeta';
import { BlogMeta } from '../components/BlogMeta';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';
import { media, mq } from '../utils/media';
import { useNavData } from '../utils/hooks';
import { titleCase } from '../utils/case';

// TODO: headings, with ids, should come from graphQL
const slugger = new Slugger();

export default function Template({
  data: { mdx, site }, // this prop will be injected by the GraphQL query below.
  pageContext: { slug, isBlog, author, date, pageTitle },
}) {
  let [contentRef, setContentRef] = useState(null);
  let navData = useNavData();
  let flatNavData = navData.reduce((prev, next) => {
    const subNavData = next.subNavs.reduce((prev, next) => [...prev].concat(next.pages), []);
    return [...prev, ...next.pages, ...subNavData];
  }, []);
  let currentPageIndex = flatNavData.findIndex(node => node.path === slug);
  let prev, next;
  if (currentPageIndex !== 0) {
    prev = flatNavData[currentPageIndex - 1];
  }
  if (currentPageIndex !== flatNavData.length - 1) {
    next = flatNavData[currentPageIndex + 1];
  }

  const { body, fields, headings } = mdx;

  const { siteMetadata } = site;
  const suffix = fields.navGroup
    ? fields.navGroup === 'API'
      ? 'API'
      : ` (${titleCase(fields.navGroup)})`
    : '';
  const title = `${
    fields.pageTitle.charAt(0) === '@' ? fields.heading : fields.pageTitle
  }${suffix}`;

  let sluggedHeadings = useMemo(() => {
    slugger.reset();
    return headings
      .filter(h => h.depth > 1 && h.depth < 4)
      .map(h => ({ ...h, id: slugger.slug(h.value) }));
  }, [headings]);

  return (
    <Fragment>
      <SiteMeta pathname={fields.slug} />
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={fields.description} />
        <meta property="og:description" content={fields.description} />
        <meta property="og:url" content={`${siteMetadata.siteUrl}${fields.slug}`} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="article" />
        <meta name="twitter:description" content={fields.description} />
      </Helmet>
      <Layout showSearch={fields.navGroup !== 'blog'}>
        {({ sidebarIsVisible, toggleSidebar }) => (
          <Container hasGutters={false} css={{ display: 'flex' }}>
            <Sidebar
              isVisible={sidebarIsVisible}
              toggleSidebar={toggleSidebar}
              currentGroup={fields.navGroup}
            />
            <Content css={{ alignItems: 'flex-start', display: 'flex', flex: 1 }}>
              <div
                ref={setContentRef}
                className="docSearch-content"
                css={{
                  flex: 1,
                  minWidth: 0,
                  paddingTop: gridSize * 4,
                  paddingBottom: gridSize * 4,
                }}
              >
                <SkipNavContent />
                {isBlog ? (
                  <Fragment>
                    <mdComponents.h1>{pageTitle}</mdComponents.h1>
                    <BlogMeta author={author} date={date} />
                  </Fragment>
                ) : null}

                <MDXProvider components={mdComponents}>
                  <MDXRenderer>{body}</MDXRenderer>
                </MDXProvider>
                <Pagination aria-label="Pagination">
                  {prev ? (
                    <PaginationButton to={prev.path}>
                      <small>&larr; Prev</small>
                      <span>{prev.context.pageTitle}</span>
                    </PaginationButton>
                  ) : (
                    <PaginationPlaceholder />
                  )}
                  {next ? (
                    <PaginationButton align="right" to={next.path}>
                      <small>Next &rarr;</small>
                      <span>{next.context.pageTitle}</span>
                    </PaginationButton>
                  ) : (
                    <PaginationPlaceholder />
                  )}
                </Pagination>
              </div>
              <TableOfContents
                container={contentRef}
                headings={sluggedHeadings}
                editUrl={fields.editUrl}
              />
            </Content>
          </Container>
        )}
      </Layout>
    </Fragment>
  );
}

// ==============================
// Styled Components
// ==============================

// it's important that IDs are sorted by the order they appear in the document
// so we can pluck active from the beginning
function sortVisible(allIds, targetId) {
  return ids => [...ids, targetId].sort((a, b) => (allIds.indexOf(a) > allIds.indexOf(b) ? 1 : -1));
}
const observerOptions = {
  rootMargin: '0px',
  threshold: 1.0,
};

const TableOfContents = ({ container, headings, editUrl }) => {
  let allIds = headings.map(h => h.id);
  let [visibleIds, setVisibleIds] = useState([]);
  let [lastVisibleId, setLastVisbleId] = useState('');

  // observe relevant headings
  useEffect(() => {
    if (container) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const targetId = entry.target.getAttribute('id');
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            setVisibleIds(sortVisible(allIds, targetId));
            setLastVisbleId(targetId);
          } else {
            setVisibleIds(ids => ids.filter(id => id !== targetId));
          }
        });
      }, observerOptions);

      container.querySelectorAll('h2, h3').forEach(node => {
        observer.observe(node);
      });
    }
  }, [container]);

  // catch if we're in a long gap between headings and resolve to the last available.
  let activeId = visibleIds[0] || lastVisibleId;

  return (
    <div
      css={{
        boxSizing: 'border-box',
        display: 'none',
        flexShrink: 0,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        paddingLeft: gridSize * 6,
        paddingRight: gridSize * 3,
        paddingTop: 32,
        position: 'sticky',
        top: 60,
        WebkitOverflowScrolling: 'touch',
        width: 280,

        [media.sm]: { display: 'block' },
      }}
    >
      <h4
        css={{
          color: colors.N40,
          fontSize: '0.8rem',
          fontWeight: 700,
          marginTop: 0,
          textTransform: 'uppercase',
        }}
      >
        On this page
      </h4>
      <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {headings.map((h, i) => {
          let isActive = activeId === h.id;
          return (
            <li
              key={h.value + i}
              css={{
                // increase specificity to element - avoid `!important` declaration
                // override CSS targeting LI elements from `<Content/>`
                'li&': { lineHeight: 1.4 },
              }}
            >
              <a
                css={{
                  color: isActive ? colors.B.base : h.depth === 2 ? colors.N80 : colors.N60,
                  display: 'block',
                  fontSize: h.depth === 3 ? '0.8rem' : '0.9rem',
                  fontWeight: isActive ? '500' : 'normal',
                  paddingLeft: h.depth === 3 ? '0.5rem' : null,

                  // prefer padding an anchor, rather than margin on list-item, to increase hit area
                  paddingBottom: '0.4em',
                  paddingTop: '0.4em',

                  ':hover': {
                    color: colors.B.base,
                  },
                }}
                href={`#${h.id}`}
              >
                {h.value}
              </a>
            </li>
          );
        })}
      </ul>
      <EditSection>
        {/* <p>
          Have you found a mistake, something that is missing, or could be improved on
          this page? Please edit the Markdown file on GitHub and submit a PR with your
          changes.
        </p> */}
        <EditButton href={editUrl} target="_blank">
          <svg
            fill="currentColor"
            height="1.25em"
            width="1.25em"
            viewBox="0 0 40 40"
            css={{ marginLeft: -(gridSize / 2), marginRight: '0.5em' }}
          >
            <path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z" />
          </svg>
          Edit on GitHub
        </EditButton>
      </EditSection>
    </div>
  );
};

const Button = ({ as: Tag, ...props }) => (
  <Tag
    css={{
      border: `1px solid rgba(0, 0, 0, 0.1)`,
      borderBottomColor: `rgba(0, 0, 0, 0.2) !important`,
      borderRadius: borderRadius,
      color: colors.text,
      display: 'inline-block',
      fontWeight: 500,
      padding: `${gridSize * 0.75}px ${gridSize * 2}px`,
      outline: 'none',

      ':hover, :focus': {
        backgroundColor: 'white !important',
        borderColor: `rgba(0, 0, 0, 0.15)`,
        boxShadow: '0 2px 1px rgba(0,0,0,0.05)',
        textDecoration: 'none',
      },
      ':active': {
        backgroundColor: `${colors.N05} !important`,
        boxShadow: 'none',
      },
    }}
    {...props}
  />
);

// Edit
// ------------------------------

const EditSection = props => (
  <section
    css={{
      borderTop: `1px solid ${colors.N10}`,
      marginTop: gridSize * 4,
      paddingBottom: gridSize * 4,
      paddingTop: gridSize * 4,
    }}
    {...props}
  />
);
const EditButton = props => (
  <Button
    as="a"
    css={{
      alignItems: 'center',
      display: 'inline-flex',
      fontSize: '0.85rem',
    }}
    {...props}
  />
);

// Previous / Next Navigation
// ------------------------------
const gutter = gridSize / 2;

const Pagination = props => (
  <nav
    css={{
      display: 'flex',
      marginLeft: -gutter,
      marginRight: -gutter,
      marginTop: '3rem',
    }}
    {...props}
  />
);
const PaginationPlaceholder = props => <div css={{ flex: 1 }} {...props} />;
const PaginationButton = ({ align = 'left', ...props }) => (
  <Button
    as={Link}
    css={mq({
      flex: 1,
      lineHeight: 1.4,
      marginLeft: gutter,
      marginRight: gutter,
      maxWidth: `calc(50% - ${gutter}px)`,
      textAlign: align,

      small: {
        color: colors.N60,
        display: 'block',
        fontSize: '0.85rem',
        marginTop: gutter,
      },
      span: {
        display: 'block',
        fontSize: ['0.95rem', null, '1.25rem'],
        letterSpacing: '-0.025em',
        marginBottom: gutter,
        minWidth: 0, // fix flex bug with overflow
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    })}
    {...props}
  />
);

// ==============================
// Query
// ==============================

// To my chagrin and fury, context is spread on to the available query options.
export const pageQuery = graphql`
  query($mdPageId: String!) {
    mdx(id: { eq: $mdPageId }) {
      body
      headings {
        depth
        value
      }
      fields {
        heading
        description
        editUrl
        pageTitle
        navGroup
        slug
      }
    }
    site {
      siteMetadata {
        siteUrl
      }
    }
  }
`;
