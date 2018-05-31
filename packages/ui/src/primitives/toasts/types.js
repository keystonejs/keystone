// @flow

export type Id = string;
export type Options = {
  appearance?: 'error' | 'success',
  autoDismiss?: boolean,
};
export type AddFn = (content: Id, options?: Options) => () => void;
export type RemoveFn = (id: Id) => () => void;
export type ToastType = Options & { id: Id, content: Node };
export type ToastsType = Array<ToastType>;
