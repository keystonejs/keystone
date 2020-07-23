import { IframelyOEmbedAdapter as Adapter } from '@keystonejs/fields-oembed';

export class IframelyOEmbedAdapter extends Adapter {
  constructor() {
    console.log(
      'IframelyOEmbedAdapter has moved to "@keystonejs/fields-oembed". Please update imports, @keystonejs/oembed-adapters will be removed in a future update.'
    );
    super(...arguments);
  }
}
