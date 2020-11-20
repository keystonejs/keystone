export type ISODate = string & { ___ISODateString: true };

export type ISODateRange = {
  start: ISODate;
  end: ISODate;
};

export type InternalDateRange = {
  start?: ISODate;
  end?: ISODate;
};
