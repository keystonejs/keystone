import { resolveView } from '../resolve-view';
import fetch from 'node-fetch';
import crypto from 'crypto';

const VALID_URL = /^https?:\/\//i;
const IS_MD5 = /[a-f0-9]{32}/i;

const previewComponent = resolveView('iframely/views/preview');

export class IframelyOEmbedAdapter {
  constructor({ apiKey, parameters } = {}) {
    if (!apiKey) {
      throw new Error('Must provide an apiKey to IFramely OEmbed Adapter');
    }

    // We send the MD5 version of the apiKey
    // https://iframely.com/docs/allow-origins
    if (IS_MD5.test(apiKey)) {
      this.apiKey = apiKey;
    } else {
      this.apiKey = crypto.createHash('md5').update(apiKey).digest('hex');
    }

    this.requestParams = parameters || {};
  }

  /**
   * @param parameters{Object} An object of parameters to be sent to the IFramely
   * service. See more: https://iframely.com/docs/parameters
   * @param parameters.url{String} (required) The url to fetch oEmbed data for.
   */
  fetch(parameters = {}) {
    // IFramely suggests sending only http(s) URLs:
    // https://iframely.com/docs/providers
    if (!VALID_URL.test(parameters.url)) {
      return Promise.reject(
        new Error(
          'url passed to IFramely OEmbed Adapter must start with either http:// or https://'
        )
      );
    }

    const params = Object.entries({
      // https://iframely.com/docs/iframes
      // for React apps.
      // https://iframely.com/docs/reactjs
      // Allow overwriting most parameters
      iframe: '1',
      omit_script: '1',
      ...this.requestParams,
      ...parameters,
      // We're using the MD5 hashed key:
      // https://iframely.com/docs/allow-origins
      key: this.apiKey,
    }).map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

    return fetch(`https://iframe.ly/api/oembed?${params.join('&')}`).then(res => res.json());
  }

  getAdminViews() {
    return [previewComponent];
  }

  getViewOptions() {
    return {
      previewComponent,
      // NOTE: This is the md5'd API key from the constructor, which is ok to
      // put on the client according to the docs
      clientApiKey: this.apiKey,
    };
  }
}
