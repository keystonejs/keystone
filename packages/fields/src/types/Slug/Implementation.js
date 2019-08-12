import slugify from '@sindresorhus/slugify';
import cuid from 'cuid';
import {
  Text,
  MongoTextInterface as MongoSlugInterface,
  KnexTextInterface as KnexSlugInterface,
} from '../Text/Implementation';

const MAX_UNIQUE_ATTEMPTS = 100;

const findFirstNonEmptyStringValue = fields =>
  Object.values(fields).find(value => typeof value === 'string' && value);

const generateSlug = valueToSlugify => slugify(valueToSlugify || '');

export class SlugImplementation extends Text {
  constructor(
    path,
    { from, generate, makeUnique, isUnique, regenerateOnUpdate = true },
    { listKey }
  ) {
    const listAndFieldPath = `${listKey}.${path}`;

    if (typeof regenerateOnUpdate !== 'boolean') {
      throw new Error(`The 'regenerateOnUpdate' option on ${listAndFieldPath} must be true/false`);
    }

    if (from && generate) {
      throw new Error(
        `Only one of 'from' or 'generate' can be supplied as an option to the Slug field on ${listAndFieldPath}.`
      );
    }

    let generateFn;
    let makeUniqueFn;

    if (from) {
      if (typeof from !== 'string') {
        if (typeof from === 'function') {
          throw new Error(
            `A function was specified for the 'from' option on ${listAndFieldPath}, but 'from' exects a string. Did you mean to set the 'generate' option?`
          );
        }
        throw new Error(`The 'from' option on ${listAndFieldPath} must be a string`);
      }

      generateFn = ({ resolvedData, existingItem }) => {
        // Look up fields on the list to ensure a valid field was passed
        if (!this.getListByKey(this.listKey).getFieldByPath(from)) {
          throw new Error(
            `The field '${from}' does not exist on the list '${listKey}' as specified in the 'from' option of '${listAndFieldPath}'`
          );
        }
        // Ensure we generate on a complete object (because `resolvedData` may
        // only be partial)
        return generateSlug({ ...existingItem, ...resolvedData }[from]);
      };
    } else if (!generate) {
      // Set a default `generate` method
      generateFn = ({ resolvedData, existingItem }) => {
        // Ensure we generate on a complete object (because `resolvedData` may
        // only be partial)
        const { id, name, title, ...fields } = { ...existingItem, ...resolvedData };
        const valueToSlugify = name || title || findFirstNonEmptyStringValue(fields);
        if (!valueToSlugify) {
          throw new Error(
            'Unable to find a valid field to generate a slug for ${listAndFieldPath}. Please provide a `generate` method.'
          );
        }
        return generateSlug(valueToSlugify);
      };
    } else {
      if (typeof generate !== 'function') {
        throw new Error(
          `The 'generate' option on ${listAndFieldPath} must be a function, but received ${typeof generate}`
        );
      }

      // Wrap the provided generator function in an error handler
      generateFn = async ({ resolvedData, existingItem }) => {
        const slug = await generate({ resolvedData, existingItem });
        if (typeof slug !== 'string') {
          throw new Error(
            `${listAndFieldPath}'s 'generate' option resolved with a ${typeof slug}, but expected a string.`
          );
        }
        return slug;
      };
    }

    if (typeof makeUnique === 'undefined') {
      // Set the default uniqueifying function
      makeUniqueFn = ({ slug }) => `${slug}-${cuid.slug()}`;
    } else {
      if (typeof makeUnique !== 'function') {
        throw new Error(
          `The 'makeUnique' option on ${listAndFieldPath} must be a function, but received ${typeof makeUnique}`
        );
      }

      // Wrap the provided makeUnique function in an error handler
      makeUniqueFn = async ({ slug, previousSlug }) => {
        const uniqueifiedSlug = await makeUnique({ slug, previousSlug });
        if (typeof uniqueifiedSlug !== 'string') {
          throw new Error(
            `${listAndFieldPath}'s 'makeUnique' option resolved with a ${typeof uniqueifiedSlug}, but expected a string.`
          );
        }
        return uniqueifiedSlug;
      };
    }

    const isUniqueCalculated = typeof isUnique === 'undefined' ? true : isUnique;

    super(
      arguments[0],
      {
        ...arguments[1],
        // Default isUnique to true
        isUnique: isUniqueCalculated,
      },
      arguments[2]
    );

    this.isUnique = isUniqueCalculated;
    this.generateFn = generateFn;
    this.makeUnique = makeUniqueFn;
    this.regenerateOnUpdate = regenerateOnUpdate;
  }

  async resolveInput({ resolvedData, existingItem, actions: { query } }) {
    let slug;

    // A slug has been passed in
    if (resolvedData[this.path]) {
      // A slug was passed in, so we want to use that.
      // NOTE: This can result in slugs changing if doing an update and the
      // passed-in slug is not unique:
      // 1. Perform a `create` mutation: `createPost(data: { slug:
      //    "hello-world" }) { slug }`.
      //   * Result: `{ slug: "hello-world" }`
      // 2. Perform a second `create` mutation with the same slug: `createPost(data: { slug: "hello-world" }) { id slug }`.
      //   * Result (approximately): `{ id: "1", slug: "hello-world-weer84fs" }`
      // 3. Perform an update to the second item, with the same slug as the first (again): `updatePost(id: "1", data: { slug: "hello-world" }) { id slug }`.
      //   * Result (approximately): `{ id: "1", slug: "hello-world-uyi3lh32" }`
      //   * The slug has changed, even though we passed the same slug in.
      //     This happens because there is no way to know what the previously
      //     passed-in slug was, only the most recently _uniquified_ slug (ie;
      //     `"hello-world-weer84fs"`).
      slug = resolvedData[this.path];
    } else {
      // During a create
      if (!existingItem) {
        // We always generate a new one
        slug = await this.generateFn({ resolvedData });
      } else {
        // During an update
        // There used to be a slug set, and we don't want to forcibly regenerate
        if (!this.regenerateOnUpdate) {
          // So we re-use that existing slug
          // Later, we check for uniqueness against other items, while excluding
          // this one, ensuring this slug stays stable.
          // NOTE: If a slug was not previously set, this _will not_ generate a
          // new one.
          slug = existingItem[this.path];
        } else {
          // Attempt to regenerate the raw slug (before it was passed through
          // `makeUnique`) from existing data
          const existingNonUniqueSlug = await this.generateFn({ resolvedData: existingItem });

          // Now generate the new raw slug (it has yet to be passed through
          // `makeUnique`)
          const newNonUniqueSlug = await this.generateFn({ resolvedData, existingItem });

          if (existingNonUniqueSlug === newNonUniqueSlug) {
            // If they match, we can re-use the existing, unique slug. Note this
            // will still pass through uniquification, but because we only check
            // uniqueness against _other_ items, and this item already existed,
            // we can assume it will not need re-uniquifying, so passing it
            // through the logic below is ok.
            slug = existingItem[this.path];
          } else {
            // If they don't match, we have to assume some data important to the
            // slug has changed, so we go with the new value, and let it get
            // uniquified later
            slug = newNonUniqueSlug;
          }
        }
      }
    }

    if (!this.isUnique) {
      return slug;
    }

    let previousSlug;
    let slugIsUnique;
    let makeUniqueAttempts = 0;
    const listAndFieldPath = `${this.listKey}.${this.path}`;

    // The "all<List>s" query
    const { listQueryMetaName, whereInputName } = this.getListByKey(this.listKey).gqlNames;

    // A query to find any _other_ items with the same slug
    const queryString = `
      query findDuplicate($where: ${whereInputName}) {
        ${listQueryMetaName}(where: $where) {
          count
        }
      }
    `;

    // Repeat until we have a unique slug, or we've tried too many times
    do {
      if (makeUniqueAttempts >= MAX_UNIQUE_ATTEMPTS) {
        throw new Error(
          `Attempted to generate a unique slug for ${listAndFieldPath}, but failed after too many attempts. If you've passed a custom 'makeUnique' function, ensure it is working correctly`
        );
      }
      makeUniqueAttempts++;

      // Check to see if the slug is unique
      const { data, errors } = await query(queryString, {
        variables: {
          where: {
            [this.path]: slug,
            // Ensure we ignore the current item when doing an update
            ...(existingItem && existingItem.id && { id_not_in: [existingItem.id] }),
          },
        },
      });

      if (errors) {
        throw new Error(
          `Attempted to generate a unique slug for ${listAndFieldPath}, but failed with an error: ${errors[0].toString()}`
        );
      }

      const duplicates = data[listQueryMetaName].count;

      // If there aren't any matches, this slug can be considered unique
      slugIsUnique = duplicates === 0;

      if (!slugIsUnique) {
        // An existinig slug was found, so we try make it unique
        slug = await this.makeUnique({ slug, previousSlug });
        previousSlug = slug;
      }
    } while (!slugIsUnique);

    return slug;
  }
}

export { MongoSlugInterface, KnexSlugInterface };
