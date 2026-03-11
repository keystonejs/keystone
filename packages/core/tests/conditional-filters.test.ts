import type { ActionMeta, ConditionalFilterCase } from '../src/types'
import { getQueriedFieldKeysWithActions, testFilter } from '../src/admin-ui/utils/filters'

describe('conditional filters', () => {
  test('flat field predicates still use implicit AND and field-level not', () => {
    expect(
      testFilter(
        {
          status: { equals: 'published' },
          priority: { in: ['high', 'urgent'], not: { equals: 'urgent' } },
        },
        {
          status: 'published',
          priority: 'high',
        }
      )
    ).toBe(true)

    expect(
      testFilter(
        {
          status: { equals: 'published' },
          priority: { in: ['high', 'urgent'], not: { equals: 'urgent' } },
        },
        {
          status: 'published',
          priority: 'urgent',
        }
      )
    ).toBe(false)
  })

  test('AND requires every nested clause to pass', () => {
    expect(
      testFilter(
        {
          AND: [{ status: { equals: 'published' } }, { featured: { equals: true } }],
        },
        {
          status: 'published',
          featured: true,
        }
      )
    ).toBe(true)

    expect(
      testFilter(
        {
          AND: [{ status: { equals: 'published' } }, { featured: { equals: true } }],
        },
        {
          status: 'published',
          featured: false,
        }
      )
    ).toBe(false)
  })

  test('OR requires at least one nested clause to pass', () => {
    expect(
      testFilter(
        {
          OR: [{ status: { equals: 'draft' } }, { featured: { equals: true } }],
        },
        {
          status: 'published',
          featured: true,
        }
      )
    ).toBe(true)

    expect(
      testFilter(
        {
          OR: [{ status: { equals: 'draft' } }, { featured: { equals: true } }],
        },
        {
          status: 'published',
          featured: false,
        }
      )
    ).toBe(false)
  })

  test('NOT negates a nested clause', () => {
    expect(
      testFilter(
        {
          NOT: { archived: { equals: true } },
        },
        {
          archived: false,
        }
      )
    ).toBe(true)

    expect(
      testFilter(
        {
          NOT: { archived: { equals: true } },
        },
        {
          archived: true,
        }
      )
    ).toBe(false)
  })

  test('field predicates and logical operators at the same level are implicitly ANDed', () => {
    expect(
      testFilter(
        {
          status: { equals: 'published' },
          OR: [{ featured: { equals: true } }, { priority: { equals: 'high' } }],
        },
        {
          status: 'published',
          featured: false,
          priority: 'high',
        }
      )
    ).toBe(true)

    expect(
      testFilter(
        {
          status: { equals: 'published' },
          OR: [{ featured: { equals: true } }, { priority: { equals: 'high' } }],
        },
        {
          status: 'draft',
          featured: true,
          priority: 'high',
        }
      )
    ).toBe(false)
  })

  test('AND, OR, NOT, and sibling field predicates are all implicitly ANDed together', () => {
    expect(
      testFilter(
        {
          status: { equals: 'published' },
          AND: [{ author: { equals: 'emma' } }],
          OR: [{ featured: { equals: true } }, { priority: { equals: 'high' } }],
          NOT: { archived: { equals: true } },
        },
        {
          status: 'published',
          author: 'emma',
          featured: false,
          priority: 'high',
          archived: false,
        }
      )
    ).toBe(true)

    expect(
      testFilter(
        {
          status: { equals: 'published' },
          AND: [{ author: { equals: 'emma' } }],
          OR: [{ featured: { equals: true } }, { priority: { equals: 'high' } }],
          NOT: { archived: { equals: true } },
        },
        {
          status: 'published',
          author: 'emma',
          featured: false,
          priority: 'low',
          archived: false,
        }
      )
    ).toBe(false)

    expect(
      testFilter(
        {
          status: { equals: 'published' },
          AND: [{ author: { equals: 'emma' } }],
          OR: [{ featured: { equals: true } }, { priority: { equals: 'high' } }],
          NOT: { archived: { equals: true } },
        },
        {
          status: 'published',
          author: 'emma',
          featured: true,
          priority: 'low',
          archived: true,
        }
      )
    ).toBe(false)
  })

  test('recursive combinations evaluate correctly', () => {
    const filter: ConditionalFilterCase<any> = {
      AND: [
        {
          OR: [{ priority: { equals: 'high' } }, { priority: { equals: 'urgent' } }],
        },
        {
          NOT: { isComplete: { equals: true } },
        },
      ],
    }

    expect(
      testFilter(filter, {
        priority: 'urgent',
        isComplete: false,
      })
    ).toBe(true)

    expect(
      testFilter(filter, {
        priority: 'low',
        isComplete: false,
      })
    ).toBe(false)

    expect(
      testFilter(filter, {
        priority: 'high',
        isComplete: true,
      })
    ).toBe(false)
  })

  test('collects field dependencies from nested action filters', () => {
    const actions = [
      {
        key: 'publish',
        graphql: { fields: [], names: { one: 'publishPost', many: 'publishPosts' } },
        label: 'Publish',
        icon: null,
        messages: {
          promptTitle: '',
          promptTitleMany: '',
          prompt: '',
          promptMany: '',
          promptConfirmLabel: '',
          promptConfirmLabelMany: '',
          fail: '',
          failMany: '',
          success: '',
          successMany: '',
        },
        itemView: {
          actionMode: 'enabled',
          navigation: 'follow',
          hidePrompt: false,
          hideToast: false,
        },
        listView: {
          actionMode: {
            disabled: {
              AND: [
                { status: { equals: 'draft' } },
                {
                  OR: [{ priority: { equals: 'high' } }, { NOT: { isComplete: { equals: true } } }],
                },
              ],
            },
          },
        },
      } as ActionMeta,
    ] satisfies ActionMeta[]

    expect(getQueriedFieldKeysWithActions(['title'], actions, 'listView')).toEqual([
      'title',
      'status',
      'priority',
      'isComplete',
    ])
  })

  test('collects field dependencies from sibling AND, OR, NOT, and field predicates', () => {
    const actions = [
      {
        key: 'publish',
        graphql: { fields: [], names: { one: 'publishPost', many: 'publishPosts' } },
        label: 'Publish',
        icon: null,
        messages: {
          promptTitle: '',
          promptTitleMany: '',
          prompt: '',
          promptMany: '',
          promptConfirmLabel: '',
          promptConfirmLabelMany: '',
          fail: '',
          failMany: '',
          success: '',
          successMany: '',
        },
        itemView: {
          actionMode: 'enabled',
          navigation: 'follow',
          hidePrompt: false,
          hideToast: false,
        },
        listView: {
          actionMode: {
            disabled: {
              status: { equals: 'draft' },
              AND: [{ author: { equals: 'emma' } }],
              OR: [{ priority: { equals: 'high' } }, { featured: { equals: true } }],
              NOT: { archived: { equals: true } },
            },
          },
        },
      } as ActionMeta,
    ] satisfies ActionMeta[]

    expect(getQueriedFieldKeysWithActions(['title'], actions, 'listView')).toEqual([
      'title',
      'author',
      'priority',
      'featured',
      'archived',
      'status',
    ])
  })
})
