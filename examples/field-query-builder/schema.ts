import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { queryBuilder } from '@keystone-6/fields-query-builder'
import { allowAll } from '@keystone-6/core/access'
import common from './common'

import type { Lists } from '.keystone/types'

export const lists = {
  Report: list({
    access: allowAll,
    fields: {
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
      query: queryBuilder({
        fields: {
          primaryNumber: {
            label: 'Primary Number',
            type: 'text',
          },
          streetPredirection: {
            label: 'Pre-Direction',
            type: 'select',
            valueSources: ['value'],
            fieldSettings: {
              listValues: common.cardinalDirections,
            },
          },
          streetName: {
            label: 'Street Name',
            type: 'text',
          },
          streetSuffix: {
            label: 'Street Suffix',
            type: 'select',
            valueSources: ['value'],
            fieldSettings: {
              listValues: common.streetSuffixes,
            },
          },
          streetPostdirection: {
            label: 'Post-Direction',
            type: 'select',
            valueSources: ['value'],
            fieldSettings: {
              listValues: common.cardinalDirections,
            },
          },
          secondaryDesignator: {
            label: 'Secondary Designator',
            type: 'text',
          },
          secondaryNumber: {
            label: 'Secondary Number',
            type: 'text',
          },
          city: {
            label: 'City',
            type: 'text',
          },
          state: {
            label: 'State',
            type: 'select',
            valueSources: ['value'],
            fieldSettings: {
              listValues: common.states,
            },
          },
          zipCode: {
            label: 'Zip Code',
            type: 'text',
          },
          plus4Code: {
            label: '+4 Code',
            type: 'text',
          },
        },
        ui: {
          style: "antd"
        }
      })
    },
  }),
} satisfies Lists
