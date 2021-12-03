# @keystone-next/fields-document

## 1.0.1

### Patch Changes

- [#7030](https://github.com/keystonejs/keystone/pull/7030) [`26213c6f3`](https://github.com/keystonejs/keystone/commit/26213c6f3c49dd47392c0e31389339aae3f10806) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed the input in the link dialog not being focusable

## 1.0.0

### Major Changes

- [#7028](https://github.com/keystonejs/keystone/pull/7028) [`3c7a581c1`](https://github.com/keystonejs/keystone/commit/3c7a581c1e53ae49c9f74509de3927ebf2703bde) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Released Keystone 6

* [#7005](https://github.com/keystonejs/keystone/pull/7005) [`f4554980f`](https://github.com/keystonejs/keystone/commit/f4554980f6243a6545eee6c887d946ff25cd90e3) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - - The following types have been renamed:
  - `BaseGeneratedListTypes` → `BaseListTypeInfo`
  - `ItemRootValue` → `BaseItem`
  - `ListInfo` → `ListGraphQLTypes`
  - `TypesForList` → `GraphQLTypesForList`
  - `FieldTypeFunc` now has a required type parameter which must satisfy `BaseListTypeInfo`
  - The following types now have a required type parameter which must satisfy `BaseKeystoneTypeInfo`:
    - `ServerConfig`
    - `CreateRequestContext`
    - `AdminUIConfig`
    - `DatabaseConfig`
    - `ListOperationAccessControl`
    - `MaybeSessionFunction`
    - `MaybeItemFunction`
  - `GraphQLResolver` and `GraphQLSchemaExtension` now have a required type parameter which must satisfy `KeystoneContext`
  - `KeystoneGraphQLAPI` no longer has a type parameter
  - The first parameter to the resolver in a `virtual` field will be typed as the item type if the list is typed with `Keystone.Lists` or `Keystone.Lists.ListKey`, otherwise it will be typed as `unknown`
  - The `item`/`originalItem` arguments in hooks/access control will now receive the `Item` type if the list is typed with `Keystone.Lists` or `Keystone.Lists.ListKey`, otherwise it will be typed as `BaseItem`
  - `args` has been removed from `BaseListTypeInfo`
  - `inputs.orderBy` and `all` has been added to `BaseListTypeInfo`
  - In `.keystone/types`:
    - `ListKeyListTypeInfo` has been moved to `Lists.ListKey.TypeInfo`
    - `KeystoneContext` has been renamed to `Context`

### Patch Changes

- Updated dependencies [[`7dddbe0fd`](https://github.com/keystonejs/keystone/commit/7dddbe0fd5b42a2596ba4dc0bbe1813cb54571c7), [`fb7844ab5`](https://github.com/keystonejs/keystone/commit/fb7844ab50c1d4a6d14b2ad46a568665f6661921), [`3c7a581c1`](https://github.com/keystonejs/keystone/commit/3c7a581c1e53ae49c9f74509de3927ebf2703bde), [`f4554980f`](https://github.com/keystonejs/keystone/commit/f4554980f6243a6545eee6c887d946ff25cd90e3)]:
  - @keystone-6/core@1.0.0
  - @keystone-6/document-renderer@1.0.0

## 14.0.0

### Major Changes

- [#6957](https://github.com/keystonejs/keystone/pull/6957) [`de8cf44e7`](https://github.com/keystonejs/keystone/commit/de8cf44e7b328ab98e1466d7191d9ee65a57b02a) Thanks [@bladey](https://github.com/bladey)! - Update Node engines to support current Node LTS versions, currently versions 14 and 16.

### Patch Changes

- [#6944](https://github.com/keystonejs/keystone/pull/6944) [`2be0e18a1`](https://github.com/keystonejs/keystone/commit/2be0e18a142c85072df1f07af11dae49e4eb8324) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed clear button in inline relationships

- Updated dependencies [[`f2b41df9f`](https://github.com/keystonejs/keystone/commit/f2b41df9f77cf340e5e138cf60bacd6aec8e4548), [`04c54a4eb`](https://github.com/keystonejs/keystone/commit/04c54a4eb4aa6076cf87d441060eaa2091bc903b), [`748538649`](https://github.com/keystonejs/keystone/commit/748538649645d3b0ef32b0baba8fa310f2a493fe), [`4e96c23bb`](https://github.com/keystonejs/keystone/commit/4e96c23bb6c3a134f1324ec7879adac3abf90132), [`76ec35c97`](https://github.com/keystonejs/keystone/commit/76ec35c97a72dcb023e1b0da5b47e876896b6a03), [`760ae82ac`](https://github.com/keystonejs/keystone/commit/760ae82ac0fac5f73e123e2b36f7ba6320312ca6), [`0a7b75838`](https://github.com/keystonejs/keystone/commit/0a7b7583887e3811c23b0b74f4f97633fd484e08), [`622e57689`](https://github.com/keystonejs/keystone/commit/622e57689cf27dbecba7f64c02f0a3b6499d3218), [`bbedee845`](https://github.com/keystonejs/keystone/commit/bbedee84541d22c91a6816872902f6cce8e6aee3), [`82539faa5`](https://github.com/keystonejs/keystone/commit/82539faa53c495be1f5f470deb9eae9861cd31a0), [`18e3168aa`](https://github.com/keystonejs/keystone/commit/18e3168aae5739f5596c7811cd30c8d1f47ad77a), [`760ae82ac`](https://github.com/keystonejs/keystone/commit/760ae82ac0fac5f73e123e2b36f7ba6320312ca6), [`96fd2e220`](https://github.com/keystonejs/keystone/commit/96fd2e22041de84a042f5a0df2cab75ba0dacc35), [`04c54a4eb`](https://github.com/keystonejs/keystone/commit/04c54a4eb4aa6076cf87d441060eaa2091bc903b), [`82539faa5`](https://github.com/keystonejs/keystone/commit/82539faa53c495be1f5f470deb9eae9861cd31a0), [`de8cf44e7`](https://github.com/keystonejs/keystone/commit/de8cf44e7b328ab98e1466d7191d9ee65a57b02a), [`748538649`](https://github.com/keystonejs/keystone/commit/748538649645d3b0ef32b0baba8fa310f2a493fe), [`7a7450009`](https://github.com/keystonejs/keystone/commit/7a7450009d68f70173a2af55eb3a845ea3799c99)]:
  - @keystone-next/keystone@29.0.0
  - @keystone-next/document-renderer@5.0.0
  - @keystone-ui/fields@6.0.0
  - @keystone-ui/button@6.0.0
  - @keystone-ui/core@4.0.0
  - @keystone-ui/icons@5.0.0
  - @keystone-ui/popover@5.0.0
  - @keystone-ui/tooltip@5.0.0

## 13.0.0

### Minor Changes

- [#6907](https://github.com/keystonejs/keystone/pull/6907) [`990b56291`](https://github.com/keystonejs/keystone/commit/990b56291e677077656b201b935086754c6257f1) Thanks [@JedWatson](https://github.com/JedWatson)! - Added `db.map` option to lists and fields which adds the `@@map` and `@map` Prisma attributes respectively

### Patch Changes

- Updated dependencies [[`70eb86237`](https://github.com/keystonejs/keystone/commit/70eb86237bd3eafd36b0579f66ad3f1e173357b1), [`990b56291`](https://github.com/keystonejs/keystone/commit/990b56291e677077656b201b935086754c6257f1), [`70eb86237`](https://github.com/keystonejs/keystone/commit/70eb86237bd3eafd36b0579f66ad3f1e173357b1), [`b981f4c3e`](https://github.com/keystonejs/keystone/commit/b981f4c3ee135a1184188deb5ed8de22f718080c)]:
  - @keystone-next/keystone@28.0.0
  - @keystone-ui/fields@5.0.2

## 12.0.0

### Minor Changes

- [#6705](https://github.com/keystonejs/keystone/pull/6705) [`fb5b21c03`](https://github.com/keystonejs/keystone/commit/fb5b21c033fcad26745b91e2c73a2e43cc921828) Thanks [@oplik0](https://github.com/oplik0)! - Add short plain-text display to document fields for Cell (list view; resolves #6522) and a rendered document view in CardValue

### Patch Changes

- Updated dependencies [[`f3e8aac31`](https://github.com/keystonejs/keystone/commit/f3e8aac31efb3eb1573eb340e07a25920084a4aa), [`ddabdbd02`](https://github.com/keystonejs/keystone/commit/ddabdbd02230374ff921998f9d21c0ad7d32b226), [`71600965b`](https://github.com/keystonejs/keystone/commit/71600965b963e098ca77ae1261b850b9573c9f22), [`d9e1ba8fa`](https://github.com/keystonejs/keystone/commit/d9e1ba8fa23c0d9e902ef61167913ee92f5657cb), [`71600965b`](https://github.com/keystonejs/keystone/commit/71600965b963e098ca77ae1261b850b9573c9f22), [`5e61e0050`](https://github.com/keystonejs/keystone/commit/5e61e00503715f0f634d97e573926091a52661e6), [`f38772b27`](https://github.com/keystonejs/keystone/commit/f38772b27d3e9d157127dabfa40036462c235a9f), [`30fc08b51`](https://github.com/keystonejs/keystone/commit/30fc08b515e4f8851fd2583a265a813c683bf604), [`f683dcfe3`](https://github.com/keystonejs/keystone/commit/f683dcfe37d013b3d17f1fbad3df335b2f2ee51c), [`c0661b8ee`](https://github.com/keystonejs/keystone/commit/c0661b8ee9e16a1ffdd7fc77c9c56fead0efda36), [`db7f2311b`](https://github.com/keystonejs/keystone/commit/db7f2311bb2ff8e1e70350cd0f087439b8404a8a), [`023bc7a0b`](https://github.com/keystonejs/keystone/commit/023bc7a0b1e6fb0ebdc5055f0243d9dad255a667), [`cbb9df927`](https://github.com/keystonejs/keystone/commit/cbb9df927a0f106aaa35d107961a405b0d08a751), [`d1141ea82`](https://github.com/keystonejs/keystone/commit/d1141ea8235bca4ce88500991c24b962b06ade45), [`cbb9df927`](https://github.com/keystonejs/keystone/commit/cbb9df927a0f106aaa35d107961a405b0d08a751), [`ddabdbd02`](https://github.com/keystonejs/keystone/commit/ddabdbd02230374ff921998f9d21c0ad7d32b226), [`71600965b`](https://github.com/keystonejs/keystone/commit/71600965b963e098ca77ae1261b850b9573c9f22), [`d107a5bec`](https://github.com/keystonejs/keystone/commit/d107a5becdd16245caf208c3979965fa926e484c), [`44cbef543`](https://github.com/keystonejs/keystone/commit/44cbef5435081311acb9e68dd750f1ca289b8221), [`dcf5241d8`](https://github.com/keystonejs/keystone/commit/dcf5241d8e3e62b080842a5d4bfd47a7f2cce5ca)]:
  - @keystone-next/keystone@27.0.0

## 11.0.0

### Patch Changes

- [#6744](https://github.com/keystonejs/keystone/pull/6744) [`0ef1ee3cc`](https://github.com/keystonejs/keystone/commit/0ef1ee3ccd99f0f3e1f955f03d00b1a0f238c7cd) Thanks [@bladey](https://github.com/bladey)! - Renamed branch `master` to `main`.

* [#6754](https://github.com/keystonejs/keystone/pull/6754) [`bed3a560a`](https://github.com/keystonejs/keystone/commit/bed3a560a59d4fe787f3beebd65f8148453aae35) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated dist filenames

* Updated dependencies [[`73544fd19`](https://github.com/keystonejs/keystone/commit/73544fd19b865be9fbf3ea9ae68fae5f039eb13f), [`0ef1ee3cc`](https://github.com/keystonejs/keystone/commit/0ef1ee3ccd99f0f3e1f955f03d00b1a0f238c7cd), [`930b7129f`](https://github.com/keystonejs/keystone/commit/930b7129f37beb396bb8ecc8a8dc9f1b3615a7e0), [`fac96cbd1`](https://github.com/keystonejs/keystone/commit/fac96cbd14febcc01bdffbecd1aceee391f6a20a), [`3d289eb3d`](https://github.com/keystonejs/keystone/commit/3d289eb3d00c3e6a0c26ce962fb0f942a08c400a), [`bed3a560a`](https://github.com/keystonejs/keystone/commit/bed3a560a59d4fe787f3beebd65f8148453aae35), [`930b7129f`](https://github.com/keystonejs/keystone/commit/930b7129f37beb396bb8ecc8a8dc9f1b3615a7e0), [`6e4a0cf56`](https://github.com/keystonejs/keystone/commit/6e4a0cf56ce35b2446db7970763c55446de3db0e), [`d64bd4a7f`](https://github.com/keystonejs/keystone/commit/d64bd4a7f3da87e13e9cac41f0eb9757b771835f), [`abeceaf90`](https://github.com/keystonejs/keystone/commit/abeceaf902c231aabe9cf3a383ecf29c09b8f4dd), [`704f68b38`](https://github.com/keystonejs/keystone/commit/704f68b38f970860137380e21c36e04d2c51a7a4), [`576f341e6`](https://github.com/keystonejs/keystone/commit/576f341e61b31bbcf076ba70002d137c7b7ff9a9)]:
  - @keystone-next/keystone@26.1.0
  - @keystone-ui/button@5.0.2
  - @keystone-ui/core@3.2.1
  - @keystone-ui/fields@5.0.1
  - @keystone-ui/icons@4.0.2
  - @keystone-ui/popover@4.0.5
  - @keystone-ui/tooltip@4.0.3

## 10.0.0

### Major Changes

- [#6689](https://github.com/keystonejs/keystone/pull/6689) [`67492f37d`](https://github.com/keystonejs/keystone/commit/67492f37dd9fbcd94234c15a072e9c826fa7a665) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `graphql` export of `@keystone-next/keystone/types` to `@keystone-next/keystone`

* [#6564](https://github.com/keystonejs/keystone/pull/6564) [`b6c8c3bff`](https://github.com/keystonejs/keystone/commit/b6c8c3bff9d3d98f743c47c015ae27e63db0271e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `document` field is now non-nullable in the database. The field no longer has `defaultValue` or `isRequired` options. The same behaviour can be re-created with the `validateInput` and `resolveInput` hooks respectively. The field will default to `[{ "type": "paragraph", "children": [{ "text": "" }] }]`. The output type has also been renamed to `ListKey_fieldKey_Document`

  If you're using SQLite, Prisma will generate a migration that makes the column non-nullable and sets any rows that have null values to an empty paragraph.

  If you're using PostgreSQL, Prisma will generate a migration but you'll need to modify it if you have nulls in a `document` field. Keystone will say that the migration cannot be executed:

  ```
  ✨ Starting Keystone
  ⭐️ Dev Server Ready on http://localhost:3000
  ✨ Generating GraphQL and Prisma schemas
  ✨ There has been a change to your Keystone schema that requires a migration

  ⚠️ We found changes that cannot be executed:

    • Made the column `content` on table `Post` required, but there are 1 existing NULL values.

  ✔ Name of migration … make_document_field_non_null
  ✨ A migration has been created at migrations/20210915050920_make_document_field_non_null
  Please edit the migration and run keystone-next dev again to apply the migration
  ```

  The generated migration will look like this:

  ```sql
  /*
    Warnings:

    - Made the column `content` on table `Post` required. This step will fail if there are existing NULL values in that column.

  */
  -- AlterTable
  ALTER TABLE "Post" ALTER COLUMN "content" SET NOT NULL,
  ALTER COLUMN "content" SET DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]';
  ```

  To make it set any null values to an empty paragraph in your database, you need to modify it so that it looks like this but with the table and column names replaced.

  ```sql
  ALTER TABLE "Post" ALTER COLUMN "content" SET DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]';
  UPDATE "Post" SET "content" = DEFAULT WHERE "content" IS NULL;
  ALTER TABLE "Post" ALTER COLUMN "content" SET NOT NULL;
  ```

### Patch Changes

- [#6488](https://github.com/keystonejs/keystone/pull/6488) [`bf331141e`](https://github.com/keystonejs/keystone/commit/bf331141edd107e4f58e640b36b587499209c36f) Thanks [@timleslie](https://github.com/timleslie)! - Removed unnecessary try/catch block in relationship data resolver.

* [#6608](https://github.com/keystonejs/keystone/pull/6608) [`e747ef6f3`](https://github.com/keystonejs/keystone/commit/e747ef6f31590799fa332e1f011b160a443fbeb4) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Updated package to accommodate changes to the RelationshipSelect.

* Updated dependencies [[`5c0163e09`](https://github.com/keystonejs/keystone/commit/5c0163e0973e5fee9b1e2c2b1f2834284858a509), [`7f5caff60`](https://github.com/keystonejs/keystone/commit/7f5caff60308112ded832db4703f33eaae00ce24), [`480c875d1`](https://github.com/keystonejs/keystone/commit/480c875d11700f9eb23f403a5bb277aa94c38ce7), [`3ece149e5`](https://github.com/keystonejs/keystone/commit/3ece149e53066661c57c56fdd1467003c5b11c06), [`d0e3c087e`](https://github.com/keystonejs/keystone/commit/d0e3c087e49310774b9538dfa5d2432c00381db0), [`21c5d1aa9`](https://github.com/keystonejs/keystone/commit/21c5d1aa964a19657d4ba7eb913e8ca292bf1714), [`8bbba49c7`](https://github.com/keystonejs/keystone/commit/8bbba49c74fd4b7cf2560613c9cf6bcaddb11a6f), [`42268ee72`](https://github.com/keystonejs/keystone/commit/42268ee72707e94a6197607d24534a438b748649), [`d9e18613a`](https://github.com/keystonejs/keystone/commit/d9e18613a4136f1c1201a197e47d9d4bde292cd2), [`e81947d6c`](https://github.com/keystonejs/keystone/commit/e81947d6ccb0b541387519898fdbbf09274d4c9f), [`5d3fc0b77`](https://github.com/keystonejs/keystone/commit/5d3fc0b77c92efc69d725f943626d8d76a28e799), [`3cfc2a383`](https://github.com/keystonejs/keystone/commit/3cfc2a3839142dd3ccdbf1dd86768257e9acc0dc), [`1da120a38`](https://github.com/keystonejs/keystone/commit/1da120a388a80585e897a06b81b027b7d8011902), [`499c00b44`](https://github.com/keystonejs/keystone/commit/499c00b44b4b378285ed21a385da799b4af0af82), [`eb1a89f3c`](https://github.com/keystonejs/keystone/commit/eb1a89f3c13d4e80516cc372cef3dc505ef864f3), [`4da935870`](https://github.com/keystonejs/keystone/commit/4da935870374414e83900949cc70fce0d4b6de19), [`1faddea9d`](https://github.com/keystonejs/keystone/commit/1faddea9d285c70d2d867958bc5ab2bbfb44dbd6), [`7de13bce3`](https://github.com/keystonejs/keystone/commit/7de13bce32630ee2478a9894e801020c520c64a9), [`271e5d97b`](https://github.com/keystonejs/keystone/commit/271e5d97bc2e4548ce039a568278f9f7569aa41a), [`0218a4215`](https://github.com/keystonejs/keystone/commit/0218a421576fb3ceb38eb5f38223a9ef0af4c4d2), [`6d3798fdb`](https://github.com/keystonejs/keystone/commit/6d3798fdbd0a9f1567821e90b7176cf7dd208fda), [`273ee446a`](https://github.com/keystonejs/keystone/commit/273ee446a6d3e22c4d01c530d33282df362a6f1b), [`14bfa8a9b`](https://github.com/keystonejs/keystone/commit/14bfa8a9b33fae4c5eb3664ca23bb88850df5e50), [`8bbba49c7`](https://github.com/keystonejs/keystone/commit/8bbba49c74fd4b7cf2560613c9cf6bcaddb11a6f), [`a645861a9`](https://github.com/keystonejs/keystone/commit/a645861a9562748cf3e9786e37acea67c4a0cc17), [`581e130cf`](https://github.com/keystonejs/keystone/commit/581e130cf2a833c2b363801a32f4791bc1c7c62c), [`689d8ecaa`](https://github.com/keystonejs/keystone/commit/689d8ecaa9e93eedc80084aafc319a0396efc593), [`144f7f8e4`](https://github.com/keystonejs/keystone/commit/144f7f8e4e13ec547865927cb224fea7165b98b7), [`f963966ab`](https://github.com/keystonejs/keystone/commit/f963966ab138a315a8f18d83ed7a676f7423a51d), [`b76974736`](https://github.com/keystonejs/keystone/commit/b76974736132a71d693b3e325ffa009d395840a4), [`47c8b53ce`](https://github.com/keystonejs/keystone/commit/47c8b53ce44b7ad34ba40501a257a2b679cdee05), [`f963966ab`](https://github.com/keystonejs/keystone/commit/f963966ab138a315a8f18d83ed7a676f7423a51d), [`a95da1d81`](https://github.com/keystonejs/keystone/commit/a95da1d812574fd17d1fa8bc324415da558a9d9d), [`1b0a2f516`](https://github.com/keystonejs/keystone/commit/1b0a2f516d7d9ffce2e470dcd9ea870a3274500b), [`7621d0db7`](https://github.com/keystonejs/keystone/commit/7621d0db75033b68a510d5f6c9b03d9418980e73), [`67492f37d`](https://github.com/keystonejs/keystone/commit/67492f37dd9fbcd94234c15a072e9c826fa7a665), [`002e1d88b`](https://github.com/keystonejs/keystone/commit/002e1d88b0908c2e1215c1181724b2bc1cc57538), [`ca48072b4`](https://github.com/keystonejs/keystone/commit/ca48072b4d137e879e328c93b703a8364562db8a), [`10c61bd44`](https://github.com/keystonejs/keystone/commit/10c61bd44176ffa7d0e446c28fd9f12ed54790f0), [`1659e1fe5`](https://github.com/keystonejs/keystone/commit/1659e1fe5e0f394df058b3a773ea62bf392fa8db), [`3b9732acd`](https://github.com/keystonejs/keystone/commit/3b9732acd8cd597fa9c70128a2e7129ed02e6775), [`c2b124f8e`](https://github.com/keystonejs/keystone/commit/c2b124f8e4b283022ec473d9e5f32f37de639cf0), [`4048991ba`](https://github.com/keystonejs/keystone/commit/4048991ba7db234a694287000beaf2ea052cd24e), [`79e2cc3aa`](https://github.com/keystonejs/keystone/commit/79e2cc3aa79a90358a6ce1281a8ad5f5632ac185), [`1f952fb10`](https://github.com/keystonejs/keystone/commit/1f952fb10710b7fae6a88112310b25a09ab330ea), [`1b0a2f516`](https://github.com/keystonejs/keystone/commit/1b0a2f516d7d9ffce2e470dcd9ea870a3274500b), [`4e485a914`](https://github.com/keystonejs/keystone/commit/4e485a914cfbc6c4b5ef9eeca9157bf654469b2d), [`3ee4542a8`](https://github.com/keystonejs/keystone/commit/3ee4542a884d8135299178950ab47bb82907bcd9), [`e84f8f655`](https://github.com/keystonejs/keystone/commit/e84f8f6550cff4fbca69982e0371d787e67c8915), [`ca48072b4`](https://github.com/keystonejs/keystone/commit/ca48072b4d137e879e328c93b703a8364562db8a), [`e747ef6f3`](https://github.com/keystonejs/keystone/commit/e747ef6f31590799fa332e1f011b160a443fbeb4), [`5e62702ba`](https://github.com/keystonejs/keystone/commit/5e62702ba3934bf8effb5dce65466017dd868610), [`b00596d3f`](https://github.com/keystonejs/keystone/commit/b00596d3f8b64cddc46ec9e5e4e567dd67264253), [`80cd31303`](https://github.com/keystonejs/keystone/commit/80cd313033b339d90b5e640b252a357a4d60fbcd), [`c8aca958b`](https://github.com/keystonejs/keystone/commit/c8aca958b3650f10011370e0c00b01cb681bb212), [`232c512a0`](https://github.com/keystonejs/keystone/commit/232c512a05250cb8a9c26b70969afe4106e2f8ac), [`8631917d1`](https://github.com/keystonejs/keystone/commit/8631917d14778468652abb8eda06802d2469646c), [`b6c8c3bff`](https://github.com/keystonejs/keystone/commit/b6c8c3bff9d3d98f743c47c015ae27e63db0271e), [`bf5874411`](https://github.com/keystonejs/keystone/commit/bf58744118320493325b3b48aadd007e12d5c680), [`398c08529`](https://github.com/keystonejs/keystone/commit/398c085295d992658a9e7e22aae037f55528c258), [`47cee8c95`](https://github.com/keystonejs/keystone/commit/47cee8c952c1134e503bff54e61dcd48c76b5429), [`9f0a4cc1f`](https://github.com/keystonejs/keystone/commit/9f0a4cc1f6d5133e92a0d326e285152d18689173), [`838845298`](https://github.com/keystonejs/keystone/commit/8388452982277b10c65ff89be442464761a680a7), [`11fb46c91`](https://github.com/keystonejs/keystone/commit/11fb46c918e508cc182d5bd22f069b9329edadba)]:
  - @keystone-next/keystone@26.0.0
  - @keystone-ui/popover@4.0.4
  - @keystone-ui/fields@5.0.0

## 9.0.0

### Major Changes

- [#6371](https://github.com/keystonejs/keystone/pull/6371) [`44f2ef60e`](https://github.com/keystonejs/keystone/commit/44f2ef60e29912f3c85b91fc704e09a7d5a15b22) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/types` to `@keystone-next/keystone/types`

* [#6426](https://github.com/keystonejs/keystone/pull/6426) [`8f2786535`](https://github.com/keystonejs/keystone/commit/8f2786535272976678427fd13758e63b2c59d955) Thanks [@timleslie](https://github.com/timleslie)! - Update the Access Control API. This is a breaking change which impacts the security of all Keystone systems.

  See the [Access Control API](https://keystonejs.com/docs/apis/access-control) for a full description of the new API.

### Patch Changes

- [#6367](https://github.com/keystonejs/keystone/pull/6367) [`4f36a81af`](https://github.com/keystonejs/keystone/commit/4f36a81afb03591354acc1d0141eff8fe54ff208) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/admin-ui-utils` to `@keystone-next/keystone/admin-ui/utils`

* [#6414](https://github.com/keystonejs/keystone/pull/6414) [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated usages of `jsx` from `@keystone-ui/core` to explicitly use `/** @jsxRuntime classic */`

- [#6437](https://github.com/keystonejs/keystone/pull/6437) [`af5e59bf4`](https://github.com/keystonejs/keystone/commit/af5e59bf4215aa297495ae603239b1e3510be39b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed `isUnique: true` config in fields to `isIndexed: 'unique'`

* [#6414](https://github.com/keystonejs/keystone/pull/6414) [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed the way the package directory for resolving views is obtained to use `__dirname` rather than `require.resolve('pkg/package.json')` because in Next.js 11 `require.resolve` returns a numeric id instead of the path.

- [#6432](https://github.com/keystonejs/keystone/pull/6432) [`0a189d5d0`](https://github.com/keystonejs/keystone/commit/0a189d5d0e618ee5598e9beaccea0290d2a3f8d9) Thanks [@renovate](https://github.com/apps/renovate)! - Updated `typescript` dependency to `^4.4.2`.

- Updated dependencies [[`2a901a121`](https://github.com/keystonejs/keystone/commit/2a901a1210a0b3de0ccd22ca93e9cbcc8ed0f951), [`3008c5110`](https://github.com/keystonejs/keystone/commit/3008c5110a0ebc524eb3609bd8ba901f664f83d3), [`3904a9cf7`](https://github.com/keystonejs/keystone/commit/3904a9cf73e16ef192faae833f2f39ed05f2d707), [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f), [`2e3f3666b`](https://github.com/keystonejs/keystone/commit/2e3f3666b5340b8eb778104a1d4a3f4d52be6528), [`44f2ef60e`](https://github.com/keystonejs/keystone/commit/44f2ef60e29912f3c85b91fc704e09a7d5a15b22), [`9651aff8e`](https://github.com/keystonejs/keystone/commit/9651aff8eb9a51c0fbda6f51b1be0fedb07571da), [`9c5991f43`](https://github.com/keystonejs/keystone/commit/9c5991f43e8f909e576f6b51fd87aab3bbead504), [`069265b9c`](https://github.com/keystonejs/keystone/commit/069265b9cdd5898f4501535793f56debaa247c1c), [`4f36a81af`](https://github.com/keystonejs/keystone/commit/4f36a81afb03591354acc1d0141eff8fe54ff208), [`c76bfc0a2`](https://github.com/keystonejs/keystone/commit/c76bfc0a2ad5aeffb68b8d2006225f608e855a19), [`bc9088f05`](https://github.com/keystonejs/keystone/commit/bc9088f0574af27be6a068483a789a80f7a46a41), [`ee54522d5`](https://github.com/keystonejs/keystone/commit/ee54522d513a9376c1ed1e472a7ff91657e4e693), [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f), [`bd120c7c2`](https://github.com/keystonejs/keystone/commit/bd120c7c296c9adaaefe9bf93cbb384cc7528715), [`595922b48`](https://github.com/keystonejs/keystone/commit/595922b48c909053fa9d34bb1c42177ad41c72d5), [`069265b9c`](https://github.com/keystonejs/keystone/commit/069265b9cdd5898f4501535793f56debaa247c1c), [`8f2786535`](https://github.com/keystonejs/keystone/commit/8f2786535272976678427fd13758e63b2c59d955), [`b3eefc1c3`](https://github.com/keystonejs/keystone/commit/b3eefc1c336a9a366c39f7aa2cf5251baaf843fd), [`0aa02a333`](https://github.com/keystonejs/keystone/commit/0aa02a333d989c30647cd10e25325d4d2db61be6), [`bf9b5605f`](https://github.com/keystonejs/keystone/commit/bf9b5605fc684975d9e2cad604c8e0d978eac40a), [`3957c0981`](https://github.com/keystonejs/keystone/commit/3957c098131b3b055cb94b07f1ce55ec82640908), [`af5e59bf4`](https://github.com/keystonejs/keystone/commit/af5e59bf4215aa297495ae603239b1e3510be39b), [`cbc5a68aa`](https://github.com/keystonejs/keystone/commit/cbc5a68aa7547ea55d1254ee5c3b1e543cdc78e2), [`32f024738`](https://github.com/keystonejs/keystone/commit/32f0247384ecf3bce5c3ef14ad8d367c9888459f), [`783290796`](https://github.com/keystonejs/keystone/commit/78329079606d74a2eedd63f96a985116bf0b449c), [`0a189d5d0`](https://github.com/keystonejs/keystone/commit/0a189d5d0e618ee5598e9beaccea0290d2a3f8d9), [`944bce1e8`](https://github.com/keystonejs/keystone/commit/944bce1e834be4d0f4c79f35cd53ccbabb92f555), [`e0f935eb2`](https://github.com/keystonejs/keystone/commit/e0f935eb2ef8ac311a43423c6691e56cd27b6bed), [`2324fa027`](https://github.com/keystonejs/keystone/commit/2324fa027a6c2beabef4724c69a9ad05338a0cf3), [`f2311781a`](https://github.com/keystonejs/keystone/commit/f2311781a990c0ccd3302ac8e7aa889138f70e47), [`88b03bd79`](https://github.com/keystonejs/keystone/commit/88b03bd79112c7d8f0d41c592c8bd4bb226f5f71), [`0aa02a333`](https://github.com/keystonejs/keystone/commit/0aa02a333d989c30647cd10e25325d4d2db61be6), [`5ceccd821`](https://github.com/keystonejs/keystone/commit/5ceccd821b513e2abec3eb24278e7c30bdcdf6d6), [`fd744dcaa`](https://github.com/keystonejs/keystone/commit/fd744dcaa513efb2a8ae954bb2d5d1fa7f0723d6), [`489e128fe`](https://github.com/keystonejs/keystone/commit/489e128fe0835968eda0908b199a8867c0e72a5b), [`bb0c6c626`](https://github.com/keystonejs/keystone/commit/bb0c6c62610eda20ae93a6b67185276bdbba3248)]:
  - @keystone-next/keystone@25.0.0
  - @keystone-ui/button@5.0.1
  - @keystone-ui/core@3.2.0
  - @keystone-ui/fields@4.1.3
  - @keystone-ui/icons@4.0.1
  - @keystone-ui/popover@4.0.3
  - @keystone-ui/tooltip@4.0.2

## 8.0.0

### Major Changes

- [#6095](https://github.com/keystonejs/keystone/pull/6095) [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated filters to be nested instead of flattened and add top-level `NOT` operator. See the [Query Filter API docs](https://keystonejs.com/docs/apis/filters) and the upgrade guide for more information.

  ```graphql
  query {
    posts(where: { title: { contains: "Something" } }) {
      title
      content
    }
  }
  ```

### Patch Changes

- [#6250](https://github.com/keystonejs/keystone/pull/6250) [`a92169d04`](https://github.com/keystonejs/keystone/commit/a92169d04e5a1a98deb8e757b8eae3b06fc66450) Thanks [@timleslie](https://github.com/timleslie)! - Updated internal type definitions.

* [#6318](https://github.com/keystonejs/keystone/pull/6318) [`e985aa010`](https://github.com/keystonejs/keystone/commit/e985aa0104d30a779f21ec05d80e6b98ece87dfb) Thanks [@raveling](https://github.com/raveling)! - Updated the document editor's expanded view so that you can click on any of the empty space below the content to focus the editor

- [#6207](https://github.com/keystonejs/keystone/pull/6207) [`69f47bfed`](https://github.com/keystonejs/keystone/commit/69f47bfed1eaa1269cfdc42071268a914bd4aa17) Thanks [@timleslie](https://github.com/timleslie)! - Suppressed error logging during tests.

* [#6197](https://github.com/keystonejs/keystone/pull/6197) [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The generated CRUD queries, and some of the input types, in the GraphQL API have been renamed.

  If you have a list called `Item`, the query for multiple values, `allItems` will be renamed to `items`. The query for a single value, `Item`, will be renamed to `item`.

  Also, the input type used in the `updateItems` mutation has been renamed from `ItemsUpdateInput` to `ItemUpdateArgs`.

* Updated dependencies [[`e9f3c42d5`](https://github.com/keystonejs/keystone/commit/e9f3c42d5b9d42872cecbd18fbe9bf9d7d53ed82), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`1cbcf54cb`](https://github.com/keystonejs/keystone/commit/1cbcf54cb1206461866b582865e3b1a8fc728f18), [`a92169d04`](https://github.com/keystonejs/keystone/commit/a92169d04e5a1a98deb8e757b8eae3b06fc66450), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`b696a9579`](https://github.com/keystonejs/keystone/commit/b696a9579b503db86f42776381e247c4e1a7409f), [`f3014a627`](https://github.com/keystonejs/keystone/commit/f3014a627060c7cd86440a6937da5caecfd023a0), [`092df6678`](https://github.com/keystonejs/keystone/commit/092df6678cea18d639be16ad250ec4ecc9250f5a), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`6da56b80e`](https://github.com/keystonejs/keystone/commit/6da56b80e03c748a621afcca6c1ec2887fef7271), [`4f4f0351a`](https://github.com/keystonejs/keystone/commit/4f4f0351a056dea9d1614aa2a3a4789d66bb402d), [`697efa354`](https://github.com/keystonejs/keystone/commit/697efa354b1066b3d4b6eb757ca704b458f45e93), [`c7e331d90`](https://github.com/keystonejs/keystone/commit/c7e331d90a28b2ed8236100097cb8d34a11fabe2), [`3a7a06b2c`](https://github.com/keystonejs/keystone/commit/3a7a06b2cc6b5ea157d34d925b15494b471899eb), [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f), [`78dac764e`](https://github.com/keystonejs/keystone/commit/78dac764e1860b33f9e2bd8cee6015abeaaa5ec4), [`399561b27`](https://github.com/keystonejs/keystone/commit/399561b2769ddd8f3d3fdf29838f5784404bb053), [`9d361c1c8`](https://github.com/keystonejs/keystone/commit/9d361c1c8625e1390f837b7318b63547d686a63b), [`0dcb1c95b`](https://github.com/keystonejs/keystone/commit/0dcb1c95b5200750cc8649485425f2ae40d023a3), [`94435ffee`](https://github.com/keystonejs/keystone/commit/94435ffee765824091899242e4a2f73c7356b524), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`56044e2a4`](https://github.com/keystonejs/keystone/commit/56044e2a425f4256b66475fd3b1a6342cd6c3bf9), [`f46fd32b7`](https://github.com/keystonejs/keystone/commit/f46fd32b7047dbb5ea2566859f7ecee8db5b0b15), [`874f2c405`](https://github.com/keystonejs/keystone/commit/874f2c4058c9cf006213e84b9ffcf39c5bf144e8), [`8ea4eed55`](https://github.com/keystonejs/keystone/commit/8ea4eed55367aaa213f6b4ffb7473087498e39ae), [`e3fe6498d`](https://github.com/keystonejs/keystone/commit/e3fe6498dc36203d8080dff3c2e0c25f6c98733e), [`1030296d1`](https://github.com/keystonejs/keystone/commit/1030296d1f304dc44246e895089ac1f992e80590), [`3564b342d`](https://github.com/keystonejs/keystone/commit/3564b342d6dc2127ae591d7ac055af9eae90543c), [`8b2d179b2`](https://github.com/keystonejs/keystone/commit/8b2d179b2463d78b082182ca9afa8233109e0ba3), [`e3fefafcc`](https://github.com/keystonejs/keystone/commit/e3fefafcce6f8bf836c9bf0f4d931b8200ba41c7), [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda), [`686c0f1c4`](https://github.com/keystonejs/keystone/commit/686c0f1c4a1feb609e1584aa71738709bbbf984e), [`8187ea019`](https://github.com/keystonejs/keystone/commit/8187ea019a212874f3c602573af3382c6f3bd3b2), [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e), [`f5e64af37`](https://github.com/keystonejs/keystone/commit/f5e64af37df2eb460c89d89fa3c8924fb34970ed)]:
  - @keystone-next/fields@14.0.0
  - @keystone-next/keystone@24.0.0
  - @keystone-next/types@24.0.0
  - @keystone-next/admin-ui-utils@5.0.6

## 7.0.3

### Patch Changes

- [#6180](https://github.com/keystonejs/keystone/pull/6180) [`a11e54d69`](https://github.com/keystonejs/keystone/commit/a11e54d692d3cec4ec2439cbf743b590688fb7d3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed issues with React hooks dependency arrays

- Updated dependencies [[`3f03b8c1f`](https://github.com/keystonejs/keystone/commit/3f03b8c1fa7005b37371e1cc401c3a03334a4f7a), [`ea0712aa2`](https://github.com/keystonejs/keystone/commit/ea0712aa22487325bd898818ea4fbca543c9dcf1), [`93f1e5d30`](https://github.com/keystonejs/keystone/commit/93f1e5d302701c610b6cba74e0c5c86a3ac8aacc), [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523), [`7716315ea`](https://github.com/keystonejs/keystone/commit/7716315ea823dd91d17d54dcbb9155b5445cd956), [`a11e54d69`](https://github.com/keystonejs/keystone/commit/a11e54d692d3cec4ec2439cbf743b590688fb7d3), [`e5f61ad50`](https://github.com/keystonejs/keystone/commit/e5f61ad50133a328fcb32299b838fd9eac574c3f), [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523), [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4), [`2ef6fe82c`](https://github.com/keystonejs/keystone/commit/2ef6fe82cee6df7796935d35d1c12cab29aecc75), [`dd7e811e7`](https://github.com/keystonejs/keystone/commit/dd7e811e7ce084c1e832acefc6ed773af371ac9e), [`587a8d0b0`](https://github.com/keystonejs/keystone/commit/587a8d0b074ccecb239d120275359f72779f306f), [`597edbdd8`](https://github.com/keystonejs/keystone/commit/597edbdd81df80982dd3df3d9d600003ef8a15e9), [`1172e1853`](https://github.com/keystonejs/keystone/commit/1172e18531064df6412c06412e74da3b85740b35), [`fbe698461`](https://github.com/keystonejs/keystone/commit/fbe6984616de7a302db7c2b0082851db89c2e314), [`32e9879db`](https://github.com/keystonejs/keystone/commit/32e9879db9cfee77f067eb8105262df65bca6c06)]:
  - @keystone-next/keystone@23.0.0
  - @keystone-next/types@23.0.0
  - @keystone-ui/tooltip@4.0.1
  - @keystone-next/fields@13.0.0
  - @keystone-next/admin-ui-utils@5.0.5

## 7.0.2

### Patch Changes

- [#6087](https://github.com/keystonejs/keystone/pull/6087) [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951) Thanks [@JedWatson](https://github.com/JedWatson)! - Move source code from the `packages-next` to the `packages` directory.

* [#6040](https://github.com/keystonejs/keystone/pull/6040) [`890e3d0a5`](https://github.com/keystonejs/keystone/commit/890e3d0a500ecc30cc88946ba53438812b11b2a4) Thanks [@timleslie](https://github.com/timleslie)! - Fixed the behaviour of `document(hydrateRelationships: true)` when a related item no longer exists or read access is denied.
  The resolver will now set the relationship data to be `{ id }`, leaving the `label` and `data` properties undefined.
* Updated dependencies [[`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790), [`5f3d407d7`](https://github.com/keystonejs/keystone/commit/5f3d407d79171f04ae877e8eaed9a7f9d5671705), [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951), [`279403cb0`](https://github.com/keystonejs/keystone/commit/279403cb0b4bffb946763c9a7ef71be57478eeb3), [`253df44c2`](https://github.com/keystonejs/keystone/commit/253df44c2f8d6535a6425b2593eaed5380433d57), [`253df44c2`](https://github.com/keystonejs/keystone/commit/253df44c2f8d6535a6425b2593eaed5380433d57), [`f482db633`](https://github.com/keystonejs/keystone/commit/f482db6332e54a1d5cd469e2805b99b544208e83), [`c536b478f`](https://github.com/keystonejs/keystone/commit/c536b478fc89f2d933cddf8533e7d88030540a63)]:
  - @keystone-next/fields@12.0.0
  - @keystone-next/keystone@22.0.0
  - @keystone-next/types@22.0.0
  - @keystone-ui/core@3.1.1
  - @keystone-next/admin-ui-utils@5.0.4

## 7.0.1

### Patch Changes

- Updated dependencies [[`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b), [`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b)]:
  - @keystone-next/keystone@21.0.0
  - @keystone-next/types@21.0.0
  - @keystone-next/fields@11.0.2
  - @keystone-next/admin-ui-utils@5.0.3

## 7.0.0

### Major Changes

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The core of Keystone has been re-implemented to make implementing fields and new features in Keystone easier. While the observable changes for most users should be minimal, there could be breakage. If you implemented a custom field type, you will need to change it to the new API, see fields in the `@keystone-next/fields` package for inspiration on how to do this.

### Patch Changes

- Updated dependencies [[`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4), [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947), [`5227234a0`](https://github.com/keystonejs/keystone/commit/5227234a08edd99cd2795c8d888fbb3022810f54), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`e4c19f808`](https://github.com/keystonejs/keystone/commit/e4c19f8086cc14f7f4a8ef390f1f4e1263004d40), [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`881c9ffb7`](https://github.com/keystonejs/keystone/commit/881c9ffb7c5941e9fb214ed955148d8ea567e65f), [`ef14e77ce`](https://github.com/keystonejs/keystone/commit/ef14e77cebc9420db8c7d29dfe61f02140f4a705), [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`8958704ec`](https://github.com/keystonejs/keystone/commit/8958704ec9819cd27ad1cae251628ad38dad1c79), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7)]:
  - @keystone-next/keystone@20.0.0
  - @keystone-next/fields@11.0.0
  - @keystone-next/types@20.0.0
  - @keystone-ui/fields@4.1.1
  - @keystone-ui/core@3.1.0
  - @keystone-next/admin-ui-utils@5.0.2

## 6.0.1

### Patch Changes

- [#5831](https://github.com/keystonejs/keystone/pull/5831) [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0) Thanks [@timleslie](https://github.com/timleslie)! - Removed reference to the deprecated `context.keystone`.

- Updated dependencies [[`0eadba2ba`](https://github.com/keystonejs/keystone/commit/0eadba2badb13fc6a17f7e525d429494ca953481), [`f52079f0b`](https://github.com/keystonejs/keystone/commit/f52079f0bffc4cf2ab5e26e4c3654127b59d6078), [`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`74bc77854`](https://github.com/keystonejs/keystone/commit/74bc778547623fe4ed3db97ed09384d9dc076372), [`a6a444acd`](https://github.com/keystonejs/keystone/commit/a6a444acd23f2590d9812872441cafb5d088c48e), [`29075e580`](https://github.com/keystonejs/keystone/commit/29075e58074672d90cfca84aba8dcedeecf243ca), [`59421c039`](https://github.com/keystonejs/keystone/commit/59421c0399368e56e46537c1c687daa27f5912d0), [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0), [`319c19bd5`](https://github.com/keystonejs/keystone/commit/319c19bd5f8e8c261a1aefb1997d66b2a136ae28), [`c6cd0a6bd`](https://github.com/keystonejs/keystone/commit/c6cd0a6bdc7ccb000c39fba0da31819e33d9e056), [`195d4fb12`](https://github.com/keystonejs/keystone/commit/195d4fb1218517d7b9a40d3bba1a087d40e6d1d6), [`1fe4753f3`](https://github.com/keystonejs/keystone/commit/1fe4753f3af28aa851e1f90d55937c940be5af1a), [`5b02e8625`](https://github.com/keystonejs/keystone/commit/5b02e8625e18c8e79547d5caf8cacb5014ffee9d), [`76cdb791b`](https://github.com/keystonejs/keystone/commit/76cdb791b1ab36d015e43b87deff52be2ea6b629), [`762f17823`](https://github.com/keystonejs/keystone/commit/762f1782334c9b7174c320182c753c215834ff7f), [`0617c81ea`](https://github.com/keystonejs/keystone/commit/0617c81eacc88e40bdd21bacab285d674b171a4a), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`107eeb037`](https://github.com/keystonejs/keystone/commit/107eeb0374e214b69be3727ca955a9f76e1468bb), [`3a7acc2c5`](https://github.com/keystonejs/keystone/commit/3a7acc2c5114fbcbde994d1f4c6cc0b21c572ec0), [`9de71a9fb`](https://github.com/keystonejs/keystone/commit/9de71a9fb0d3b7f5f05c0d908bebdb818723fd4b), [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394), [`fe5b463ed`](https://github.com/keystonejs/keystone/commit/fe5b463ed07c2a524a3cde554ac07575d31e6712), [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b), [`590bb1fe9`](https://github.com/keystonejs/keystone/commit/590bb1fe9254c2f8feff7e3a0e2e964610116f95), [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0), [`38a177d61`](https://github.com/keystonejs/keystone/commit/38a177d6140874b29d3c09b5852dbfd787d5c429), [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba), [`19a756496`](https://github.com/keystonejs/keystone/commit/19a7564964d9dcdc94ecdda9c0a0e92c539eb309)]:
  - @keystone-next/keystone@19.0.0
  - @keystone-next/fields@10.0.0
  - @keystone-next/types@19.0.0
  - @keystone-next/adapter-prisma-legacy@8.0.0
  - @keystone-ui/fields@4.1.0
  - @keystone-ui/popover@4.0.1
  - @keystone-next/admin-ui-utils@5.0.1

## 6.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

* [#5677](https://github.com/keystonejs/keystone/pull/5677) [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the `@keystone-next/admin-ui` package into `@keystone-next/keystone`.

  If you were directly importing from `@keystone-next/admin-ui` you can now import the same items from `@keystone-next/keystone/admin-ui`.
  If you have `@keystone-next/admin-ui` in your `package.json` you should remove it.

### Patch Changes

- Updated dependencies [[`d40c2a590`](https://github.com/keystonejs/keystone/commit/d40c2a5903f07e5a1e80d116ec4cea00289bbf6a), [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d), [`016ccad82`](https://github.com/keystonejs/keystone/commit/016ccad82ed73898a64310506117c1cbae60a512), [`8da79e71a`](https://github.com/keystonejs/keystone/commit/8da79e71abb005eb755620fb3c8f82a3a2952152), [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab)]:
  - @keystone-next/adapter-prisma-legacy@7.0.0
  - @keystone-ui/button@5.0.0
  - @keystone-ui/core@3.0.0
  - @keystone-ui/fields@4.0.0
  - @keystone-ui/icons@4.0.0
  - @keystone-ui/popover@4.0.0
  - @keystone-ui/tooltip@4.0.0
  - @keystone-next/admin-ui-utils@5.0.0
  - @keystone-next/fields@9.0.0
  - @keystone-next/keystone@18.0.0
  - @keystone-next/types@18.0.0

## 5.0.2

### Patch Changes

- [#5618](https://github.com/keystonejs/keystone/pull/5618) [`7e24b9c2a`](https://github.com/keystonejs/keystone/commit/7e24b9c2ab9313753932a27c45d238a2e9a61e9f) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added logic to ensure the block-menu in the toolbar is hidden when no component blocks or relationships are provided.

- Updated dependencies [[`3aea3b12f`](https://github.com/keystonejs/keystone/commit/3aea3b12fd0047e54671ead796fca15b625ade66), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`b0a72a112`](https://github.com/keystonejs/keystone/commit/b0a72a112dae7857defc8b745e674d55a29be766), [`79a0844b9`](https://github.com/keystonejs/keystone/commit/79a0844b9d5125891e3eaad4dc3999b232cefaa2), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`2b3efc8a8`](https://github.com/keystonejs/keystone/commit/2b3efc8a883e1e5832ed5111a6e0e4d3ee59f162), [`fc9c3d55d`](https://github.com/keystonejs/keystone/commit/fc9c3d55d5a2e6a87bcb9e9ed50a19a503290457), [`400d88257`](https://github.com/keystonejs/keystone/commit/400d88257a3383595cf76c9399848b356dd51a11), [`dbe831976`](https://github.com/keystonejs/keystone/commit/dbe831976eeee876f3722d4b96e1b752b67cb945), [`53225b0ef`](https://github.com/keystonejs/keystone/commit/53225b0efcf33810c1c91a0a4ec3e2369733ab0a), [`79d092afc`](https://github.com/keystonejs/keystone/commit/79d092afca565abe780e84d917299ecb749752f1), [`bb8920843`](https://github.com/keystonejs/keystone/commit/bb8920843a1e0d803b8238bd17e9d65802698685)]:
  - @keystone-next/admin-ui@14.1.2
  - @keystone-next/fields@8.2.0
  - @keystone-ui/core@2.0.3

## 5.0.1

### Patch Changes

- Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee), [`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`dbc62ff7c`](https://github.com/keystonejs/keystone/commit/dbc62ff7c71ca4d4db1fab76f3e0ab729af5b80c), [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6), [`05d4883ee`](https://github.com/keystonejs/keystone/commit/05d4883ee19bcfdfcbff7f80693a3fa85cf81aaa), [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e), [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351)]:
  - @keystone-next/admin-ui@14.1.0
  - @keystone-next/fields@8.0.0
  - @keystone-next/types@17.0.1
  - @keystone-next/adapter-prisma-legacy@6.0.1

## 5.0.0

### Major Changes

- [#5420](https://github.com/keystonejs/keystone/pull/5420) [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2) Thanks [@timleslie](https://github.com/timleslie)! - Updated core fields implementation to expect an internal option `type.adapter` rather than `type.adapters.prisma`.

### Patch Changes

- [#5415](https://github.com/keystonejs/keystone/pull/5415) [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f) Thanks [@timleslie](https://github.com/timleslie)! - Converted internal JavaScript code to TypeScript.

* [#5442](https://github.com/keystonejs/keystone/pull/5442) [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db) Thanks [@timleslie](https://github.com/timleslie)! - Updated type definitions to be more consistent and correct.

- [#5372](https://github.com/keystonejs/keystone/pull/5372) [`43a0f5429`](https://github.com/keystonejs/keystone/commit/43a0f5429028eb9df53e93f19f2dd6fc328cde32) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed heading styles to be more differentiatable from normal text.

* [#5400](https://github.com/keystonejs/keystone/pull/5400) [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the `Implementation` base class from the `fields-legacy` package into the `fields` package.

- [#5371](https://github.com/keystonejs/keystone/pull/5371) [`8eebf9195`](https://github.com/keystonejs/keystone/commit/8eebf9195ac625f6642c76ea145642f075e725fe) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed undo on shortcuts like `->` to `→` undoing the whole shortcut rather than just the replacement

- Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`8ab2c9bb6`](https://github.com/keystonejs/keystone/commit/8ab2c9bb6633c2f85844e658f534582c30a39a57), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85), [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853)]:
  - @keystone-next/admin-ui@14.0.0
  - @keystone-next/types@17.0.0
  - @keystone-next/fields@7.0.0
  - @keystone-next/adapter-prisma-legacy@6.0.0
  - @keystone-ui/button@4.0.0
  - @keystone-ui/fields@3.0.0
  - @keystone-ui/icons@3.0.0
  - @keystone-ui/popover@3.0.0
  - @keystone-ui/tooltip@3.0.0
  - @keystone-next/admin-ui-utils@4.0.0

## 4.0.0

### Major Changes

- [#5273](https://github.com/keystonejs/keystone/pull/5273) [`4fa66ac1f`](https://github.com/keystonejs/keystone/commit/4fa66ac1fc6fd0a43da17dd90797733e8c958785) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for the `knex` and `mongoose` field adapters.

### Patch Changes

- Updated dependencies [[`1261c398b`](https://github.com/keystonejs/keystone/commit/1261c398b94ffef2737226cceaebaed1b3c04c72), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`fda82869c`](https://github.com/keystonejs/keystone/commit/fda82869c376d05fd007bec22d7bde2604db445b), [`4fa66ac1f`](https://github.com/keystonejs/keystone/commit/4fa66ac1fc6fd0a43da17dd90797733e8c958785), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b), [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca), [`4f0abec0b`](https://github.com/keystonejs/keystone/commit/4f0abec0b19c3495c1ae6d7dac49fb46253cf7b3), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`bc21855a7`](https://github.com/keystonejs/keystone/commit/bc21855a7ff6dd4dbc278b3e15c9157de765e6ba), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b)]:
  - @keystone-next/adapter-prisma-legacy@5.0.0
  - @keystone-next/fields-legacy@25.0.0
  - @keystone-next/types@16.0.0
  - @keystone-next/admin-ui@13.0.0
  - @keystone-next/fields@6.0.0
  - @keystone-ui/fields@2.1.0
  - @keystone-next/admin-ui-utils@3.0.3

## 3.2.1

### Patch Changes

- [#5212](https://github.com/keystonejs/keystone/pull/5212) [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21) Thanks [@timleslie](https://github.com/timleslie)! - Moved test fixtures into the new packages.

- Updated dependencies [[`0e01f471d`](https://github.com/keystonejs/keystone/commit/0e01f471dc669e46c88233cb8ce698749ddcf4fa), [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21), [`ca1be4156`](https://github.com/keystonejs/keystone/commit/ca1be415663dd822b3adda1e073bd7a1d4a9b97b), [`da900777a`](https://github.com/keystonejs/keystone/commit/da900777a27264595a68fe1ed0e7a689944eb372), [`4d405390c`](https://github.com/keystonejs/keystone/commit/4d405390c0f8dcc37e6fe4da7ce3866c699088f3), [`34dd809ee`](https://github.com/keystonejs/keystone/commit/34dd809eef2368bba1e50ed613b36c5dac7262d1), [`a8be4c860`](https://github.com/keystonejs/keystone/commit/a8be4c8602bcda63d96fc956ead8568d8c989ffc), [`0e1487385`](https://github.com/keystonejs/keystone/commit/0e1487385c42556c027a6f7bfbc9aa806b3cbd66), [`aa76102c1`](https://github.com/keystonejs/keystone/commit/aa76102c11bdfea02059df66f406a8b1d387c879), [`f448a8b3a`](https://github.com/keystonejs/keystone/commit/f448a8b3a36b295d4ce5ff9ef2fd7aabcdb5dacc)]:
  - @keystone-next/fields@5.4.0
  - @keystone-next/fields-legacy@24.0.0
  - @keystone-next/types@15.0.1
  - @keystone-next/adapter-knex-legacy@13.2.3
  - @keystone-next/adapter-mongoose-legacy@11.1.3
  - @keystone-next/adapter-prisma-legacy@4.0.1

## 3.2.0

### Minor Changes

- [#5173](https://github.com/keystonejs/keystone/pull/5173) [`7debecb86`](https://github.com/keystonejs/keystone/commit/7debecb86ea41eed98da80324482bd1c63781005) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for SQLite with Prisma

### Patch Changes

- Updated dependencies [[`eae55db19`](https://github.com/keystonejs/keystone/commit/eae55db19b656e2bfa7b1e7d7aaf2f57b0a95299)]:
  - @keystone-next/fields-legacy@23.2.0
  - @keystone-next/admin-ui@12.0.1

## 3.1.0

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

### Patch Changes

- [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

* [#5089](https://github.com/keystonejs/keystone/pull/5089) [`a4e34e9eb`](https://github.com/keystonejs/keystone/commit/a4e34e9ebb6f746f54ccd898d0aeb4dc5c5d9271) Thanks [@timleslie](https://github.com/timleslie)! - Updated `slate` dependencies.

* Updated dependencies [[`1eeac4722`](https://github.com/keystonejs/keystone/commit/1eeac4722da174307152dad9b5adf5062e4b6403), [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`17c86e0c3`](https://github.com/keystonejs/keystone/commit/17c86e0c3eda7ba08d1bb8edf5eb8ddc9a819e5a), [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d), [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`ec6f9b601`](https://github.com/keystonejs/keystone/commit/ec6f9b601ea6fdbfb2335a5e81b7ec3f1b0e4d4d), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`2ff93692a`](https://github.com/keystonejs/keystone/commit/2ff93692aaef70474449f30fb249eae8aa33a64a), [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02), [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91), [`543232c3f`](https://github.com/keystonejs/keystone/commit/543232c3f151f2294cf63e0944d1724b7b0ac33e)]:
  - @keystone-next/fields@5.3.0
  - @keystone-next/types@15.0.0
  - @keystone-next/adapter-prisma-legacy@4.0.0
  - @keystone-next/fields-legacy@23.1.0
  - @keystone-ui/fields@2.0.2
  - @keystone-ui/core@2.0.2
  - @keystone-next/admin-ui@12.0.0
  - @keystone-next/admin-ui-utils@3.0.2
  - @keystone-next/adapter-mongoose-legacy@11.1.2
  - @keystone-next/adapter-knex-legacy@13.2.2

## 3.0.1

### Patch Changes

- Updated dependencies [[`c45cbb9b1`](https://github.com/keystonejs/keystone/commit/c45cbb9b14010b3ced7ea012f3502998ba2ec393), [`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1), [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761)]:
  - @keystone-next/fields-legacy@23.0.0
  - @keystone-next/admin-ui@11.0.0
  - @keystone-next/adapter-prisma-legacy@3.3.0
  - @keystone-next/adapter-knex-legacy@13.2.1
  - @keystone-next/adapter-mongoose-legacy@11.1.1
  - @keystone-next/fields@5.2.1

## 3.0.0

### Major Changes

- [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed `NotEditable` component from rendering a div to a span so it can be used for inline elements

### Minor Changes

- [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `fields.multiselect` prop field

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `fields.select` not passing options to the select

- [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed documentation in JSDocs for component blocks API

* [`d53eb872f`](https://github.com/keystonejs/keystone/commit/d53eb872ffb0396fcdcae34c380acf9739c8ca5d) [#4883](https://github.com/keystonejs/keystone/pull/4883) Thanks [@JedWatson](https://github.com/JedWatson)! - Allowed the document field toolbar to wrap on smaller screens

* Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`f32316e6d`](https://github.com/keystonejs/keystone/commit/f32316e6deafdb9001874b08e3f4203250728676), [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a), [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985), [`9a9276eb7`](https://github.com/keystonejs/keystone/commit/9a9276eb7acded979b703b4f3ed8bce781e0718a), [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914), [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d), [`7b84c4066`](https://github.com/keystonejs/keystone/commit/7b84c40661a086b5468cc4d4542dfb696bfc2f93), [`53b8b659f`](https://github.com/keystonejs/keystone/commit/53b8b659ffc7db41e0e0d9ad7393e6a821187340), [`29e787983`](https://github.com/keystonejs/keystone/commit/29e787983bdc26b147d6b5f476e70768bbc5318c), [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f), [`0e265f6c1`](https://github.com/keystonejs/keystone/commit/0e265f6c10eadd37f75e5551b22b50236e830086), [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3), [`45ea93421`](https://github.com/keystonejs/keystone/commit/45ea93421f9a6cf9b7ccbd983e0c9cbd687ff6af), [`6c949dbf2`](https://github.com/keystonejs/keystone/commit/6c949dbf262350e280072d82cd48fdd31ff5ba6d), [`3ca5038a0`](https://github.com/keystonejs/keystone/commit/3ca5038a021105a7452f4e7a4641107caa4ffe3a), [`bea9008f8`](https://github.com/keystonejs/keystone/commit/bea9008f82efea7fcf1cb547f3841915cd4689cc), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`c63e5d75c`](https://github.com/keystonejs/keystone/commit/c63e5d75cd77cf26f8762bda8143d1c1db6d0e3e), [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e), [`f826f15c6`](https://github.com/keystonejs/keystone/commit/f826f15c6e00fcfcef6d9153b261e8977f5117f1), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc)]:
  - @keystone-ui/button@3.0.1
  - @keystone-ui/core@2.0.1
  - @keystone-ui/fields@2.0.1
  - @keystone-ui/icons@2.0.1
  - @keystone-ui/popover@2.0.1
  - @keystone-ui/tooltip@2.0.1
  - @keystone-next/admin-ui@10.0.0
  - @keystone-next/admin-ui-utils@3.0.1
  - @keystone-next/fields@5.1.0
  - @keystone-next/types@14.0.0
  - @keystone-next/adapter-knex-legacy@13.1.0
  - @keystone-next/adapter-mongoose-legacy@11.1.0
  - @keystone-next/adapter-prisma-legacy@3.1.0
  - @keystone-next/fields-legacy@22.0.1

## 2.0.0

### Major Changes

- [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf) [#4622](https://github.com/keystonejs/keystone/pull/4622) Thanks [@renovate](https://github.com/apps/renovate)! - Updated react and react-dom to v17

### Patch Changes

- [`0929fbc4b`](https://github.com/keystonejs/keystone/commit/0929fbc4b7a8ea3511438df26742c9272b2e6b9a) [#4802](https://github.com/keystonejs/keystone/pull/4802) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Stopped unwrapping headings when in the middle of a heading

* [`0929fbc4b`](https://github.com/keystonejs/keystone/commit/0929fbc4b7a8ea3511438df26742c9272b2e6b9a) [#4802](https://github.com/keystonejs/keystone/pull/4802) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated slate to 0.60.3

- [`0929fbc4b`](https://github.com/keystonejs/keystone/commit/0929fbc4b7a8ea3511438df26742c9272b2e6b9a) [#4802](https://github.com/keystonejs/keystone/pull/4802) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed editor so that when the user is at the end of a text node with a mark and a break is inserted, the mark is removed

- Updated dependencies [[`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf), [`208722a42`](https://github.com/keystonejs/keystone/commit/208722a4234434e116846756bab18f7e11674ec8), [`ad75e3d61`](https://github.com/keystonejs/keystone/commit/ad75e3d61c73ba1239fd21b58f175aac01d9f302), [`a0931858e`](https://github.com/keystonejs/keystone/commit/a0931858e499d9504e4e822b850dcf89c3cdac60), [`d8f64887f`](https://github.com/keystonejs/keystone/commit/d8f64887f2aa428ea8ac35d0efa50ce05534f40b), [`45b047ad0`](https://github.com/keystonejs/keystone/commit/45b047ad015fc9d72cf8c2b85529ffe3abbc189e), [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765), [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`954350389`](https://github.com/keystonejs/keystone/commit/9543503894c3e78a9b69a75cbfb3ca6b85ae34e8), [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3), [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystone-next/admin-ui@9.0.0
  - @keystonejs/fields@22.0.0
  - @keystone-next/admin-ui-utils@3.0.0
  - @keystone-next/fields@5.0.0
  - @keystone-ui/button@3.0.0
  - @keystone-ui/core@2.0.0
  - @keystone-ui/fields@2.0.0
  - @keystone-ui/icons@2.0.0
  - @keystone-ui/popover@2.0.0
  - @keystone-ui/tooltip@2.0.0
  - @keystone-next/types@13.0.0
  - @keystonejs/adapter-mongoose@11.0.1
  - @keystonejs/adapter-prisma@3.0.1
  - @keystonejs/adapter-knex@13.0.1

## 1.0.1

### Patch Changes

- Updated dependencies [[`1744c5f05`](https://github.com/keystonejs/keystone/commit/1744c5f05c9a13e680aaa1ed151f23f1d015ed9c), [`d9675553b`](https://github.com/keystonejs/keystone/commit/d9675553b33f39e2c7ada7eb6555d16e9fccb37e), [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652), [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5), [`fb8bcff91`](https://github.com/keystonejs/keystone/commit/fb8bcff91ef487730164c3330e0742ab13d9b3d7), [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33)]:
  - @keystone-next/types@12.0.0
  - @keystone-next/admin-ui@8.0.1
  - @keystone-next/admin-ui-utils@2.0.8
  - @keystone-next/fields@4.1.1

## 1.0.0

### Major Changes

- [`2ed7ee700`](https://github.com/keystonejs/keystone/commit/2ed7ee70047c4c2bb6b855ec51a2fa58e4c7474d) [#4720](https://github.com/keystonejs/keystone/pull/4720) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099), [`680169cad`](https://github.com/keystonejs/keystone/commit/680169cad62dd889ec95961cba9df3b4d012887f), [`858eedb18`](https://github.com/keystonejs/keystone/commit/858eedb18c14ed017b01f588071192cdac355c47), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9)]:
  - @keystonejs/adapter-prisma@3.0.0
  - @keystonejs/fields@21.1.0
  - @keystone-next/types@11.0.2
  - @keystone-ui/tooltip@1.0.6
  - @keystonejs/adapter-knex@13.0.0
  - @keystonejs/adapter-mongoose@11.0.0

## 0.0.9

### Patch Changes

- Updated dependencies [[`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464), [`a96c24cca`](https://github.com/keystonejs/keystone/commit/a96c24ccab8dadc9e8f0131fe6509abd64a776f5), [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed), [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63)]:
  - @keystonejs/adapter-prisma@2.0.0
  - @keystone-next/types@11.0.1
  - @keystonejs/fields@21.0.2

## 0.0.8

### Patch Changes

- Updated dependencies [[`49eec4dea`](https://github.com/keystonejs/keystone/commit/49eec4dea522c6a043b3eaf93fc8be8256b00aa6), [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e), [`0d9404768`](https://github.com/keystonejs/keystone/commit/0d94047686d1bb1308fd8c47b769c999390d8f6d), [`b81a11c17`](https://github.com/keystonejs/keystone/commit/b81a11c171f3627f6cecb66bd2faeb89a68a009e), [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b), [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9), [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719), [`177cbd530`](https://github.com/keystonejs/keystone/commit/177cbd5303b814d1acaa8ded98e3d114c770bdba), [`160bd77d3`](https://github.com/keystonejs/keystone/commit/160bd77d39d5e99b11bee056fe2c3b2585126bbc), [`831db7c2b`](https://github.com/keystonejs/keystone/commit/831db7c2b7a9bced87acf76e3f431ca88a8880b0), [`a36bcf847`](https://github.com/keystonejs/keystone/commit/a36bcf847806ca0739f7b44d49a9bf6ac26a38d4), [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490), [`81e86cbaa`](https://github.com/keystonejs/keystone/commit/81e86cbaa5c73633d6cb0ca2f84e834201e8bf9a)]:
  - @keystonejs/adapter-prisma@1.1.2
  - @keystone-next/types@11.0.0
  - @keystone-next/admin-ui@8.0.0
  - @keystone-ui/fields@1.1.0
  - @keystone-next/fields@4.1.0
  - @keystone-ui/popover@1.1.1
  - @keystone-ui/tooltip@1.0.5
  - @keystonejs/fields@21.0.1
  - @keystonejs/adapter-knex@12.0.4
  - @keystonejs/adapter-mongoose@10.1.2
  - @keystone-next/admin-ui-utils@2.0.7

## 0.0.7

### Patch Changes

- Updated dependencies [[`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a)]:
  - @keystone-next/admin-ui@7.0.1
  - @keystone-next/fields@4.0.3
  - @keystone-next/types@10.0.0
  - @keystone-next/admin-ui-utils@2.0.6

## 0.0.6

### Patch Changes

- Updated dependencies [[`1236f5f40`](https://github.com/keystonejs/keystone/commit/1236f5f4024f1698b5a39343b4e5dbfa42c5fc9c), [`ba842d48b`](https://github.com/keystonejs/keystone/commit/ba842d48b5e9499ccd6f59d1610d55e964ffdb93), [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5), [`f559e680b`](https://github.com/keystonejs/keystone/commit/f559e680bad7a7c948a317adfb91a3b024b486c4), [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368), [`cf2819544`](https://github.com/keystonejs/keystone/commit/cf2819544426def260ada5eb18fdc9b8a01e9438), [`17519bf64`](https://github.com/keystonejs/keystone/commit/17519bf64f277ad154fad1b0d5a423048e1336e0)]:
  - @keystone-next/admin-ui@7.0.0
  - @keystone-ui/tooltip@1.0.4
  - @keystone-next/types@9.0.0
  - @keystonejs/adapter-mongoose@10.1.1
  - @keystone-next/fields@4.0.2
  - @keystone-next/admin-ui-utils@2.0.5
  - @keystonejs/adapter-knex@12.0.3
  - @keystonejs/adapter-prisma@1.1.1

## 0.0.5

### Patch Changes

- Updated dependencies [[`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da)]:
  - @keystone-next/admin-ui@6.0.0
  - @keystone-next/types@8.0.0
  - @keystone-next/fields@4.0.1
  - @keystone-next/admin-ui-utils@2.0.4

## 0.0.4

### Patch Changes

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956), [`6912c7b9d`](https://github.com/keystonejs/keystone/commit/6912c7b9dc3d786e61e6f657b0886b258d942c30), [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2), [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79), [`5c75534f6`](https://github.com/keystonejs/keystone/commit/5c75534f6e9e0f10a6556a1f1dc87b5fdd986dd4), [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da), [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da), [`dab8121a6`](https://github.com/keystonejs/keystone/commit/dab8121a6a8eae4c42a5a9ecbdb72a3e8b1eeda4), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409), [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0), [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`f2c7675fb`](https://github.com/keystonejs/keystone/commit/f2c7675fb51ed41e6df8248c76b9322d6de5ee0d)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystonejs/fields@21.0.0
  - @keystone-next/fields@4.0.0
  - @keystone-next/admin-ui@5.0.0
  - @keystonejs/adapter-prisma@1.1.0
  - @keystone-next/types@7.0.0
  - @keystone-ui/core@1.0.4
  - @keystone-ui/fields@1.0.3
  - @keystone-next/admin-ui-utils@2.0.3

## 0.0.3

### Patch Changes

- Updated dependencies [[`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13), [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9), [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95), [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62), [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d), [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a), [`2338ed731`](https://github.com/keystonejs/keystone/commit/2338ed73185cd3d33c62fac69064c8a4950dc3fd), [`57092b7c1`](https://github.com/keystonejs/keystone/commit/57092b7c13845fffd1f3767bb609d203afbc2776), [`dbfef6256`](https://github.com/keystonejs/keystone/commit/dbfef6256b11d94250885f5f3a11d0ba81ad3b08), [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27), [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab), [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6), [`4b019b8cf`](https://github.com/keystonejs/keystone/commit/4b019b8cfcb7bea6f800609da5d07e8c8abfc80a), [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b), [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b), [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98), [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c), [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180), [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4), [`6a364a664`](https://github.com/keystonejs/keystone/commit/6a364a664ce16f741408111054f0f3437a63a194), [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77)]:
  - @keystone-next/admin-ui@4.0.0
  - @keystone-next/types@6.0.0
  - @keystone-next/fields@3.2.2
  - @keystone-next/admin-ui-utils@2.0.2

## 0.0.2

### Patch Changes

- Updated dependencies [[`abdaeb9c1`](https://github.com/keystonejs/keystone/commit/abdaeb9c17a0f1d8e6eda1178d79107ac8770058), [`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd), [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5), [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a)]:
  - @keystonejs/fields@20.1.3
  - @keystone-next/types@5.0.0
  - @keystone-next/admin-ui@3.1.2
  - @keystone-next/admin-ui-utils@2.0.1
  - @keystone-next/fields@3.2.1

## 0.0.1

### Patch Changes

- [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4) [#4376](https://github.com/keystonejs/keystone/pull/4376) Thanks [@jossmac](https://github.com/jossmac)! - tidy the document field; primarily the toolbar

- [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a) [#4378](https://github.com/keystonejs/keystone/pull/4378) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to consistently use `context` rather than `ctx` for graphQL context variables.

- Updated dependencies [[`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0), [`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0), [`038b0ae65`](https://github.com/keystonejs/keystone/commit/038b0ae6586f8673de22046842b2ef993b0e1937), [`55a04a100`](https://github.com/keystonejs/keystone/commit/55a04a1004b7f15fcd41b4935d74fd1847c9deeb), [`f4a855c71`](https://github.com/keystonejs/keystone/commit/f4a855c71e966ef3ebc894a3b0f1af51e5182394), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567), [`fa12a18b0`](https://github.com/keystonejs/keystone/commit/fa12a18b077367563b1b69db55274e47a1bd5027), [`4eef4dc55`](https://github.com/keystonejs/keystone/commit/4eef4dc5587cc06f08ead5d5d05db2e9a786b8bc), [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4), [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`b8c2c48ec`](https://github.com/keystonejs/keystone/commit/b8c2c48ec3746809894af7347c205f6a95329e8d)]:
  - @keystone-next/fields@3.2.0
  - @keystone-ui/popover@1.1.0
  - @keystonejs/fields@20.1.2
  - @keystone-ui/core@1.0.3
  - @keystone-next/admin-ui@3.1.1
  - @keystone-next/admin-ui-utils@2.0.0
  - @keystone-next/types@4.1.1
  - @keystone-ui/tooltip@1.0.3
