import React, { ReactNode, createContext, useContext, useMemo } from 'react';

import {
  buttonPropDefaults,
  useButtonStyles,
  useButtonTokens,
  SizeKey,
  ToneKey,
  WeightKey,
} from './hooks/button';

export const ButtonContext = createContext<{
  defaults: {
    size: SizeKey;
    tone: ToneKey;
    weight: WeightKey;
  };
  useButtonStyles: typeof useButtonStyles;
  useButtonTokens: typeof useButtonTokens;
}>({
  defaults: buttonPropDefaults,
  useButtonStyles,
  useButtonTokens,
});

// Note hooks are optional for the provider value, but not in the context created above; this is
// because they will be merged with the existing context and always exist in the value
type ProviderHooksProp = {
  useButtonStyles?: typeof useButtonStyles;
  useButtonTokens?: typeof useButtonTokens;
};
type ProviderDefaultsProp = {
  size?: SizeKey;
  tone?: ToneKey;
  weight?: WeightKey;
};
export const ButtonProvider = ({
  defaults,
  hooks,
  children,
}: {
  defaults?: ProviderDefaultsProp;
  hooks?: ProviderHooksProp;
  children: ReactNode;
}) => {
  const parentContext = useContext(ButtonContext);
  const newContext = useMemo(
    () => ({
      ...parentContext,
      ...hooks,
      defaults: {
        ...parentContext.defaults,
        ...defaults,
      },
    }),
    [parentContext, hooks, defaults]
  );
  return <ButtonContext.Provider value={newContext}>{children}</ButtonContext.Provider>;
};
