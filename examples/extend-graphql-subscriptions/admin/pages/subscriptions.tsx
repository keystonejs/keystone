/** @jsxRuntime classic */
/** @jsx jsx */
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { jsx, Heading } from '@keystone-ui/core'
import {
  ApolloClient,
  gql,
  InMemoryCache,
  useSubscription,
  HttpLink,
} from '@keystone-6/core/admin-ui/apollo'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { css } from '@emotion/css'

import { useState } from 'react'

const styles = {
  container: css`
    display: flex;
    height: 100%;
  `,
  feed: css`
    flex: 1;
    overflow-y: scroll;
    padding: 1rem;
  `,
}
// Setup the TIME subscription
const TIME = gql`
  subscription TIME {
    time {
      iso
    }
  }
`

// Setup the Post subscriptions
const POST_PUBLISHED = gql`
  subscription POST_PUBLISHED {
    postPublished {
      id
      title
      content
      author {
        name
      }
    }
  }
`

const POST_UPDATED = gql`
  subscription POST_UPDATED {
    postUpdated {
      id
      title
      content
      author {
        name
      }
    }
  }
`

// Setup a backup http link for Apollo
const httpLink = new HttpLink({
  uri: `http://localhost:3000/api/graphql`,
})

// Setup the WebSocket link for Apollo
// NOTE: to stop Next.js SSR from breaking, we need to check if window is defined
//  and if not, use the 'httpLink' instead
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: 'ws://localhost:3000/api/graphql',
        })
      )
    : httpLink

// Setup the Apollo client for subscriptions
const subClient = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
})

export default function CustomPage () {
  const [timeRows, setTimeRows] = useState([] as string[])
  const [updatedPostRows, setUpdatedPostRows] = useState([] as string[])
  const [publishedPostRows, setPublishedPostRows] = useState([] as string[])

  function appendTime (row: string) {
    setTimeRows([...timeRows, row])
  }

  // Subscribe to `time` [using the Apollo client above]
  const { data, loading } = useSubscription(TIME, {
    client: subClient,
    onSubscriptionData: ({ subscriptionData }) => {
      appendTime(JSON.stringify(subscriptionData.data.time))
    },
  })

  // Subscribe to `postPublished`
  const { data: updatedPostData, loading: updatedPostLoading } = useSubscription(POST_UPDATED, {
    client: subClient,
    onSubscriptionData: ({ subscriptionData }) => {
      setUpdatedPostRows([...updatedPostRows, JSON.stringify(subscriptionData.data.postUpdated)])
    },
  })

  // Subscribe to `postUpdated`
  const { data: publishedPostData, loading: publishedPostLoading } = useSubscription(
    POST_PUBLISHED,
    {
      client: subClient,
      onSubscriptionData: ({ subscriptionData }) => {
        setPublishedPostRows([
          ...publishedPostRows,
          JSON.stringify(subscriptionData.data.postPublished),
        ])
      },
    }
  )

  return (
    <PageContainer header={<Heading type="h3">Subscriptions</Heading>}>
      <div className={styles.container}>
        <div className={styles.feed}>
          <h4> Current Time </h4>
          <div>
            {!loading &&
              new Date(data?.time?.iso).toLocaleDateString() +
                ' ' +
                new Date(data?.time?.iso).toLocaleTimeString()}
          </div>
          <h4>Raw Time Feed</h4>
          <div>
            {timeRows.map((row, i) => (
              <div key={i}>{row}</div>
            ))}
          </div>
        </div>
        <div className={styles.feed}>
          <h4>Last Published Post Title</h4>
          <div>{!publishedPostLoading && publishedPostData?.postPublished?.title}</div>
          <h4>Published Post Feed</h4>
          <div>
            {publishedPostRows.map((row, i) => (
              <div key={i}>{row}</div>
            ))}
          </div>
        </div>
        <div className={styles.feed}>
          <h4>Last Updated Post Title</h4>
          <div>{!updatedPostLoading && updatedPostData?.postUpdated?.title}</div>
          <h4>Updated Post Feed</h4>
          <div>
            {updatedPostRows.map((row, i) => (
              <div key={i}>{row}</div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
