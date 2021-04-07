const { keyToLabel } = require('../utils');

describe('keyToLabel()', () => {
  it('should split keys at capitals', () => {
    expect(keyToLabel('helloDarknessMyOldFriend')).toBe('Hello Darkness My Old Friend');
  });
  it('should consider adjacent capitals as the same word', () => {
    expect(keyToLabel('someHTML')).toBe('Some HTML');
  });
  it('should split snake_cased keys', () => {
    expect(keyToLabel('snake_case')).toBe('Snake Case');
  });
  it('should split kebab-cased keys', () => {
    expect(keyToLabel('kebab-case')).toBe('Kebab Case');
  });
  it('should uppercase Id', () => {
    expect(keyToLabel('someId')).toBe('Some ID');
  });
  it('should not fuck up', () => {
    expect(keyToLabel('SomeHIDDENId')).toBe('Some HIDDENI D');
  });
  it('should uppercase the first letter, if the key is multi word', () => {
    expect(keyToLabel('multiple words here')).toBe('Multiple Words Here');
  });

  it('should leave the key alone if its multi word and sentence cased', () => {
    expect(keyToLabel('Multiple Words Here')).toBe('Multiple Words Here');
  });
});
