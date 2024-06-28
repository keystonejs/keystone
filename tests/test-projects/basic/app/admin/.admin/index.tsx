/* eslint-disable */
import * as view0 from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view'
import * as view1 from '@keystone-6/core/fields/types/text/views'
import * as view2 from '@keystone-6/core/fields/types/select/views'
import * as view3 from '@keystone-6/core/fields/types/checkbox/views'
import * as view4 from '@keystone-6/core/fields/types/relationship/views'
import * as view5 from '@keystone-6/core/fields/types/timestamp/views'

const adminConfig = {}

export const config = {
  lazyMetadataQuery: {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"keystone","loc":{"start":22,"end":30}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMeta","loc":{"start":39,"end":48}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routePrefix","loc":{"start":59,"end":70}},"arguments":[],"directives":[],"loc":{"start":59,"end":70}},{"kind":"Field","name":{"kind":"Name","value":"lists","loc":{"start":79,"end":84}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key","loc":{"start":97,"end":100}},"arguments":[],"directives":[],"loc":{"start":97,"end":100}},{"kind":"Field","name":{"kind":"Name","value":"isHidden","loc":{"start":111,"end":119}},"arguments":[],"directives":[],"loc":{"start":111,"end":119}},{"kind":"Field","name":{"kind":"Name","value":"fields","loc":{"start":130,"end":136}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path","loc":{"start":151,"end":155}},"arguments":[],"directives":[],"loc":{"start":151,"end":155}},{"kind":"Field","name":{"kind":"Name","value":"createView","loc":{"start":168,"end":178}},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldMode","loc":{"start":195,"end":204}},"arguments":[],"directives":[],"loc":{"start":195,"end":204}}],"loc":{"start":179,"end":218}},"loc":{"start":168,"end":218}}],"loc":{"start":137,"end":230}},"loc":{"start":130,"end":230}}],"loc":{"start":85,"end":240}},"loc":{"start":79,"end":240}}],"loc":{"start":49,"end":248}},"loc":{"start":39,"end":248}}],"loc":{"start":31,"end":254}},"loc":{"start":22,"end":254}}]}}]},
  fieldViews: [view0,view1,view2,view3,view4,view5],
  adminMetaHash: '1vq0nzc',
  adminConfig,
  apiPath: '/api/graphql',
  listsKeyByPath: {"tasks":"Task","people":"Person","secret-plans":"SecretPlan"},
};
