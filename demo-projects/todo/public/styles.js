const brightness = {
  default: '60%',
  light: '95%',
  dark: '14%',
};

const tint = (opacity = 1, theme = 'default') => `hsla(261, 84%, ${brightness[theme]}, ${opacity})`;

const styles = {
  mainHeading: {
    textTransform: 'uppercase',
    fontWeight: 900,
    marginTop: 0,
  },

  app: {
    padding: 50,
    maxWidth: 450,
    color: tint(1, 'dark'),
    fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
  },
  formInput: {
    color: tint(1, 'dark'),
    padding: '12px 16px',
    fontSize: '1.25em',
    width: '100%',
    borderRadius: 6,
    border: 0,
    background: tint(0.3),
  },

  listItem: {
    padding: '32px 16px',
    fontSize: '1.25em',
    fontWeight: 600,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: `1px solid ${tint(0.2)}`,
  },

  deleteIcon: { width: 20, height: 20, fill: tint() },

  deleteButton: {
    background: 0,
    border: 0,
    padding: 0,
    cursor: 'pointer',
  },
};

export default styles;
