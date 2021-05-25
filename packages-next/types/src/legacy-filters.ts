const identity = (x: any) => x;

export const impls = {
  equalityConditions<T>(fieldKey: string, f: (a: any) => any = identity) {
    return {
      [fieldKey]: (value: T) => ({ [fieldKey]: { equals: f(value) } }),
      [`${fieldKey}_not`]: (value: T | null) =>
        value === null
          ? { NOT: { [fieldKey]: { equals: f(value) } } }
          : {
              OR: [{ NOT: { [fieldKey]: { equals: f(value) } } }, { [fieldKey]: { equals: null } }],
            },
    };
  },
  equalityConditionsInsensitive(fieldKey: string, f: (a: any) => any = identity) {
    return {
      [`${fieldKey}_i`]: (value: string) => ({
        [fieldKey]: { equals: f(value), mode: 'insensitive' },
      }),
      [`${fieldKey}_not_i`]: (value: string) =>
        value === null
          ? { NOT: { [fieldKey]: { equals: f(value), mode: 'insensitive' } } }
          : {
              OR: [
                { NOT: { [fieldKey]: { equals: f(value), mode: 'insensitive' } } },
                { [fieldKey]: null },
              ],
            },
    };
  },

  inConditions<T>(fieldKey: string, f: (a: any) => any = identity) {
    return {
      [`${fieldKey}_in`]: (value: (T | null)[]) =>
        (value.includes(null)
          ? {
              OR: [
                { [fieldKey]: { in: value.filter(x => x !== null).map(f) } },
                { [fieldKey]: null },
              ],
            }
          : { [fieldKey]: { in: value.map(f) } }) as Record<string, any>,
      [`${fieldKey}_not_in`]: (value: (T | null)[]) =>
        (value.includes(null)
          ? {
              AND: [
                { NOT: { [fieldKey]: { in: value.filter(x => x !== null).map(f) } } },
                { NOT: { [fieldKey]: null } },
              ],
            }
          : {
              OR: [{ NOT: { [fieldKey]: { in: value.map(f) } } }, { [fieldKey]: null }],
            }) as Record<string, any>,
    };
  },

  orderingConditions<T>(fieldKey: string, f: (a: any) => any = identity) {
    return {
      [`${fieldKey}_lt`]: (value: T) => ({ [fieldKey]: { lt: f(value) } }),
      [`${fieldKey}_lte`]: (value: T) => ({ [fieldKey]: { lte: f(value) } }),
      [`${fieldKey}_gt`]: (value: T) => ({ [fieldKey]: { gt: f(value) } }),
      [`${fieldKey}_gte`]: (value: T) => ({ [fieldKey]: { gte: f(value) } }),
    };
  },

  containsConditions(fieldKey: string, f: (a: any) => any = identity) {
    return {
      [`${fieldKey}_contains`]: (value: string) => ({ [fieldKey]: { contains: f(value) } }),
      [`${fieldKey}_not_contains`]: (value: string) => ({
        OR: [{ NOT: { [fieldKey]: { contains: f(value) } } }, { [fieldKey]: null }],
      }),
    };
  },

  stringConditions(fieldKey: string, f: (a: any) => any = identity) {
    return {
      ...this.containsConditions(fieldKey, f),
      [`${fieldKey}_starts_with`]: (value: string) => ({ [fieldKey]: { startsWith: f(value) } }),
      [`${fieldKey}_not_starts_with`]: (value: string) => ({
        OR: [{ NOT: { [fieldKey]: { startsWith: f(value) } } }, { [fieldKey]: null }],
      }),
      [`${fieldKey}_ends_with`]: (value: string) => ({ [fieldKey]: { endsWith: f(value) } }),
      [`${fieldKey}_not_ends_with`]: (value: string) => ({
        OR: [{ NOT: { [fieldKey]: { endsWith: f(value) } } }, { [fieldKey]: null }],
      }),
    };
  },

  stringConditionsInsensitive(fieldKey: string, f: (a: any) => any = identity) {
    return {
      [`${fieldKey}_contains_i`]: (value: string) => ({
        [fieldKey]: { contains: f(value), mode: 'insensitive' },
      }),
      [`${fieldKey}_not_contains_i`]: (value: string) => ({
        OR: [
          { NOT: { [fieldKey]: { contains: f(value), mode: 'insensitive' } } },
          { [fieldKey]: null },
        ],
      }),
      [`${fieldKey}_starts_with_i`]: (value: string) => ({
        [fieldKey]: { startsWith: f(value), mode: 'insensitive' },
      }),
      [`${fieldKey}_not_starts_with_i`]: (value: string) => ({
        OR: [
          { NOT: { [fieldKey]: { startsWith: f(value), mode: 'insensitive' } } },
          { [fieldKey]: null },
        ],
      }),
      [`${fieldKey}_ends_with_i`]: (value: string) => ({
        [fieldKey]: { endsWith: f(value), mode: 'insensitive' },
      }),
      [`${fieldKey}_not_ends_with_i`]: (value: string) => ({
        OR: [
          { NOT: { [fieldKey]: { endsWith: f(value), mode: 'insensitive' } } },
          { [fieldKey]: null },
        ],
      }),
    };
  },
};

export const fields = {};
