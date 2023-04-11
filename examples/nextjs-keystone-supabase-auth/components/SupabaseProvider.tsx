'use client';

import React from 'react';
import { createContext, useContext, useState } from 'react';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '../utils/supabase-browser';

type SupabaseContext = {
  supabase: SupabaseClient<any>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  let context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  } else {
    return context;
  }
};
