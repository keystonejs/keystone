export * as postgresql from './providers/postgresql';
export * as sqlite from './providers/sqlite';
export * as mongodb from './providers/mongodb';

type EntriesAssumingNoExtraProps<T> = {
  [Key in keyof T]-?: [Key, T[Key]];
}[keyof T][];

const objectEntriesButAssumeNoExtraProperties: <T>(obj: T) => EntriesAssumingNoExtraProps<T> =
  Object.entries as any;

type CommonFilter<T> = {
  equals?: T | null;
  in?: readonly T[] | null;
  notIn?: readonly T[] | null;
  lt?: T | null;
  lte?: T | null;
  gt?: T | null;
  gte?: T | null;
  contains?: T | null;
  startsWith?: T | null;
  endsWith?: T | null;
  not?: CommonFilter<T> | null;
};

function internalResolveFilter(
  entries: EntriesAssumingNoExtraProps<CommonFilter<any>>,
  mode: 'default' | 'insensitive' | undefined
): object {
  const entry = entries.shift();
  if (entry === undefined) return {};
  const [key, val] = entry;
  if (val == null) {
    return {
      AND: [{ [key]: val }, internalResolveFilter(entries, mode)],
    };
  }
  switch (key) {
    case 'equals':
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
    case 'in':
    case 'contains':
    case 'startsWith':
    case 'endsWith': {
      return {
        AND: [{ [key]: val, mode }, { not: null }, internalResolveFilter(entries, mode)],
      };
    }

    case 'notIn': {
      return {
        AND: [
          {
            NOT: [
              internalResolveFilter(objectEntriesButAssumeNoExtraProperties({ in: val }), mode),
            ],
          },
          internalResolveFilter(entries, mode),
        ],
      };
    }
    case 'not': {
      return {
        AND: [
          {
            NOT: [internalResolveFilter(objectEntriesButAssumeNoExtraProperties(val) as any, mode)],
          },
          internalResolveFilter(entries, mode),
        ],
      };
    }
  }
}

export function resolveCommon(val: CommonFilter<any> | null) {
  if (val === null) return null;
  return internalResolveFilter(objectEntriesButAssumeNoExtraProperties(val), undefined);
}

export function resolveString(
  val: (CommonFilter<string> & { mode?: 'default' | 'insensitive' | null }) | null
) {
  if (val === null) return null;
  let { mode, ...rest } = val;
  return internalResolveFilter(objectEntriesButAssumeNoExtraProperties(rest), mode as any);
}
