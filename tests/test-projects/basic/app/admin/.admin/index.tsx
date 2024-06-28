/* eslint-disable */
import * as view0 from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view'
import * as view1 from '@keystone-6/core/fields/types/text/views'
import * as view2 from '@keystone-6/core/fields/types/select/views'
import * as view3 from '@keystone-6/core/fields/types/checkbox/views'
import * as view4 from '@keystone-6/core/fields/types/relationship/views'
import * as view5 from '@keystone-6/core/fields/types/timestamp/views'

const adminConfig = {}

export const config = {
  lazyMetadataQuery: {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"keystone","loc":{"start":22,"end":30}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMeta","loc":{"start":39,"end":48}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"config","loc":{"start":59,"end":65}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPath","loc":{"start":78,"end":87}},"arguments":[],"directives":[],"loc":{"start":78,"end":87}}],"loc":{"start":66,"end":97}},"loc":{"start":59,"end":97}},{"kind":"Field","name":{"kind":"Name","value":"lists","loc":{"start":106,"end":111}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key","loc":{"start":124,"end":127}},"arguments":[],"directives":[],"loc":{"start":124,"end":127}},{"kind":"Field","name":{"kind":"Name","value":"isHidden","loc":{"start":138,"end":146}},"arguments":[],"directives":[],"loc":{"start":138,"end":146}},{"kind":"Field","name":{"kind":"Name","value":"fields","loc":{"start":157,"end":163}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path","loc":{"start":178,"end":182}},"arguments":[],"directives":[],"loc":{"start":178,"end":182}},{"kind":"Field","name":{"kind":"Name","value":"createView","loc":{"start":195,"end":205}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldMode","loc":{"start":222,"end":231}},"arguments":[],"directives":[],"loc":{"start":222,"end":231}}],"loc":{"start":206,"end":245}},"loc":{"start":195,"end":245}}],"loc":{"start":164,"end":257}},"loc":{"start":157,"end":257}}],"loc":{"start":112,"end":267}},"loc":{"start":106,"end":267}}],"loc":{"start":49,"end":275}},"loc":{"start":39,"end":275}}],"loc":{"start":31,"end":281}},"loc":{"start":22,"end":281}}]}}]},
  fieldViews: [view0,view1,view2,view3,view4,view5],
  adminMetaHash: 'c4s9h8',
  adminConfig,
  apiPath: '/api/graphql',
  listsKeyByPath: {"tasks":"Task","people":"Person","secret-plans":"SecretPlan"},
};
