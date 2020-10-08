import { createContext, useContext } from 'react';

import { ToastProps } from './types';

function notInContext() {
  throw new Error('This component must be used inside a <ToastProvider> component.');
}

type ContextType = {
  addToast: (props: ToastProps) => void;
  removeToast: (id: string) => void;
};

export const ToastContext = createContext<ContextType>({
  addToast: notInContext,
  removeToast: notInContext,
});

export const useToasts = () => useContext(ToastContext);
