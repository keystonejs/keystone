import isEqual from 'lodash.isequal';

export default class FieldController {
  constructor(config, list, adminMeta, views) {
    this.config = config;
    this.label = config.label;
    this.path = config.path;
    this.type = config.type;
    this.list = list;
    this.adminMeta = adminMeta;
    this.views = views;
  }

  // TODO: This is a bad default; we should (somehow?) inspect the fields provided
  // by the implementations gqlOutputFields
  getQueryFragment = () => this.path;

  // Prepare data for this field to be sent to the server as part of a GraphQL
  // mutation. It must be serialized into the format expected within the field's
  // Implementation#gqlCreateInputFields()/Implementation#gqlUpdateInputFields()
  // NOTE: This function is run synchronously
  serialize = data => data[this.path] || null;

  /**
   * Tell the AdminUI there has been an error with this field
   *
   * @callback addFieldWarningOrError
   * @param {String} message This string will be displayed to the user in the
   * Admin UI.
   * @param {Object} data Any arbitrary data you wish to attach to the error. It
   * will be available as part of the `errors` prop on the `Field` view.
   */

  /**
   * Perform client-side data validations before performing a
   * mutation. Any errors or warnings raised will abort the mutation and
   * re-render the `Field` view with a new `error` prop.
   *
   * This method is only called on fields whos `.hasChanged()` property returns
   * truthy.
   *
   * If only warnings are raised, the Admin UI will allow the user to confirm
   * they wish to continue anyway. If they continue, and no values have changed
   * since the last validation, validateInput will be called again, however any
   * warnings raised will be ignored and the mutation will proceed as normal.
   * This method is called after `serialize`.
   *
   * @param {Object} options
   * @param {Object} options.resolvedData The data object that would be sent to
   * the server. This data has previously been fed through .serialize()
   * @param {Object} options.originalInput The data as set by the `Field`
   * component. This data has _not_ been previously fed through .serialize().
   * @param {addFieldWarningOrError} options.addFieldValidationError
   * @param {addFieldWarningOrError} options.addFieldValidationWarning
   * @return undefined
   */
  validateInput = () => {};

  // When receiving data from the server, it needs to be processed into a
  // format ready for display. The format received will be the same as specified
  // in the field's Implementation#gqlOutputFields()
  // NOTE: This function is run synchronously
  deserialize = data => data[this.path];

  /**
   * @description Before sending data to the GraphQL server, this check is run to exclude
   * possibly expensive data from being sent. It also prevents issues where "no
   * change" can be destructive (eg; uploading a file - we no longer have the
   * file, so cannot update it and may accidentally send `null`).
   * @param initialData {Object} An object containing the most recently received
   * data from the server, keyed by the field's path. The values have already
   * been passed to this.serialize() for you.
   * @param initialData {Object} An object containing all of the data for the
   * current item, keyed by the field's path. The values have already been
   * passed to this.serialize() for you
   * @return boolean
   */
  hasChanged = (initialData, currentData) =>
    !isEqual(initialData[this.path], currentData[this.path]);

  // eslint-disable-next-line no-unused-vars
  getDefaultValue = data => this.config.defaultValue || '';

  initCellView = () => {
    const { Cell } = this.views;
    if (!Cell) {
      return;
    }
    this.adminMeta.readViews([Cell]);
  };

  initFieldView = () => {
    const { Field } = this.views;
    if (!Field) {
      return;
    }
    this.adminMeta.readViews([Field]);
  };

  initFilterView = () => {
    const { Filter } = this.views;
    if (!Filter) {
      return;
    }
    this.adminMeta.readViews([Filter]);
  };
}
