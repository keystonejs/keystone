// @flow

export type Id = string;
export type Options = {
  appearance?: 'error' | 'info' | 'success',
  autoDismiss?: boolean,
};
export type Callback = (id: Id) => void;
export type AddFn = (content: Node, options?: Options) => Callback;
export type RemoveFn = (id: Id) => Callback;
export type ToastType = Options & { content: Node, id: Id };
export type ToastsType = Array<ToastType>;
