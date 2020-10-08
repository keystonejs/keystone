export type ToneTypes = 'positive' | 'negative' | 'warning' | 'help';

type Common = {
  title: string;
  message?: string;
};
type NeedResolution = {
  preserve: boolean;
  id: string;
  tone: ToneTypes;
};

export type ToastProps = Common & Partial<NeedResolution>;
export type ToastPropsExact = Common & NeedResolution;
