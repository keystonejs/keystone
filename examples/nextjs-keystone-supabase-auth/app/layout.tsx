import React from 'react';
import { Header } from '../components/Header';
import SupabaseListener from '../components/SupabaseListener';
import SupabaseProvider from '../components/SupabaseProvider';
import { getKeystoneSessionContext } from '../keystone/context';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const context = await getKeystoneSessionContext();
  const session = context.session;
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100">
          <SupabaseProvider>
            <Header user={session} />
            <SupabaseListener serverAccessToken={session?.access_token} />

            <main>{children}</main>
          </SupabaseProvider>
        </div>
      </body>
    </html>
  );
}
