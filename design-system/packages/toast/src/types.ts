export type ToneTypes = 'positive' | 'negative' | 'warning' | 'help';

type Common = {
  title: string;
  message?: string;
  tone: ToneTypes;
};
type NeedResolution = {
  preserve: boolean;
  id: string;
};

export type ToastProps = Common & Partial<NeedResolution>;
export type ToastPropsExact = Common & NeedResolution;
