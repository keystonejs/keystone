import FieldController from '../../File/views/Controller';
import queryFragment from '../query-fragment.js';

export default class FileController extends FieldController {
  getQueryFragment = () => `
    ${this.path} {
      ${queryFragment}
    }
  `;

  deserialize = data => {
    const oEmbed = data[this.path];
    if (!oEmbed || !oEmbed.originalUrl) {
      // Nothing set, so force to null
      return null;
    }

    return {
      originalUrl: oEmbed.originalUrl,
      preview: {
        // Ensure the .html property is always set
        html: '',
        // Use all the properties of the exist oembed data set
        ...oEmbed,
        // Attempt to derive a useful title
        title:
          oEmbed.title ||
          (oEmbed.author && oEmbed.author.name) ||
          (oEmbed.provider && oEmbed.provider.name) ||
          '',
      },
    };
  };

  serialize = data => {
    const { path } = this;
    // We only send the URL itself to the mutation
    return (data[path] && data[path].originalUrl) || null;
  };
}
