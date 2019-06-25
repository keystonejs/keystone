/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useCallback, createContext, useContext } from 'react';
import pluralize from 'pluralize';

export let type = 'unsplashImage';

// TODO: Receive this value from the server somehow. 'pluralize' is a fairly
// large lib.
export const path = pluralize.plural(type);

let Context = createContext(null);

export let Provider = Context.Provider;

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

const UnsplashImage = ({
  width,
  height,
  unsplashId,
  publicUrl,
  alt,
  user,
  onClick,
  unsplashUrl,
}) => {
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
          height: '250px',
          minWidth: '150px',
          margin: '0 10px 10px 0',
          position: 'relative',
          borderRadius: '5px',
          cursor: 'pointer',
          overflow: 'hidden',
        },
        width <= height ? { width: '300px' } : { width: '100px' },
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
          border: '4px solid transparent',
          transition: 'opacity 0.3s ease-in-out',
          '&:hover': {
            opacity: 1,
            border: '4px solid black',
          },
        }}
      >
        <p
          css={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            margin: 10,
            fontSize: 14,
            fonWeight: 'bold',
            color: 'white',
          }}
        >
          Photo by{' '}
          <a css={linkStyles} href={userUrl} target="_blank" rel="noopener noreferrer">
            {user.name}
          </a>{' '}
          on{' '}
          <a css={linkStyles} href={unsplashUrl} target="_blank" rel="noopener noreferrer">
            Unsplash
          </a>
        </p>
      </div>
    </figure>
  );
};

const Search = () => {
  const options = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    total: 954,
    totalPages: 96,
    results: [
      {
        id: 'abc',
        unsplashId: 'def',
        publicUrl: 'https://via.placeholder.com/400',
        width: 1000 + Math.random() * 100,
        height: 1000 + Math.random() * 100,
        alt: 'an image',
        user: {
          name: 'Jess',
          url: 'http://example.com',
        },
      },
      {
        id: 'abc',
        unsplashId: 'def',
        publicUrl: 'https://via.placeholder.com/400',
        width: 1000 + Math.random() * 100,
        height: 1000 + Math.random() * 100,
        alt: 'an image',
        user: {
          name: 'Jess',
          url: 'http://example.com',
        },
      },
      {
        id: 'abc',
        unsplashId: 'def',
        publicUrl: 'https://via.placeholder.com/400',
        width: 1000 + Math.random() * 100,
        height: 1000 + Math.random() * 100,
        alt: 'an image',
        user: {
          name: 'Jess',
          url: 'http://example.com',
        },
      },
      {
        id: 'abc',
        unsplashId: 'def',
        publicUrl: 'https://via.placeholder.com/400',
        width: 1000 + Math.random() * 100,
        height: 1000 + Math.random() * 100,
        alt: 'an image',
        user: {
          name: 'Jess',
          url: 'http://example.com',
        },
      },
      {
        id: 'abc',
        unsplashId: 'def',
        publicUrl: 'https://via.placeholder.com/400',
        width: 1000 + Math.random() * 100,
        height: 1000 + Math.random() * 100,
        alt: 'an image',
        user: {
          name: 'Jess',
          url: 'http://example.com',
        },
      },
    ],
  });

  const showPrevious = useCallback(() => setSearchPage(Math.max(1, searchPage - 1)), [
    searchPage,
    setSearchPage,
  ]);

  const showNext = useCallback(
    () =>
      setSearchPage(
        Math.min((searchResults && searchResults.totalPages) || Infinity, searchPage + 1)
      ),
    [searchPage, setSearchPage]
  );

  const onChange = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();
      setSearchTerm(event.target.value);
      if (event.target.value.length > 3) {
        console.log('call API: ', event.target.value);
        /*
         *
query searchImages {
  searchUnsplash(query: "computer") {
    total
    totalPages
    results {
      id
      unsplashId
      publicUrl: publicUrlTransformed(transformation: { w: "400"})
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
        */
      }
    },
    [searchTerm, setSearchTerm]
  );

  const unsplashUrl = attributeUrl('https://unsplash.com', options.attribution);

  return (
    <Fragment>
      <label htmlFor="unsplash-block-search-input">
        Type a keyword to search images on Unsplash
      </label>
      <input
        type="text"
        id="unsplash-block-search-input"
        value={searchTerm}
        onChange={onChange}
        onClick={e => {
          e.stopPropagation();
        }}
        css={{
          flex: 10,
          display: 'inline',
          border: 'none',
          backgroundColor: '#f6f6f6',
          padding: 15,
          fontSize: 18,
          outline: 'none',
          border: '3px solid #f6f6f6',
          '&:focus': {
            borderColor: '#bfbfbf',
          },
          borderRadius: '1000px',
        }}
      />
      {!searchResults && !loading && (
        <div
          css={{
            display: 'flex',
            flexFlow: 'column wrap',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '40px 0',
            color: 'darkgray',
            border: '2px dashed #E4E4E4',
          }}
        >
          <p>Images will appear here when you hit Enter</p>
        </div>
      )}
      <div css={{ position: 'relative' }}>
        {searchResults && searchResults.results.length ? (
          <Fragment>
            <div
              css={{
                display: 'flex',
                flexFlow: 'colunm nowrap',
                justifyContent: 'space-between',
                padding: '20px 0',
                width: '100%',
                fontSize: 'smaller',
                color: 'darkgray',
              }}
            >
              <span>{searchPage > 1 && <a onClick={showPrevious}>Previous</a>}</span>
              <span css={{ width: '100%', textAlign: 'center' }}>
                {searchResults.total} results
              </span>
              <span>{searchPage < searchResults.totalPages && <a onClick={showNext}>Next</a>}</span>
            </div>
            <div
              css={{
                margin: 0,
                padding: 0,
                display: 'flex',
                flexFlow: 'row wrap',
                justifyContent: 'space-evenly',
                width: 'calc(100% + 10px)',
              }}
            >
              {searchResults.results.map(image => (
                <UnsplashImage
                  key={image.unsplashId}
                  {...image}
                  unsplashUrl={unsplashUrl}
                  onClick={() => console.log('image clicked:', image.unsplashId)}
                />
              ))}
            </div>
          </Fragment>
        ) : null}
        {loading && (
          <div
            css={
              searchResults
                ? {
                    position: 'absolute',
                    height: 50,
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                  }
                : {
                    position: 'relative',
                    height: 300,
                  }
            }
          >
            Loading...
          </div>
        )}
      </div>
    </Fragment>
  );
};

let Block = ({ unsplashId, unsplashData, onChange, onRemove }) => {
  let options = useContext(Context);

  let unsplash = null;

  if (unsplashData) {
    const { publicUrl, alt, user } = unsplashData;

    const imgUrl = attributeUrl(publicUrl, options.attribution);
    const userUrl = attributeUrl(user.url, options.attribution);
    const unsplashUrl = attributeUrl('https://unsplash.com', options.attribution);

    unsplash = (
      <div>
        <img css={{ maxWidth: '100%' }} src={imgUrl} alt={alt} />
        <em>
          Photo by <a href={userUrl}>{user.name}</a> on <a href={unsplashUrl}>Unsplash</a>
        </em>
      </div>
    );
  }

  return (
    <Fragment>
      <Search />
      {unsplash}
    </Fragment>
  );
};

export function Sidebar({ editor }) {
  return (
    <button
      type="button"
      onClick={() => {
        editor.insertBlock({ type });
      }}
    >
      Unsplash
    </button>
  );
}

export function Node({ node, editor }) {
  return (
    <Block
      unsplashId={node.data.get('unsplashId')}
      unsplashData={node.data.get('unsplashData')}
      onRemove={() => {
        editor.removeNodeByKey(node.key);
      }}
      onChange={unsplashId => {
        editor.setNodeByKey(node.key, {
          data: node.data.set('unsplashId', unsplashId),
        });
      }}
    />
  );
}

export let schema = {
  isVoid: true,
};

export function serialize({ node }) {
  const unsplashId = node.data.get('unsplashId');

  return {
    mutations: {
      create: {
        image: unsplashId,
      },
    },
    node: {
      ...node.toJSON(),
      // Zero out the data so we don't unnecesarily duplicate the url
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
  return node.set(
    'data',
    node.data.set('unsplashId', joins[0].image.unsplashId).set('unsplashData', joins[0].image)
  );
}
