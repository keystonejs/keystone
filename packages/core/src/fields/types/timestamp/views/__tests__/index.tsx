import { controller, } from '../index'

const STUBCONFIG = {
  listKey: 'timestamp',
  path: './timestamp',
  label: 'foo',
  customViews: {},
  description: null,
}

describe('controller', () => {
  describe('validate', () => {
    it('null is OK if not required', () => {
      const { validate } = controller({
        ...STUBCONFIG,
        fieldMeta: {
          defaultValue: null,
          isRequired: false,
          updatedAt: false
        }
      })
      expect(
        validate!({
          kind: 'create',
          value: null
        })
      ).toBe(true)
    })
    it('isRequired enforces required (null)', () => {
      const { validate } = controller({
        ...STUBCONFIG,
        fieldMeta: {
          defaultValue: null,
          isRequired: true,
          updatedAt: false
        }
      })
      expect(
        validate!({
          kind: 'create',
          value: null
        })
      ).toBe('foo is required')
    })
    it('isRequired enforces required (value)', () => {
      const { validate } = controller({
        ...STUBCONFIG,
        fieldMeta: {
          defaultValue: null,
          isRequired: true,
          updatedAt: false
        }
      })
      expect(
        validate!({
          kind: 'create',
          value: new Date().toJSON()
        })
      ).toBe(true)
    })
  })
})
