import { OEmbed } from './Implementation';

const path = 'foo';

const newOEmbed = ({ config = {} } = {}) => {
  return new OEmbed(
    path,
    { access: true, ...config },
    { listAdapter: { newFieldAdapter: () => {} }, schemaNames: ['public'] }
  );
};

describe('iframely OEmbed adapter', () => {
  it('should throw when no adapter provided', () => {
    expect(() => {
      newOEmbed();
    }).toThrow(/An OEmbed Adapter must be supplied/);
  });

  it('should throw when adapter is missing a fetch() method', () => {
    expect(() => {
      newOEmbed({ config: { adapter: {} } });
    }).toThrow(/An invalid OEmbed Adapter/);
  });

  describe('resolveInput()', () => {
    it('coerces null string to null', () => {
      const oembed = newOEmbed({ config: { adapter: { fetch: () => {} } } });
      expect(oembed.resolveInput({ resolvedData: { [path]: null } })).resolves.toEqual(null);
    });

    it('coerces empty string to null', () => {
      const oembed = newOEmbed({ config: { adapter: { fetch: () => {} } } });
      expect(oembed.resolveInput({ resolvedData: { [path]: '' } })).resolves.toEqual(null);
    });

    it('coerces spaces-only string to null', () => {
      const oembed = newOEmbed({ config: { adapter: { fetch: () => {} } } });
      expect(oembed.resolveInput({ resolvedData: { [path]: '  ' } })).resolves.toEqual(null);
    });

    it('calls the adapters fetch with the url', async () => {
      const url = 'http://example.com?ck03fftlg0000y5pf13wy5ijm';
      const fetch = jest.fn(() => ({}));
      const oembed = newOEmbed({ config: { adapter: { fetch } } });
      await oembed.resolveInput({ resolvedData: { [path]: url } });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expect.objectContaining({ url }));
    });
  });
});
