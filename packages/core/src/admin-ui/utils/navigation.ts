export type NavigationBlockers = {
  /** Registers unsaved changes and returns a cleanup function. */
  add: () => () => void
  /** Whether any registered blocker currently has unsaved changes. */
  hasUnsavedChanges: () => boolean
  /** Asks the user to confirm leaving if there are unsaved changes; true means cancel navigation. */
  shouldBlockNavigation: () => boolean
}

export function createNavigationBlockers(): NavigationBlockers {
  const blockers = new Set<() => void>()

  function hasUnsavedChanges() {
    return blockers.size !== 0
  }

  function onBeforeUnload(event: BeforeUnloadEvent) {
    event.preventDefault()
  }

  return {
    add() {
      if (!hasUnsavedChanges()) window.addEventListener('beforeunload', onBeforeUnload)

      function remove() {
        if (blockers.delete(remove) && !hasUnsavedChanges()) {
          window.removeEventListener('beforeunload', onBeforeUnload)
        }
      }

      blockers.add(remove)
      return remove
    },
    hasUnsavedChanges,
    shouldBlockNavigation() {
      return (
        hasUnsavedChanges() &&
        !window.confirm('There are unsaved changes, are you sure you want to exit?')
      )
    },
  }
}
