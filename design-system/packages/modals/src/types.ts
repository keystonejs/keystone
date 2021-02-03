type Action = {
  action: () => void;
  label: string;
};

export type ActionsType = {
  cancel: Action;
  confirm: Action & {
    loading?: boolean;
  };
};

export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';
