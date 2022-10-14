// check localstorage and system preference to set default theme
if (typeof window !== 'undefined') {
    const isSystemColorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const localStorageTheme = localStorage.theme;
    if (!localStorageTheme && isSystemColorSchemeDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (localStorageTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      // we already server render light theme
      // so this is just ensuring that
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }