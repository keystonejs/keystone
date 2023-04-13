import React, { useEffect, useState } from 'react';
import type { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { gql } from 'graphql-request';
import { client } from '../util/request';
import { keystoneContext } from '../keystone/context';

const Home: NextPage = ({ users }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div
      style={{
        padding: '0 2rem',
      }}
    >
      <Head>
        <title>Keystone + Next.js</title>
        <meta
          name="description"
          content="Example to use Keystone APIs in a Next.js server environment."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ display: 'flex', justifyContent: 'center' }}>
        <section>
          <h1>Keystone 🤝 Next.js</h1>
          <ul>
            <li>Below you can see the names of users in the database.</li>
          </ul>

          <ServerRenderedContent users={users} />
          <ClientRenderedContent />

          <h2>How does it work?</h2>

          <p>
            Keystone's APIs can be seamlessly composed to work as a powerful data engine within
            Next.js applications without having to host a separate Keystone server. This is made
            possible by Keystone&apos;s `getContext` API.
          </p>
          <ul>
            <li>
              <strong>CRUD data within your Next.js server:</strong> You can use the Keystone data
              APIs directly in Next.js `getStaticProps` or `getServerSideProps` to CRUD data. ⚡️
            </li>
            <li>
              <strong>CRUD data from browser:</strong> You can use the generated Keystone GraphQL
              schema to setup your own GraphQL server in a Next.js route. This enables you to send
              GraphQL requests from the browser. 🤯
            </li>
          </ul>
          <p>
            <em>
              Note: Since you are not starting the keystone server, the Admin UI will not be
              available. You can host Keystone as a separate server if you need Admin UI.
            </em>
          </p>
          <p>
            <a href="https://github.com/keystonejs/keystone/tree/main/examples/nextjs-keystone">
              Check out the example in the repo more info.
            </a>
          </p>
        </section>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const context = await keystoneContext.withRequest(req, res);
  const users = await context.query.User.findMany({
    query: 'id name about',
  });
  return {
    props: { users: users }, // will be passed to the page component as props
  };
};

function ServerRenderedContent({
  users,
}: {
  users: { id: string; name: string; about: string | null }[];
}) {
  return (
    <div>
      <p>
        <strong>Users fetched from the server (in getServerSideProps)</strong>
      </p>
      <ol>
        {users.map(u => {
          return (
            <li key={u.id}>
              <span>{u.name} </span>
              {u.about && (
                <>
                  <hr />
                  {u.about}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ClientRenderedContent() {
  const [users, setUsers] = useState<Array<{ id: string; name: string; about: string | null }>>([]);

  // Fetch users from REST api route
  useEffect(() => {
    client
      .request(
        gql`
          {
            users {
              id
              name
              about
            }
          }
        `
      )
      .then((data: any) => {
        setUsers(data.users);
      });
  }, []);

  return (
    <div style={{ minHeight: '8rem' }}>
      <p>
        <strong>Users fetched from the browser (in useEffect())</strong>
      </p>
      {users.length ? (
        <ol>
          {users.map(u => {
            return (
              <li key={u.id}>
                <span>{u.name} </span>
                {u.about && (
                  <>
                    <hr />
                    {u.about}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
}

export default Home;
