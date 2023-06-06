'use client';
import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from './SupabaseProvider';

export function Header({ user }: { user: { name: string } | null }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // We are using the supabase client to manage users
  const login = async () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.log('error', error);
      }
      if (data?.user?.email) {
        router.refresh();
      }
    }
  };

  const logout = async () => {
    console.log('logout');
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.refresh();
    } else {
      console.log('error', error);
    }
  };

  if (!user) {
    return (
      <>
        <div
          style={{
            height: '2rem',
            display: 'flex',
            gap: '1em',
            alignItems: 'flex-end',
          }}
        >
          <label>
            email: <input name="email" type="email" ref={emailRef} placeholder="bruce@email.com" />
          </label>
          <label>
            password:{' '}
            <input name="password" type="password" ref={passwordRef} placeholder="passw0rd" />
          </label>
          <button onClick={login}>login</button>
        </div>
      </>
    );
  }

  return (
    <div
      style={{
        height: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>Hello, {user.name}!</div>
      <button onClick={logout}>logout</button>
    </div>
  );
}
