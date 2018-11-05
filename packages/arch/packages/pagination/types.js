export type CountArgs = {
  end: number,
  pageSize: number,
  plural: string,
  singular: string,
  start: number,
  total: number,
};
export type CountFormat = CountArgs => Node;
export type LabelType = number => string;
export type OnChangeType = number => void;
