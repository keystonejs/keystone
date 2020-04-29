module.exports = {
  parseDefaultValues: (defaultValue, options) => {
    if (defaultValue && options && defaultValue.length === options.length) {
      // Merge the options and defaultValue values into an object
      // { option1: false, option2: false }
      defaultValue = options.reduce((prev, next, i) => ({ ...prev, [next]: defaultValue[i] }), {});
    } else {
      // { option1: null, option2: null }
      defaultValue = options.reduce((prev, next) => ({ ...prev, [next]: null }), {});
    }
    return defaultValue;
  },
};
