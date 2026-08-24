const navigationBlockersKey = Symbol.for('keystone.navigationBlockers')
const globalWithNavigationBlockers = globalThis as typeof globalThis & {
  [navigationBlockersKey]?: Set<() => boolean>
}
const navigationBlockers = (globalWithNavigationBlockers[navigationBlockersKey] ??= new Set())

export function addNavigationBlocker(blocker: () => boolean) {
  navigationBlockers.add(blocker)
  return () => navigationBlockers.delete(blocker)
}

export function hasUnsavedChanges() {
  return [...navigationBlockers].some(shouldPreventNavigation => shouldPreventNavigation())
}

export function checkForPreventedNavigation() {
  return (
    hasUnsavedChanges() &&
    !window.confirm('There are unsaved changes, are you sure you want to exit?')
  )
}
