const { IframelyOEmbedAdapter } = require('./iframely');

describe('iframely OEmbed adapter', () => {
  it('should throw when no apiKey provided', () => {
    expect(() => {
      new IframelyOEmbedAdapter();
    }).toThrow(/Must provide an apiKey/);
  });

  it('doesnt throw when an apiKey provided', () => {
    expect(() => {
      new IframelyOEmbedAdapter({ apiKey: 'foo' });
    }).not.toThrow();
  });

  it('throws when invalid URL passed to .fetch()', () => {
    const adapter = new IframelyOEmbedAdapter({ apiKey: 'foo' });
    expect(adapter.fetch({ url: 'foo' })).rejects.toThrow(
      /must start with either http:\/\/ or https:\/\//
    );
  });
});
