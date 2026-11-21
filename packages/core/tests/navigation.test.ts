import { afterEach, expect, test, vi } from 'vitest'
import { createNavigationBlockers } from '../src/admin-ui/utils/navigation.ts'

afterEach(() => vi.unstubAllGlobals())

test('listens for beforeunload while at least one form has unsaved changes', () => {
  const browser = new EventTarget()
  const listen = vi.spyOn(browser, 'addEventListener')
  const unlisten = vi.spyOn(browser, 'removeEventListener')
  vi.stubGlobal('window', browser)

  const blockers = createNavigationBlockers()
  const unload = () => browser.dispatchEvent(new Event('beforeunload', { cancelable: true }))

  expect(listen).not.toHaveBeenCalled()
  expect(unload()).toBe(true)

  const removeFirst = blockers.add()
  const removeSecond = blockers.add()
  expect(listen).toHaveBeenCalledExactlyOnceWith('beforeunload', expect.any(Function))
  expect(unload()).toBe(false)

  removeFirst()
  expect(unlisten).not.toHaveBeenCalled()
  expect(unload()).toBe(false)

  removeSecond()
  removeSecond()
  expect(unlisten).toHaveBeenCalledExactlyOnceWith('beforeunload', listen.mock.calls[0][1])
  expect(unload()).toBe(true)
})
