/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useCallback, createContext, useContext } from 'react';
import pluralize from 'pluralize';
import { BlockMenuItem } from '@keystonejs/field-content/block-components';
import { Input } from '@arch-ui/input';

import { useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

export let type = 'unsplashImage';

// TODO: Receive this value from the server somehow. 'pluralize' is a fairly
// large lib.
export const path = pluralize.plural(type);

let Context = createContext(null);

export let Provider = Context.Provider;

const RESULTS_PER_PAGE = 5;
const RESULTS_WIDTH = '400';

function attributeUrl(url, { source, medium }) {
  const attributedUrl = new URL(url);

  // Adding source attribution to the URL for Unsplash to track usage
  // https://help.unsplash.com/articles/2511315-guideline-attribution
  if (source) {
    attributedUrl.searchParams.set('utm_source', source);
    if (medium) {
      attributedUrl.searchParams.set('utm_medium', medium);
    }
  }

  return attributedUrl;
}

const UnsplashImage = ({ width, height, unsplashId, publicUrl, alt, user, onClick }) => {
  const options = useContext(Context);

  const imgUrl = attributeUrl(publicUrl, options.attribution);
  const userUrl = attributeUrl(user.url, options.attribution);

  const linkStyles = {
    color: 'white',
    textDecoration: 'underline',
  };

  return (
    <figure
      css={[
        {
          flex: 'auto',
          height: '200px',
          minWidth: '160px',
          margin: '0 4px 4px 0',
          position: 'relative',
          borderRadius: '4px',
          cursor: 'pointer',
          overflow: 'hidden',
        },
        width <= height ? { width: '320px' } : { width: '80px' },
      ]}
      id={unsplashId}
      onClick={onClick}
    >
      <img
        src={imgUrl}
        alt={alt}
        css={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          verticalAlign: 'middle',
        }}
      />
      <div
        css={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage:
            'linear-gradient(180deg,rgba(0,0,0,.2) 0,transparent 40%,transparent 60%,rgba(0,0,0,.3))',
          zIndex: 1,
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out',
          '&:hover': {
            opacity: 1,
          },
        }}
      >
        <p
          css={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            margin: 8,
            fontSize: 14,
            fonWeight: 'bold',
            color: 'white',
          }}
        >
          Photo by{' '}
          <a css={linkStyles} href={userUrl} target="_blank" rel="noopener noreferrer">
            {user.name}
          </a>{' '}
        </p>
      </div>
    </figure>
  );
};

const UNSPLASH_SEARCH_QUERY = gql`
  query searchImages($query: String!, $page: Int, $perPage: Int, $width: String) {
    searchUnsplash(query: $query, perPage: $perPage, page: $page) {
      total
      totalPages
      results {
        id
        unsplashId
        publicUrl: publicUrlTransformed(transformation: { w: $width })
        width
        height
        alt
        user {
          name
          url
        }
      }
    }
  }
`;

const Search = ({ onSelect }) => {
  const options = useContext(Context);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [getUnsplashImages, { data: { searchUnsplash: searchResults } = {} }] = useLazyQuery(
    UNSPLASH_SEARCH_QUERY,
    {
      variables: {
        query: searchTerm,
        page: searchPage,
        perPage: RESULTS_PER_PAGE,
        width: RESULTS_WIDTH,
      },
    }
  );

  const showPrevious = useCallback(() => {
    setSearchPage(Math.max(1, searchPage - 1));
  }, [searchPage]);

  const showNext = useCallback(() => {
    setSearchPage(
      Math.min((searchResults && searchResults.totalPages) || Infinity, searchPage + 1)
    );
  }, [searchPage]);

  const onChange = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();
      setSearchTerm(event.target.value);
      if (event.target.value.length > 3) {
        getUnsplashImages();
      }
    },
    [getUnsplashImages]
  );

  const unsplashUrl = attributeUrl('https://unsplash.com', options.attribution);

  return (
    <div
      css={{
        backgroundColor: '#f2f3f3',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}
    >
      <Input
        autoFocus
        type="text"
        id="unsplash-block-search-input"
        placeholder="Search for an image..."
        value={searchTerm}
        onChange={onChange}
        onClick={e => {
          e.stopPropagation();
        }}
      />
      <div>
        {searchResults && searchResults.results.length ? (
          <Fragment>
            <div
              css={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingTop: '16px',
                paddingBottom: '16px',
                width: '100%',
                fontSize: '0.85rem',
              }}
            >
              <span css={{ flex: 1 }}>
                <a
                  css={{
                    color: searchPage > 1 ? null : '#ccc',
                    cursor: searchPage > 1 ? 'pointer' : 'default',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: searchPage > 1 ? 'underline' : 'none',
                    },
                  }}
                  onClick={showPrevious}
                >
                  Previous
                </a>
              </span>
              <span css={{ flex: 6, textAlign: 'center', color: '#999' }}>
                {searchResults.total} results
              </span>
              <span css={{ flex: 1, textAlign: 'right' }}>
                <a
                  css={{
                    color: searchPage < searchResults.totalPages ? null : '#ccc',
                    cursor: searchPage < searchResults.totalPages ? 'pointer' : 'default',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: searchPage < searchResults.totalPages ? 'underline' : 'none',
                    },
                  }}
                  onClick={showNext}
                >
                  Next
                </a>
              </span>
            </div>
            <div
              css={{
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-evenly',
                width: 'calc(100% + 4px)',
              }}
            >
              {searchResults.results.map(image => (
                <UnsplashImage
                  key={image.unsplashId}
                  {...image}
                  unsplashUrl={unsplashUrl}
                  onClick={() => onSelect(image)}
                />
              ))}
            </div>
          </Fragment>
        ) : (
          <div css={{ padding: '32px', textAlign: 'center', fontSize: '1rem', color: '#cdcdcd' }}>
            Start typing to search for an image on Unsplash
          </div>
        )}
      </div>
    </div>
  );
};

let Block = ({ unsplashData, onSelect }) => {
  let options = useContext(Context);

  let unsplash = null;

  if (unsplashData) {
    const { publicUrl, alt, user } = unsplashData;

    const imgUrl = attributeUrl(publicUrl, options.attribution);
    const userUrl = attributeUrl(user.url, options.attribution);
    const unsplashUrl = attributeUrl('https://unsplash.com', options.attribution);

    const captionLinkStyle = {
      color: 'inherit',
      textDecoration: 'underline',
      '&:hover': {
        textDecoration: 'none',
      },
    };

    unsplash = (
      <div>
        <div>
          <img css={{ maxWidth: '100%' }} src={imgUrl} alt={alt} />
        </div>
        <div css={{ fontSize: '0.75rem', marginTop: '8px', color: '#999' }}>
          Photo by{' '}
          <a href={userUrl} target="_blank" css={captionLinkStyle}>
            {user.name}
          </a>{' '}
          on{' '}
          <a href={unsplashUrl} target="_blank" css={captionLinkStyle}>
            Unsplash
          </a>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {!unsplashData && <Search onSelect={onSelect} />}
      {unsplash}
    </Fragment>
  );
};

export function Sidebar({ editor }) {
  const icon = (
    <svg width={16} height={16} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path d="M480 416v16c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V176c0-26.51 21.49-48 48-48h16v208c0 44.112 35.888 80 80 80h336zm96-80V80c0-26.51-21.49-48-48-48H144c-26.51 0-48 21.49-48 48v256c0 26.51 21.49 48 48 48h384c26.51 0 48-21.49 48-48zM256 128c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-96 144l55.515-55.515c4.686-4.686 12.284-4.686 16.971 0L272 256l135.515-135.515c4.686-4.686 12.284-4.686 16.971 0L512 208v112H160v-48z" />
    </svg>
  );
  return (
    <BlockMenuItem
      icon={icon}
      text="Unsplash"
      insertBlock={() => {
        editor.insertBlock({ type });
      }}
    />
  );
}

export function Node({ node, editor }) {
  return (
    <Block
      unsplashData={node.data.get('unsplashData')}
      onRemove={() => {
        editor.removeNodeByKey(node.key);
      }}
      onSelect={unsplashData => {
        editor.setNodeByKey(node.key, {
          data: node.data.set('unsplashData', unsplashData),
        });
      }}
    />
  );
}

export let getSchema = () => ({
  isVoid: true,
});

export function serialize({ node }) {
  const unsplashData = node.data.get('unsplashData');
  const joinIds = node.data.get('_joinIds');

  const mutations =
    joinIds && joinIds.length
      ? {
          connect: { id: joinIds[0] },
        }
      : {
          create: {
            image: unsplashData.unsplashId,
          },
        };

  return {
    mutations,
    node: {
      ...node.toJSON(),
      // Zero out the data so we don't unnecessarily duplicate the url
      data: {},
    },
  };
}

export function deserialize({ node, joins }) {
  if (!joins || !joins.length) {
    console.error('No unsplash data received when rehydrating unsplashImage block');
    return;
  }

  // Inject the original url back into the block
  return node.set('data', node.data.set('unsplashData', joins[0].image));
}
