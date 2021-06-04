# @keystone-next/auth

## 26.0.0

### Major Changes

- [#5806](https://github.com/keystonejs/keystone/pull/5806) [`0eadba2ba`](https://github.com/keystonejs/keystone/commit/0eadba2badb13fc6a17f7e525d429494ca953481) Thanks [@list({](https://github.com/list({), [@list({](https://github.com/list({)! - Removed `withItemData` in favour of a `sessionData` option to the `createAuth()` function.

  Previously, `withItemData` would be used to wrap the `config.session` argument:

  ```typescript
  import { config, createSchema, list } from '@keystone-next/keystone/schema';
  import { statelessSessions, withAuthData } from '@keystone-next/keystone/session';
  import { text, password, checkbox } from '@keystone-next/fields';
  import { createAuth } from '@keystone-next/auth';

  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
  });

  const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

  export default withAuth(
    config({
      lists: createSchema({

          fields: {
            email: text({ isUnique: true }),
            password: password(),
            isAdmin: checkbox(),
          },
        }),
        session: withItemData(session, { User: 'id isAdmin' }),
      }),
    })
  );
  ```

  Now, the fields to populate are configured on `sessionData` in `createAuth`, and `withItemData` is completely removed.

  ```typescript
  import { config, createSchema, list } from '@keystone-next/keystone/schema';
  import { statelessSessions } from '@keystone-next/keystone/session';
  import { text, password, checkbox } from '@keystone-next/fields';
  import { createAuth } from '@keystone-next/auth';

  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    sessionData: 'id isAdmin',
  });

  const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

  export default withAuth(
    config({
      lists: createSchema({

          fields: {
            email: text({ isUnique: true }),
            password: password(),
            isAdmin: checkbox(),
          },
        }),
        session,
      }),
    })
  );
  ```

* [#5787](https://github.com/keystonejs/keystone/pull/5787) [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `req, session, createContext` args to `config.ui.pageMiddleware` with a `context` arg.

### Patch Changes

- [#5766](https://github.com/keystonejs/keystone/pull/5766) [`a2553ab82`](https://github.com/keystonejs/keystone/commit/a2553ab823988921143c1ab3081f82fe067c564e) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added visually hidden labels to signin / welcome fields for better screen reader experience.

* [#5827](https://github.com/keystonejs/keystone/pull/5827) [`a0ef39cb3`](https://github.com/keystonejs/keystone/commit/a0ef39cb3d9145bd62882fa0f23716509613f342) Thanks [@timleslie](https://github.com/timleslie)! - Updated schema extension code to not depend on the `BaseKeystone` object.

- [#5828](https://github.com/keystonejs/keystone/pull/5828) [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `keystone` argument from the `ExtendGraphqlSchema` type. This will only impact you if you were directly constructing this function. Users of the `graphQLSchemaExtension` function will not be impacted.

- Updated dependencies [[`0eadba2ba`](https://github.com/keystonejs/keystone/commit/0eadba2badb13fc6a17f7e525d429494ca953481), [`f52079f0b`](https://github.com/keystonejs/keystone/commit/f52079f0bffc4cf2ab5e26e4c3654127b59d6078), [`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`74bc77854`](https://github.com/keystonejs/keystone/commit/74bc778547623fe4ed3db97ed09384d9dc076372), [`a6a444acd`](https://github.com/keystonejs/keystone/commit/a6a444acd23f2590d9812872441cafb5d088c48e), [`29075e580`](https://github.com/keystonejs/keystone/commit/29075e58074672d90cfca84aba8dcedeecf243ca), [`59421c039`](https://github.com/keystonejs/keystone/commit/59421c0399368e56e46537c1c687daa27f5912d0), [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0), [`319c19bd5`](https://github.com/keystonejs/keystone/commit/319c19bd5f8e8c261a1aefb1997d66b2a136ae28), [`c6cd0a6bd`](https://github.com/keystonejs/keystone/commit/c6cd0a6bdc7ccb000c39fba0da31819e33d9e056), [`195d4fb12`](https://github.com/keystonejs/keystone/commit/195d4fb1218517d7b9a40d3bba1a087d40e6d1d6), [`1fe4753f3`](https://github.com/keystonejs/keystone/commit/1fe4753f3af28aa851e1f90d55937c940be5af1a), [`5b02e8625`](https://github.com/keystonejs/keystone/commit/5b02e8625e18c8e79547d5caf8cacb5014ffee9d), [`76cdb791b`](https://github.com/keystonejs/keystone/commit/76cdb791b1ab36d015e43b87deff52be2ea6b629), [`762f17823`](https://github.com/keystonejs/keystone/commit/762f1782334c9b7174c320182c753c215834ff7f), [`0617c81ea`](https://github.com/keystonejs/keystone/commit/0617c81eacc88e40bdd21bacab285d674b171a4a), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`107eeb037`](https://github.com/keystonejs/keystone/commit/107eeb0374e214b69be3727ca955a9f76e1468bb), [`3a7acc2c5`](https://github.com/keystonejs/keystone/commit/3a7acc2c5114fbcbde994d1f4c6cc0b21c572ec0), [`9de71a9fb`](https://github.com/keystonejs/keystone/commit/9de71a9fb0d3b7f5f05c0d908bebdb818723fd4b), [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394), [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b), [`590bb1fe9`](https://github.com/keystonejs/keystone/commit/590bb1fe9254c2f8feff7e3a0e2e964610116f95), [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0), [`38a177d61`](https://github.com/keystonejs/keystone/commit/38a177d6140874b29d3c09b5852dbfd787d5c429), [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba), [`19a756496`](https://github.com/keystonejs/keystone/commit/19a7564964d9dcdc94ecdda9c0a0e92c539eb309)]:
  - @keystone-next/keystone@19.0.0
  - @keystone-next/fields@10.0.0
  - @keystone-next/types@19.0.0
  - @keystone-ui/fields@4.1.0
  - @keystone-next/admin-ui-utils@5.0.1

## 25.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

* [#5677](https://github.com/keystonejs/keystone/pull/5677) [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the `@keystone-next/admin-ui` package into `@keystone-next/keystone`.

  If you were directly importing from `@keystone-next/admin-ui` you can now import the same items from `@keystone-next/keystone/admin-ui`.
  If you have `@keystone-next/admin-ui` in your `package.json` you should remove it.

### Patch Changes

- [#5734](https://github.com/keystonejs/keystone/pull/5734) [`194bbeea2`](https://github.com/keystonejs/keystone/commit/194bbeea29ed1103507202b762f4ac26778f25ed) Thanks [@raveling](https://github.com/raveling)! - The signup copy to create first user now uses active voice.

- Updated dependencies [[`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d), [`016ccad82`](https://github.com/keystonejs/keystone/commit/016ccad82ed73898a64310506117c1cbae60a512), [`8da79e71a`](https://github.com/keystonejs/keystone/commit/8da79e71abb005eb755620fb3c8f82a3a2952152), [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab)]:
  - @keystone-ui/button@5.0.0
  - @keystone-ui/core@3.0.0
  - @keystone-ui/fields@4.0.0
  - @keystone-ui/notice@4.0.0
  - @keystone-next/admin-ui-utils@5.0.0
  - @keystone-next/fields@9.0.0
  - @keystone-next/keystone@18.0.0
  - @keystone-next/types@18.0.0

## 24.0.0

### Patch Changes

- Updated dependencies [[`737b3e6e5`](https://github.com/keystonejs/keystone/commit/737b3e6e53d0948de8f1419709ece5648ff4529a), [`62e68c8e5`](https://github.com/keystonejs/keystone/commit/62e68c8e5b4964785a173ab05ff89cba9cc685f2), [`deb7f9504`](https://github.com/keystonejs/keystone/commit/deb7f9504573da67b0cd76d3f53dc0fcceaf1021), [`1ef9986dd`](https://github.com/keystonejs/keystone/commit/1ef9986ddc5a4a881a3fc6fae3d1420447174fdb), [`669f0d8ac`](https://github.com/keystonejs/keystone/commit/669f0d8acfce5d6b7eaaa972ab354597c53c2568)]:
  - @keystone-next/keystone@17.2.0
  - @keystone-next/types@17.1.0
  - @keystone-next/admin-ui@14.1.3

## 23.0.1

### Patch Changes

- [#5614](https://github.com/keystonejs/keystone/pull/5614) [`483932276`](https://github.com/keystonejs/keystone/commit/483932276f15f0f6fcda3cfa6e1ece886d35550e) Thanks [@timleslie](https://github.com/timleslie)! - Updated `withAuth` to respect `config.ui.isDisabled`. Now works as expected when `config.ui` is undefined.

* [#5624](https://github.com/keystonejs/keystone/pull/5624) [`868d89f29`](https://github.com/keystonejs/keystone/commit/868d89f29156740b6ea0482e97108bfa58feda73) Thanks [@timleslie](https://github.com/timleslie)! - Disabled the `Forgot your password` button on the signin page, which is not yet functional.

* Updated dependencies [[`3aea3b12f`](https://github.com/keystonejs/keystone/commit/3aea3b12fd0047e54671ead796fca15b625ade66), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`b0a72a112`](https://github.com/keystonejs/keystone/commit/b0a72a112dae7857defc8b745e674d55a29be766), [`79a0844b9`](https://github.com/keystonejs/keystone/commit/79a0844b9d5125891e3eaad4dc3999b232cefaa2), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`2b3efc8a8`](https://github.com/keystonejs/keystone/commit/2b3efc8a883e1e5832ed5111a6e0e4d3ee59f162), [`85dfdfb1e`](https://github.com/keystonejs/keystone/commit/85dfdfb1ea236bb1515ac6df43f974b30d0bf89a), [`fc9c3d55d`](https://github.com/keystonejs/keystone/commit/fc9c3d55d5a2e6a87bcb9e9ed50a19a503290457), [`400d88257`](https://github.com/keystonejs/keystone/commit/400d88257a3383595cf76c9399848b356dd51a11), [`dbe831976`](https://github.com/keystonejs/keystone/commit/dbe831976eeee876f3722d4b96e1b752b67cb945), [`53225b0ef`](https://github.com/keystonejs/keystone/commit/53225b0efcf33810c1c91a0a4ec3e2369733ab0a), [`79d092afc`](https://github.com/keystonejs/keystone/commit/79d092afca565abe780e84d917299ecb749752f1), [`bb8920843`](https://github.com/keystonejs/keystone/commit/bb8920843a1e0d803b8238bd17e9d65802698685)]:
  - @keystone-next/admin-ui@14.1.2
  - @keystone-next/fields@8.2.0
  - @keystone-next/keystone@17.1.1
  - @keystone-ui/core@2.0.3

## 23.0.0

### Patch Changes

- Updated dependencies [[`1c0265171`](https://github.com/keystonejs/keystone/commit/1c0265171db2e334c25d014d855ec919c3d4782c), [`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9), [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b), [`1043243ff`](https://github.com/keystonejs/keystone/commit/1043243ff5a22bb067cf4aa6e46d28a529203121)]:
  - @keystone-next/keystone@17.1.0
  - @keystone-next/fields@8.1.0
  - @keystone-next/admin-ui@14.1.1

## 22.0.0

### Patch Changes

- [#5530](https://github.com/keystonejs/keystone/pull/5530) [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to use the new DB items API.

- Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`18ae28bde`](https://github.com/keystonejs/keystone/commit/18ae28bde943c140332ad5e0cd0b5238555fb1b8), [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee), [`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fbf5f77c5`](https://github.com/keystonejs/keystone/commit/fbf5f77c515b2413c4019b4a521dd4f4aa965276), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`dbc62ff7c`](https://github.com/keystonejs/keystone/commit/dbc62ff7c71ca4d4db1fab76f3e0ab729af5b80c), [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6), [`91e603d7a`](https://github.com/keystonejs/keystone/commit/91e603d7a686185c145bcbc445a27939f94aafa8), [`a6cdf3da8`](https://github.com/keystonejs/keystone/commit/a6cdf3da8a9b2ca943048fee6cacd376ea4aae50), [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc), [`ddf51724a`](https://github.com/keystonejs/keystone/commit/ddf51724ab2043f395d1d197213748c06a5300b7), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e), [`d216fd04c`](https://github.com/keystonejs/keystone/commit/d216fd04c92ec594fb9b448025fc3e23fe6dfdad), [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a), [`2df2fa021`](https://github.com/keystonejs/keystone/commit/2df2fa0213146adab79e5e17c60d43259041093d), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`f76938ac2`](https://github.com/keystonejs/keystone/commit/f76938ac223194ce401179fd9fa1226e11077277), [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351)]:
  - @keystone-next/admin-ui@14.1.0
  - @keystone-next/fields@8.0.0
  - @keystone-next/keystone@17.0.0
  - @keystone-next/types@17.0.1

## 21.0.0

### Major Changes

- [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

### Patch Changes

- [#5451](https://github.com/keystonejs/keystone/pull/5451) [`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624) Thanks [@JedWatson](https://github.com/JedWatson)! - With the goal of making the Lists API (i.e `context.lists.{List}`) more intuitive to use, the `resolveFields` option has been deprecated in favor of two new methods:

  (1) You can specify a string of fields to return with the new `query` option, when you want to query for resolved field values (including querying relationships and virtual fields). This replaces the `resolveFields: false` use case.

  For example, to query a Post you would now write:

  ```js
  const [post] = await context.lists.Post.findMany({
    where: { slug },
    query: `
      title
      content
      image {
        src
        width
        height
      }`,
  });
  ```

  (2) Alternatively, there is a new set of APIs on `context.db.lists.{List}` which will return the unresolved item data from the database (but with read hooks applied), which can then be referenced directly or returned from a custom mutation or query in the GraphQL API to be handled by the Field resolvers. This replaces the `resolveFields: boolean` use case.

  For example, to query for the raw data stored in the database, you would write:

  ```js
  const [post] = await context.db.lists.Post.findMany({
    where: { slug },
  });
  ```

- Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`3d3fb860f`](https://github.com/keystonejs/keystone/commit/3d3fb860faa303cbfe75eeb0855a8a575113320c), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`588f31ddc`](https://github.com/keystonejs/keystone/commit/588f31ddce15ab752a987a1dc1429fa1d6f03d7c), [`781b3e5ab`](https://github.com/keystonejs/keystone/commit/781b3e5abcf9a8b6d29c86d6470adfd08b4413c8), [`49025d1ad`](https://github.com/keystonejs/keystone/commit/49025d1ad0d85c4f80e5430a365c4fc78db96c92), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`d9e1acb30`](https://github.com/keystonejs/keystone/commit/d9e1acb30e384ce88e6681ba9d299d917dea97d9), [`24e62e29c`](https://github.com/keystonejs/keystone/commit/24e62e29c51c04448a272a25292251fc13e06d7a), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`6861ecb40`](https://github.com/keystonejs/keystone/commit/6861ecb40345434f8d070950a3c8fb85f3d59994), [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`202d362f3`](https://github.com/keystonejs/keystone/commit/202d362f38d0c8827263e6cd2d286d8dcbdd22ad), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`962cde7e3`](https://github.com/keystonejs/keystone/commit/962cde7e32ec7ce23d15180f315549f4f34069ee), [`f67497c1a`](https://github.com/keystonejs/keystone/commit/f67497c1a9dd7462e7d6564250712f5456dc5cb0), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`76692d266`](https://github.com/keystonejs/keystone/commit/76692d26642eabf23d2ef038dec35d35d4e35d31), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`ad1776b74`](https://github.com/keystonejs/keystone/commit/ad1776b7418b7a0d1c8e5def8d82051752c01aa9), [`309596591`](https://github.com/keystonejs/keystone/commit/3095965915adbb93ff6879d4e9bf3f0dd504708c), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853), [`a73aea7d7`](https://github.com/keystonejs/keystone/commit/a73aea7d78d4c520856f06f9d1b79efe4b36993b)]:
  - @keystone-next/admin-ui@14.0.0
  - @keystone-next/keystone@16.0.0
  - @keystone-next/types@17.0.0
  - @keystone-next/fields@7.0.0
  - @keystone-ui/button@4.0.0
  - @keystone-ui/fields@3.0.0
  - @keystone-ui/notice@3.0.0
  - @keystone-next/admin-ui-utils@4.0.0

## 20.0.0

### Patch Changes

- Updated dependencies [[`901817fed`](https://github.com/keystonejs/keystone/commit/901817fedf4bcfb269416c3c68093ae0263f4d00), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1a4db6c87`](https://github.com/keystonejs/keystone/commit/1a4db6c87c17706c8e5db2816e0a6b1b8f79e217), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`5c4b48636`](https://github.com/keystonejs/keystone/commit/5c4b4863638cffa794dd1b02c445a87655a4178c), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b), [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`bc21855a7`](https://github.com/keystonejs/keystone/commit/bc21855a7ff6dd4dbc278b3e15c9157de765e6ba), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b)]:
  - @keystone-next/keystone@15.0.0
  - @keystone-next/types@16.0.0
  - @keystone-next/admin-ui@13.0.0
  - @keystone-next/fields@6.0.0
  - @keystone-ui/fields@2.1.0
  - @keystone-next/admin-ui-utils@3.0.3

## 19.0.0

### Patch Changes

- Updated dependencies [[`343b74246`](https://github.com/keystonejs/keystone/commit/343b742468e01a6cf9003ee47ee2d2a6d9dbd011)]:
  - @keystone-next/keystone@14.0.0
  - @keystone-next/admin-ui@12.0.1

## 18.0.0

### Patch Changes

- [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

- Updated dependencies [[`bfeb927be`](https://github.com/keystonejs/keystone/commit/bfeb927be5c80fac2dadd800295fd4789c53f1ce), [`1eeac4722`](https://github.com/keystonejs/keystone/commit/1eeac4722da174307152dad9b5adf5062e4b6403), [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`17c86e0c3`](https://github.com/keystonejs/keystone/commit/17c86e0c3eda7ba08d1bb8edf5eb8ddc9a819e5a), [`b7ce464a2`](https://github.com/keystonejs/keystone/commit/b7ce464a261321fe3344898fa4f4a91e6fa8dbb1), [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d), [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`ec6f9b601`](https://github.com/keystonejs/keystone/commit/ec6f9b601ea6fdbfb2335a5e81b7ec3f1b0e4d4d), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02), [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91)]:
  - @keystone-next/keystone@13.0.0
  - @keystone-next/fields@5.3.0
  - @keystone-next/types@15.0.0
  - @keystone-ui/fields@2.0.2
  - @keystone-ui/core@2.0.2
  - @keystone-ui/notice@2.0.2
  - @keystone-next/admin-ui@12.0.0
  - @keystone-next/admin-ui-utils@3.0.2

## 17.0.0

### Patch Changes

- Updated dependencies [[`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1), [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761), [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761)]:
  - @keystone-next/admin-ui@11.0.0
  - @keystone-next/keystone@12.0.0
  - @keystone-next/fields@5.2.1

## 16.0.1

### Patch Changes

- [`29a970378`](https://github.com/keystonejs/keystone/commit/29a9703786728c9b8b6cdef71e087e604099d257) [#5011](https://github.com/keystonejs/keystone/pull/5011) Thanks [@timleslie](https://github.com/timleslie)! - Updated internals to allow for easier documentation.

- Updated dependencies [[`aba7c45d7`](https://github.com/keystonejs/keystone/commit/aba7c45d7645aa71b50de070d37896b73248751a), [`9b202b31a`](https://github.com/keystonejs/keystone/commit/9b202b31a7d4944b709fe0ce58d6ca7ec1523a02)]:
  - @keystone-next/fields@5.2.0
  - @keystone-next/admin-ui@10.0.1
  - @keystone-next/keystone@11.0.1
  - @keystone-next/types@14.0.1

## 16.0.0

### Major Changes

- [`03abbab48`](https://github.com/keystonejs/keystone/commit/03abbab48df86e5f5c8e61f1b549ff6e753f9439) [#4986](https://github.com/keystonejs/keystone/pull/4986) Thanks [@timleslie](https://github.com/timleslie)! - Simplified `createAuth()` to only return `{ withAuth }`.

* [`9ea032828`](https://github.com/keystonejs/keystone/commit/9ea0328282fdbe199f4251525ec6f1e5d317bf3e) [#4968](https://github.com/keystonejs/keystone/pull/4968) Thanks [@timleslie](https://github.com/timleslie)! - Removed `gqlSuffix` config option from `createAuth()`.

- [`490d52c2f`](https://github.com/keystonejs/keystone/commit/490d52c2f56c8070928efbce3046e7e4cbbf6fbf) [#4985](https://github.com/keystonejs/keystone/pull/4985) Thanks [@timleslie](https://github.com/timleslie)! - Removed `protectIdentities` from the `createAuth` arguments. The behaviour is now the same as having `protectIdentities: true`.

* [`098ce08d7`](https://github.com/keystonejs/keystone/commit/098ce08d7abd5e86b1e15ad442e717cea1852c33) [#4987](https://github.com/keystonejs/keystone/pull/4987) Thanks [@timleslie](https://github.com/timleslie)! - The `passwordReset*` fields and `magicAuth*` fields are only added to the system if `passwordResetLink` and `magicAuthLink` respectively are set.

- [`a00a382ff`](https://github.com/keystonejs/keystone/commit/a00a382ffe2ce4769d6e134dec7eacbaaeff193a) [#4965](https://github.com/keystonejs/keystone/pull/4965) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug when using `passwordResetLink` with a `secretField` other than `'password'`. If you used a `secretField` other than `'password'` then the generated fields in your schema will change.

* [`c63e5d75c`](https://github.com/keystonejs/keystone/commit/c63e5d75cd77cf26f8762bda8143d1c1db6d0e3e) [#4857](https://github.com/keystonejs/keystone/pull/4857) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed all syntax that is not ES5 + ES Modules in the generated Admin UI pages.

### Minor Changes

- [`685347911`](https://github.com/keystonejs/keystone/commit/68534791177aa314acf702f47fddaf56a7a2356f) [#5003](https://github.com/keystonejs/keystone/pull/5003) Thanks [@timleslie](https://github.com/timleslie)! - Added `context` argument to `sendToken` function used by `passwordResetLink` and `magicAuthLink`.

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`884129fa7`](https://github.com/keystonejs/keystone/commit/884129fa72ccbf1dadbbfd4ae95ec20e1bad720d) [#4928](https://github.com/keystonejs/keystone/pull/4928) Thanks [@MurzNN](https://github.com/MurzNN)! - Fixed a bug which prevented accessing the '/init` path from behind a reverse proxy.

- [`2674831cd`](https://github.com/keystonejs/keystone/commit/2674831cd619858b4171939baad68578371bf39f) [#5008](https://github.com/keystonejs/keystone/pull/5008) Thanks [@timleslie](https://github.com/timleslie)! - Updated internal types to be more correct.

* [`2bf710177`](https://github.com/keystonejs/keystone/commit/2bf710177c42cbc2a9db19ad9b719de6c7204337) [#5009](https://github.com/keystonejs/keystone/pull/5009) Thanks [@timleslie](https://github.com/timleslie)! - Renamed internal function `updateAuthToken` to `createAuthToken`.

- [`e6844dd95`](https://github.com/keystonejs/keystone/commit/e6844dd9550184d443025a95dea4b5b5611c811b) [#4941](https://github.com/keystonejs/keystone/pull/4941) Thanks [@timleslie](https://github.com/timleslie)! - Updated import of `KeystoneContext` to use top level `types` package API.

* [`10852a174`](https://github.com/keystonejs/keystone/commit/10852a174c8cccc9586ad95a74b347ddb9c0afde) [#4964](https://github.com/keystonejs/keystone/pull/4964) Thanks [@timleslie](https://github.com/timleslie)! - Moved the `getSchemaExtension` code into its own file for easier documentation.

- [`9f2409127`](https://github.com/keystonejs/keystone/commit/9f24091273d761529da514724ed2cb4174e9b697) [#5005](https://github.com/keystonejs/keystone/pull/5005) Thanks [@timleslie](https://github.com/timleslie)! - Updated `createAuth` to only include `/init` in `publicPages` if `initFirstItem` is being used.

- Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a), [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985), [`9a9276eb7`](https://github.com/keystonejs/keystone/commit/9a9276eb7acded979b703b4f3ed8bce781e0718a), [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914), [`fdb9d9abb`](https://github.com/keystonejs/keystone/commit/fdb9d9abbe1ea24a2dbb9ce6f755c713966601aa), [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d), [`0cd5acb82`](https://github.com/keystonejs/keystone/commit/0cd5acb82b2e640821c092eb429401eb9d7e8e9a), [`53b8b659f`](https://github.com/keystonejs/keystone/commit/53b8b659ffc7db41e0e0d9ad7393e6a821187340), [`29e787983`](https://github.com/keystonejs/keystone/commit/29e787983bdc26b147d6b5f476e70768bbc5318c), [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f), [`562cccbe1`](https://github.com/keystonejs/keystone/commit/562cccbe12f257a4ee13d23ed64b5ef4b325c1b1), [`0e265f6c1`](https://github.com/keystonejs/keystone/commit/0e265f6c10eadd37f75e5551b22b50236e830086), [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3), [`45ea93421`](https://github.com/keystonejs/keystone/commit/45ea93421f9a6cf9b7ccbd983e0c9cbd687ff6af), [`f895a2671`](https://github.com/keystonejs/keystone/commit/f895a2671d410c4faa2f354d080d8ee6cc4761f2), [`6c949dbf2`](https://github.com/keystonejs/keystone/commit/6c949dbf262350e280072d82cd48fdd31ff5ba6d), [`ceab7dc69`](https://github.com/keystonejs/keystone/commit/ceab7dc6904df20f581d4693657043f156c2e8c9), [`7ae67b857`](https://github.com/keystonejs/keystone/commit/7ae67b857745985061700b0477c3f585b3b8efbf), [`3ca5038a0`](https://github.com/keystonejs/keystone/commit/3ca5038a021105a7452f4e7a4641107caa4ffe3a), [`c8cf7fb1f`](https://github.com/keystonejs/keystone/commit/c8cf7fb1fb7484d46a7e8b7c6c0b638ceae70d1a), [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f), [`6469362a1`](https://github.com/keystonejs/keystone/commit/6469362a15bdee579937e17527a6c31e5411312a), [`bea9008f8`](https://github.com/keystonejs/keystone/commit/bea9008f82efea7fcf1cb547f3841915cd4689cc), [`c63e5d75c`](https://github.com/keystonejs/keystone/commit/c63e5d75cd77cf26f8762bda8143d1c1db6d0e3e), [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e), [`880fd5f92`](https://github.com/keystonejs/keystone/commit/880fd5f92881796d40e994d5b64dc3cc5c61e5e6), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc)]:
  - @keystone-ui/button@3.0.1
  - @keystone-ui/core@2.0.1
  - @keystone-ui/fields@2.0.1
  - @keystone-ui/notice@2.0.1
  - @keystone-next/admin-ui@10.0.0
  - @keystone-next/admin-ui-utils@3.0.1
  - @keystone-next/fields@5.1.0
  - @keystone-next/keystone@11.0.0
  - @keystone-next/types@14.0.0

## 15.0.0

### Major Changes

- [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf) [#4622](https://github.com/keystonejs/keystone/pull/4622) Thanks [@renovate](https://github.com/apps/renovate)! - Updated react and react-dom to v17

* [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0) [#4815](https://github.com/keystonejs/keystone/pull/4815) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.sudo()` method to `context` objects, which is equivalent to the common operation `context.createContext({ skipAccessControl: true })`.

- [`526b4ce69`](https://github.com/keystonejs/keystone/commit/526b4ce69d79fb96d5cc01e293f11e48101c79c5) [#4754](https://github.com/keystonejs/keystone/pull/4754) Thanks [@JedWatson](https://github.com/JedWatson)! - Changed showKeystoneSignup prop to enableWelcome in InitPage

### Minor Changes

- [`526b4ce69`](https://github.com/keystonejs/keystone/commit/526b4ce69d79fb96d5cc01e293f11e48101c79c5) [#4754](https://github.com/keystonejs/keystone/pull/4754) Thanks [@JedWatson](https://github.com/JedWatson)! - Added Welcome page with mailing list signup flow to InitPage.

### Patch Changes

- [`526b4ce69`](https://github.com/keystonejs/keystone/commit/526b4ce69d79fb96d5cc01e293f11e48101c79c5) [#4754](https://github.com/keystonejs/keystone/pull/4754) Thanks [@JedWatson](https://github.com/JedWatson)! - Refactored router events on InitPage, and made minor changes to SignupContainer styles.

- Updated dependencies [[`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf), [`208722a42`](https://github.com/keystonejs/keystone/commit/208722a4234434e116846756bab18f7e11674ec8), [`ad75e3d61`](https://github.com/keystonejs/keystone/commit/ad75e3d61c73ba1239fd21b58f175aac01d9f302), [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765), [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`a418fd535`](https://github.com/keystonejs/keystone/commit/a418fd5351b0070aab05380b658065be7916fb2a), [`954350389`](https://github.com/keystonejs/keystone/commit/9543503894c3e78a9b69a75cbfb3ca6b85ae34e8), [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3), [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`250daa2a2`](https://github.com/keystonejs/keystone/commit/250daa2a2c2693f415d9499a531095f3caf2a1d5), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystone-next/admin-ui@9.0.0
  - @keystone-next/keystone@10.0.0
  - @keystone-next/admin-ui-utils@3.0.0
  - @keystone-next/fields@5.0.0
  - @keystone-ui/button@3.0.0
  - @keystone-ui/core@2.0.0
  - @keystone-ui/fields@2.0.0
  - @keystone-ui/notice@2.0.0
  - @keystone-next/types@13.0.0

## 14.0.0

### Patch Changes

- [`314edec3d`](https://github.com/keystonejs/keystone/commit/314edec3d12f3bb56611f101edc3a78cba940605) [#4384](https://github.com/keystonejs/keystone/pull/4384) Thanks [@timleslie](https://github.com/timleslie)! - Added improved types to resolver functions.

* [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5) [#4762](https://github.com/keystonejs/keystone/pull/4762) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the type `KeystoneAdminUIConfig` to `AdminUIConfig`.

* Updated dependencies [[`1744c5f05`](https://github.com/keystonejs/keystone/commit/1744c5f05c9a13e680aaa1ed151f23f1d015ed9c), [`26543bd07`](https://github.com/keystonejs/keystone/commit/26543bd0752c470e336d61644c14e6a5333f65c0), [`d9675553b`](https://github.com/keystonejs/keystone/commit/d9675553b33f39e2c7ada7eb6555d16e9fccb37e), [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652), [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5), [`fb8bcff91`](https://github.com/keystonejs/keystone/commit/fb8bcff91ef487730164c3330e0742ab13d9b3d7), [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33)]:
  - @keystone-next/types@12.0.0
  - @keystone-next/keystone@9.3.0
  - @keystone-next/admin-ui@8.0.1
  - @keystone-next/admin-ui-utils@2.0.8
  - @keystone-next/fields@4.1.1

## 13.0.0

### Patch Changes

- Updated dependencies [[`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9)]:
  - @keystone-next/keystone@9.2.0
  - @keystone-next/types@11.0.2

## 12.0.0

### Patch Changes

- Updated dependencies [[`fe0c228b1`](https://github.com/keystonejs/keystone/commit/fe0c228b12530f6d384fa5eed9d5086768a24782), [`a96c24cca`](https://github.com/keystonejs/keystone/commit/a96c24ccab8dadc9e8f0131fe6509abd64a776f5), [`ac3db9561`](https://github.com/keystonejs/keystone/commit/ac3db95613093de83e2369f624ce9b6c77bb8eda), [`f162a9d72`](https://github.com/keystonejs/keystone/commit/f162a9d72859ae7f2932bf0859c712861918b9e6)]:
  - @keystone-next/keystone@9.1.0
  - @keystone-next/types@11.0.1

## 11.0.0

### Patch Changes

- Updated dependencies [[`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e), [`0d9404768`](https://github.com/keystonejs/keystone/commit/0d94047686d1bb1308fd8c47b769c999390d8f6d), [`e11b111c7`](https://github.com/keystonejs/keystone/commit/e11b111c7e4a87c7a31108b9f5adbc546caaac35), [`283a6694a`](https://github.com/keystonejs/keystone/commit/283a6694ac461d0be980d7796f88efadd4fe108e), [`b81a11c17`](https://github.com/keystonejs/keystone/commit/b81a11c171f3627f6cecb66bd2faeb89a68a009e), [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b), [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9), [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719), [`177cbd530`](https://github.com/keystonejs/keystone/commit/177cbd5303b814d1acaa8ded98e3d114c770bdba), [`831db7c2b`](https://github.com/keystonejs/keystone/commit/831db7c2b7a9bced87acf76e3f431ca88a8880b0), [`a36bcf847`](https://github.com/keystonejs/keystone/commit/a36bcf847806ca0739f7b44d49a9bf6ac26a38d4), [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490)]:
  - @keystone-next/types@11.0.0
  - @keystone-next/admin-ui@8.0.0
  - @keystone-next/keystone@9.0.2
  - @keystone-ui/fields@1.1.0
  - @keystone-next/fields@4.1.0
  - @keystone-next/admin-ui-utils@2.0.7

## 10.0.1

### Patch Changes

- Updated dependencies [[`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a)]:
  - @keystone-next/admin-ui@7.0.1
  - @keystone-next/fields@4.0.3
  - @keystone-next/types@10.0.0
  - @keystone-next/admin-ui-utils@2.0.6
  - @keystone-next/keystone@9.0.1

## 10.0.0

### Major Changes

- [`0dfb63414`](https://github.com/keystonejs/keystone/commit/0dfb6341412c3c7ae60f069d37fa96e0c9adc900) [#4304](https://github.com/keystonejs/keystone/pull/4304) Thanks [@timleslie](https://github.com/timleslie)! - Changed the default value of `protectIdentities` from `false` to `true`.

### Patch Changes

- Updated dependencies [[`1236f5f40`](https://github.com/keystonejs/keystone/commit/1236f5f4024f1698b5a39343b4e5dbfa42c5fc9c), [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5), [`f559e680b`](https://github.com/keystonejs/keystone/commit/f559e680bad7a7c948a317adfb91a3b024b486c4), [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368), [`abc5440dc`](https://github.com/keystonejs/keystone/commit/abc5440dc5ee8d8cdd6ddddb32cf21bd2c3fc324), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`17519bf64`](https://github.com/keystonejs/keystone/commit/17519bf64f277ad154fad1b0d5a423048e1336e0)]:
  - @keystone-next/admin-ui@7.0.0
  - @keystone-next/keystone@9.0.0
  - @keystone-next/types@9.0.0
  - @keystone-next/fields@4.0.2
  - @keystone-next/admin-ui-utils@2.0.5

## 9.0.0

### Patch Changes

- Updated dependencies [[`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da)]:
  - @keystone-next/admin-ui@6.0.0
  - @keystone-next/keystone@8.0.0
  - @keystone-next/types@8.0.0
  - @keystone-next/fields@4.0.1
  - @keystone-next/admin-ui-utils@2.0.4

## 8.0.0

### Patch Changes

- [`96ece1c61`](https://github.com/keystonejs/keystone/commit/96ece1c610c9125b162ddab07a00a16d2db55127) [#4526](https://github.com/keystonejs/keystone/pull/4526) Thanks [@timleslie](https://github.com/timleslie)! - Fixed error being thrown when no `authenticatedItem` is available.

* [`7ef80b2f2`](https://github.com/keystonejs/keystone/commit/7ef80b2f2acef5ab27a978a9254ea5403a60ed78) [#4525](https://github.com/keystonejs/keystone/pull/4525) Thanks [@timleslie](https://github.com/timleslie)! - Updated `/init` page to use the `adminMeta` query.

- [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da) [#4529](https://github.com/keystonejs/keystone/pull/4529) Thanks [@timleslie](https://github.com/timleslie)! - Added missing attributes `path`, `viewsIndex`, and `customViews` to `FieldMeta`.

* [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da) [#4509](https://github.com/keystonejs/keystone/pull/4509) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `KeystoneAdminUIConfig.system` with `KeystoneAdminUIConfig.createConfig` to reduce API surface area.

* Updated dependencies [[`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956), [`6912c7b9d`](https://github.com/keystonejs/keystone/commit/6912c7b9dc3d786e61e6f657b0886b258d942c30), [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2), [`fd5daefb4`](https://github.com/keystonejs/keystone/commit/fd5daefb4966b10cf8047386d19db14d325ef8c5), [`44c78319e`](https://github.com/keystonejs/keystone/commit/44c78319ed8cfb1000eb4b1aca5eb361376584b4), [`5c75534f6`](https://github.com/keystonejs/keystone/commit/5c75534f6e9e0f10a6556a1f1dc87b5fdd986dd4), [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`a3908a675`](https://github.com/keystonejs/keystone/commit/a3908a675614fa8690ea641a124cc57c9f963618), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da), [`c1e8def9a`](https://github.com/keystonejs/keystone/commit/c1e8def9a4204d685a796e267edc50f6ef2e8c51), [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da), [`dab8121a6`](https://github.com/keystonejs/keystone/commit/dab8121a6a8eae4c42a5a9ecbdb72a3e8b1eeda4), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409), [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0), [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`f2c7675fb`](https://github.com/keystonejs/keystone/commit/f2c7675fb51ed41e6df8248c76b9322d6de5ee0d)]:
  - @keystone-next/fields@4.0.0
  - @keystone-next/admin-ui@5.0.0
  - @keystone-next/keystone@7.0.0
  - @keystone-next/types@7.0.0
  - @keystone-ui/core@1.0.4
  - @keystone-ui/fields@1.0.3
  - @keystone-next/admin-ui-utils@2.0.3

## 7.0.0

### Patch Changes

- [`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13) [#4493](https://github.com/keystonejs/keystone/pull/4493) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `SerializedFieldMeta.views` to `SerializedFieldMeta.viewsIndex` to makes it clear that this is the index, not the views object itself.

* [`41ad2a010`](https://github.com/keystonejs/keystone/commit/41ad2a010917289ea40fb724b0852e5e15faddd1) [#4474](https://github.com/keystonejs/keystone/pull/4474) Thanks [@timleslie](https://github.com/timleslie)! - Removed unncessary calls to `JSON.stringify` in error messages and generated code.

- [`d712d3c2b`](https://github.com/keystonejs/keystone/commit/d712d3c2bdfc0562eeaa0a76d36b1b9198440102) [#4485](https://github.com/keystonejs/keystone/pull/4485) Thanks [@JedWatson](https://github.com/JedWatson)! - Updating auth extensions to skip access control after the context API changes

* [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab) [#4482](https://github.com/keystonejs/keystone/pull/4482) Thanks [@timleslie](https://github.com/timleslie)! - Removed `config` from type `KeystoneSystem`. The config object is now explicitly passed around where needed to make it clear which code is consuming it.
  Type `KeystoneAdminUIConfig.getAdditionalFiles` now takes a `config` parameter.

- [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4) [#4424](https://github.com/keystonejs/keystone/pull/4424) Thanks [@timleslie](https://github.com/timleslie)! - Added more specific types for `listQuery`, `listQueryMeta`, and the items API.

* [`202767d72`](https://github.com/keystonejs/keystone/commit/202767d721719f1ed4455db5a3b5824e9cd8de70) [#4476](https://github.com/keystonejs/keystone/pull/4476) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `any` with more specific types in internal code.

* Updated dependencies [[`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13), [`c89b43d07`](https://github.com/keystonejs/keystone/commit/c89b43d076f157041c154473221785e41589936f), [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9), [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95), [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62), [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d), [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a), [`2338ed731`](https://github.com/keystonejs/keystone/commit/2338ed73185cd3d33c62fac69064c8a4950dc3fd), [`e78d837b1`](https://github.com/keystonejs/keystone/commit/e78d837b18fba820d3e42cb163420426e2cd3c38), [`57092b7c1`](https://github.com/keystonejs/keystone/commit/57092b7c13845fffd1f3767bb609d203afbc2776), [`914beac0e`](https://github.com/keystonejs/keystone/commit/914beac0ed8e702b1dcd606e2f67c940b053310b), [`dbfef6256`](https://github.com/keystonejs/keystone/commit/dbfef6256b11d94250885f5f3a11d0ba81ad3b08), [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27), [`554917760`](https://github.com/keystonejs/keystone/commit/554917760cc76209c034b96452781c61c60d94d0), [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab), [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6), [`340253f14`](https://github.com/keystonejs/keystone/commit/340253f14235084265c6a02fe5958e476f8554ef), [`224aeb859`](https://github.com/keystonejs/keystone/commit/224aeb859ef30dbea57587efbc54d03074175fba), [`4b019b8cf`](https://github.com/keystonejs/keystone/commit/4b019b8cfcb7bea6f800609da5d07e8c8abfc80a), [`ebc9ad096`](https://github.com/keystonejs/keystone/commit/ebc9ad0962cb15ac9863268cf857216e51d51b98), [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b), [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b), [`7f571dc7d`](https://github.com/keystonejs/keystone/commit/7f571dc7d7c481942ee9d390736e4ea2c083c81c), [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98), [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c), [`3a0e59832`](https://github.com/keystonejs/keystone/commit/3a0e59832b8d910b9cd24c62aab36d2dfa600737), [`5de960512`](https://github.com/keystonejs/keystone/commit/5de960512241e421f72eca496252a9091b9e50c8), [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180), [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4), [`0be537426`](https://github.com/keystonejs/keystone/commit/0be537426bf11b182b1c4387f26357e2ba3e08a5), [`6a364a664`](https://github.com/keystonejs/keystone/commit/6a364a664ce16f741408111054f0f3437a63a194), [`c9c96cf71`](https://github.com/keystonejs/keystone/commit/c9c96cf718fce657ed15a75ae8e836dcedcf5326), [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77), [`202767d72`](https://github.com/keystonejs/keystone/commit/202767d721719f1ed4455db5a3b5824e9cd8de70)]:
  - @keystone-next/admin-ui@4.0.0
  - @keystone-next/keystone@6.0.0
  - @keystone-next/types@6.0.0
  - @keystone-next/fields@3.2.2
  - @keystone-next/admin-ui-utils@2.0.2

## 6.0.0

### Patch Changes

- [`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd) [#4427](https://github.com/keystonejs/keystone/pull/4427) Thanks [@timleslie](https://github.com/timleslie)! - Added a `BaseKeystone` type to replace usage of `any` in all instances.

* [`dfed54074`](https://github.com/keystonejs/keystone/commit/dfed5407477ffa387b38bf76685297941f5d8f84) [#4433](https://github.com/keystonejs/keystone/pull/4433) Thanks [@JedWatson](https://github.com/JedWatson)! - Updated InitPage to fix the error with the new field value shape

* Updated dependencies [[`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd), [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5), [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a)]:
  - @keystone-next/keystone@5.0.0
  - @keystone-next/types@5.0.0
  - @keystone-next/admin-ui@3.1.2
  - @keystone-next/admin-ui-utils@2.0.1
  - @keystone-next/fields@3.2.1

## 5.0.1

### Patch Changes

- [`8543f732b`](https://github.com/keystonejs/keystone/commit/8543f732bfc33c193675c1db385b8e2c15d3f273) [#4371](https://github.com/keystonejs/keystone/pull/4371) Thanks [@timleslie](https://github.com/timleslie)! - Fixed the `generateToken` algorithm to reduce the chance of generating a short token.

* [`2c5135f17`](https://github.com/keystonejs/keystone/commit/2c5135f17ccf94412f074b1bdd04592ea7c25d31) [#4370](https://github.com/keystonejs/keystone/pull/4370) Thanks [@timleslie](https://github.com/timleslie)! - Updated `getMagicAuthLinkSchema` code to use items API rather than adapter. Fixed hard-coding of `listKey: 'User'` when redeeming tokens.

- [`8baad4a14`](https://github.com/keystonejs/keystone/commit/8baad4a147e224bf99daeb91337d2eedea2f879b) [#4374](https://github.com/keystonejs/keystone/pull/4374) Thanks [@timleslie](https://github.com/timleslie)! - Updated library code to no longer require a full `context` object.

* [`2926369a0`](https://github.com/keystonejs/keystone/commit/2926369a00134f361c70b046aa2b9cf7674740f7) [#4404](https://github.com/keystonejs/keystone/pull/4404) Thanks [@JedWatson](https://github.com/JedWatson)! - Added missing spacing between the signin header and form

- [`1cf445cad`](https://github.com/keystonejs/keystone/commit/1cf445cad1017b2ad8b7337649783e75ba4fe7d4) [#4380](https://github.com/keystonejs/keystone/pull/4380) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `attemptAuthentication` to `validateSecret`.

* [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b) [#4387](https://github.com/keystonejs/keystone/pull/4387) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated usage of `Fields` component

- [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567) [#4414](https://github.com/keystonejs/keystone/pull/4414) Thanks [@JedWatson](https://github.com/JedWatson)! - Typed keystone context

* [`0082a3144`](https://github.com/keystonejs/keystone/commit/0082a3144b93850bf4841a8e09f91f43b303088e) [#4383](https://github.com/keystonejs/keystone/pull/4383) Thanks [@timleslie](https://github.com/timleslie)! - Added `findMatchingIdentity` to auth mutations library.

- [`bb747c9cb`](https://github.com/keystonejs/keystone/commit/bb747c9cbe4ebb56eecc70be2e90f77165e5fab6) [#4381](https://github.com/keystonejs/keystone/pull/4381) Thanks [@timleslie](https://github.com/timleslie)! - Refactored `validatedAuthToken` to use `validSecret` internally.

* [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a) [#4378](https://github.com/keystonejs/keystone/pull/4378) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to consistently use `context` rather than `ctx` for graphQL context variables.

- [`2ab785c79`](https://github.com/keystonejs/keystone/commit/2ab785c793231555ac254b24908ca0e8d1ac7c95) [#4372](https://github.com/keystonejs/keystone/pull/4372) Thanks [@timleslie](https://github.com/timleslie)! - Fixed return value of `sendItemPasswordResetLink`.

* [`2dccc86cf`](https://github.com/keystonejs/keystone/commit/2dccc86cfbdbd1b11f3ad63831e1b08d66a12342) [#4379](https://github.com/keystonejs/keystone/pull/4379) Thanks [@timleslie](https://github.com/timleslie)! - Refactored auth mutation logic to make it more clear where side-effects were taking place.

* Updated dependencies [[`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0), [`55a04a100`](https://github.com/keystonejs/keystone/commit/55a04a1004b7f15fcd41b4935d74fd1847c9deeb), [`f4a855c71`](https://github.com/keystonejs/keystone/commit/f4a855c71e966ef3ebc894a3b0f1af51e5182394), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567), [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4), [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`b8c2c48ec`](https://github.com/keystonejs/keystone/commit/b8c2c48ec3746809894af7347c205f6a95329e8d)]:
  - @keystone-next/fields@3.2.0
  - @keystone-ui/core@1.0.3
  - @keystone-next/admin-ui@3.1.1
  - @keystone-next/admin-ui-utils@2.0.0
  - @keystone-next/keystone@4.1.1
  - @keystone-next/types@4.1.1

## 5.0.0

### Minor Changes

- [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213) [#4302](https://github.com/keystonejs/keystone/pull/4302) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add optional `allowedExportsOnCustomViews` export to field views

### Patch Changes

- [`d2ebd1c39`](https://github.com/keystonejs/keystone/commit/d2ebd1c3922f1090bcc8e89c9c70ae880f6a24d9) [#4308](https://github.com/keystonejs/keystone/pull/4308) Thanks [@timleslie](https://github.com/timleslie)! - Updated `createInitialItem` to use the items API rather than direct adapter access.

* [`ebb8d2cdf`](https://github.com/keystonejs/keystone/commit/ebb8d2cdff48d773a7109eb18e3da4cf3dc8ec8a) [#4318](https://github.com/keystonejs/keystone/pull/4318) Thanks [@timleslie](https://github.com/timleslie)! - Updated `updateAuthToken` to use the items API rather than direct adapter access.

* Updated dependencies [[`ad10994d2`](https://github.com/keystonejs/keystone/commit/ad10994d271cff6f95e9e412a7e6830742a6d949), [`80c980452`](https://github.com/keystonejs/keystone/commit/80c9804522d493106321e1832ca07be07437720a), [`d2ebd1c39`](https://github.com/keystonejs/keystone/commit/d2ebd1c3922f1090bcc8e89c9c70ae880f6a24d9), [`add3f67e3`](https://github.com/keystonejs/keystone/commit/add3f67e379caebbcf0880b4ce82cf6a1e89020b), [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213), [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213)]:
  - @keystone-next/keystone@4.1.0
  - @keystone-ui/fields@1.0.2
  - @keystone-next/types@4.1.0
  - @keystone-next/fields@3.1.0
  - @keystone-next/admin-ui@3.1.0

## 4.0.0

### Major Changes

- [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `KeystoneAdminUIConfig.getAdditionalFiles()` and `KeystoneAdminUIConfig.pageMiddleware()` to `system`.
  Renamed `keystone` argument of `SessionStrategy.start`, `SessionStrategy.end` and `SessionStrategy.get` to `system`.

### Patch Changes

- [`aa4f28e51`](https://github.com/keystonejs/keystone/commit/aa4f28e5133b5b91b0b0bbc30589e5566ecd4322) [#4303](https://github.com/keystonejs/keystone/pull/4303) Thanks [@timleslie](https://github.com/timleslie)! - Fixed return values of authentication mutations.

* [`d7d82e90f`](https://github.com/keystonejs/keystone/commit/d7d82e90f45cfc506080af66c180257a7991c750) [#4270](https://github.com/keystonejs/keystone/pull/4270) Thanks [@timleslie](https://github.com/timleslie)! - Simplified the code used to generate graphQL extensions.

- [`d012b4c89`](https://github.com/keystonejs/keystone/commit/d012b4c89c716cfb9acfa15e6dea26030dac236a) [#4287](https://github.com/keystonejs/keystone/pull/4287) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed auth when you're using a listKey other than User

* [`60d30b238`](https://github.com/keystonejs/keystone/commit/60d30b238a73b1530eef71caa46bd41144683248) [#4305](https://github.com/keystonejs/keystone/pull/4305) Thanks [@timleslie](https://github.com/timleslie)! - Updated `attemptAuthentication` to use the items API rather than direct adapter access.

- [`b8e085143`](https://github.com/keystonejs/keystone/commit/b8e0851430be95dff32e611b9e0cae08c695e74e) Thanks [@timleslie](https://github.com/timleslie)! - Updated `authenticatedItem` to use the items API rather than direct adapter access.

- Updated dependencies [[`96a1d5226`](https://github.com/keystonejs/keystone/commit/96a1d52263db625cd117ab85cb6a4a5c3888fdca), [`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46), [`cbf11a69b`](https://github.com/keystonejs/keystone/commit/cbf11a69b8f2c428e2c0a08dd568b3bc0e0d80f4), [`5866cb81f`](https://github.com/keystonejs/keystone/commit/5866cb81fd462b86851deb0a88e5034f1934ac84), [`81a140ee3`](https://github.com/keystonejs/keystone/commit/81a140ee3badc9c032ab02a233a21d011278e173), [`c858a05fe`](https://github.com/keystonejs/keystone/commit/c858a05fee6dc3ed3d80db9fdf50944217bee072), [`d1ea5e667`](https://github.com/keystonejs/keystone/commit/d1ea5e66750175e907f41a58c15fce86a4b4ea77), [`c60b229ec`](https://github.com/keystonejs/keystone/commit/c60b229ec38b4845ac606ee83b9787a97834baf3), [`b2de22941`](https://github.com/keystonejs/keystone/commit/b2de229419cc93b69ee4027c387cab9c8d701488), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882), [`60e061246`](https://github.com/keystonejs/keystone/commit/60e061246bc35b76031f43ff6c07446fe6ad3c6b), [`9fddeee41`](https://github.com/keystonejs/keystone/commit/9fddeee41b7e0dbb3854e5ce6abea4cdeeaa81d0), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882)]:
  - @keystone-next/keystone@4.0.0
  - @keystone-next/admin-ui@3.0.0
  - @keystone-next/types@4.0.0
  - @keystone-next/fields@3.0.1

## 3.0.0

### Patch Changes

- [`0e65409c7`](https://github.com/keystonejs/keystone/commit/0e65409c7416d285fdc4f9da4a7dfb0f652c6cb2) [#4216](https://github.com/keystonejs/keystone/pull/4216) Thanks [@jossmac](https://github.com/jossmac)! - Admin UI tidy: mostly alignment and spacing consolidation.

- Updated dependencies [[`fd4b0d04c`](https://github.com/keystonejs/keystone/commit/fd4b0d04cd9ab8ba12653f1e64fdf08d8cb0c4db), [`d2cfd6106`](https://github.com/keystonejs/keystone/commit/d2cfd6106b44b13254ff1e18601ef943c4211faf), [`c103cde7d`](https://github.com/keystonejs/keystone/commit/c103cde7da198cd7e9adefa763c51e433680e800), [`84e651c3f`](https://github.com/keystonejs/keystone/commit/84e651c3f08fdfc11628490c9d55229dc360f52a), [`3d66ebc87`](https://github.com/keystonejs/keystone/commit/3d66ebc87c4dea7fa70df1209c8d85f539ceccb8), [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed), [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad), [`549a9a06d`](https://github.com/keystonejs/keystone/commit/549a9a06d9dbeb514aad724ece603a3fa7fc8cb6), [`400a6e50c`](https://github.com/keystonejs/keystone/commit/400a6e50cba643f4b142858bb1cac83a50ab020d), [`302afe226`](https://github.com/keystonejs/keystone/commit/302afe226162452c91d9e2f11f5c29552df70c6a), [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3), [`bc198775e`](https://github.com/keystonejs/keystone/commit/bc198775ed27d356017b4a0c6aadeba47e37ce2e), [`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400), [`8291187de`](https://github.com/keystonejs/keystone/commit/8291187de347784f21e4d856ed1eefbc5b8a103b), [`5216e9dc6`](https://github.com/keystonejs/keystone/commit/5216e9dc6894c1a6e81765c0278dc6f7c4cc617b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`36cf9b0a9`](https://github.com/keystonejs/keystone/commit/36cf9b0a9f6c9c2cd3c823146135f86d4152718b), [`6eb4def9a`](https://github.com/keystonejs/keystone/commit/6eb4def9a1be293872e59bcf6472866c0981b45f), [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d), [`2a2a7c00b`](https://github.com/keystonejs/keystone/commit/2a2a7c00b74028b758006219781cbbd22909be85), [`68f1c8fdc`](https://github.com/keystonejs/keystone/commit/68f1c8fdc83f683d13de55b2f3a81eff7639ebf6), [`8e77254a2`](https://github.com/keystonejs/keystone/commit/8e77254a262a4c892263e30044803b463750c3e9), [`b9e93cb66`](https://github.com/keystonejs/keystone/commit/b9e93cb66e8559858ecfbfee3244a761f821b9ec), [`28e2b43d4`](https://github.com/keystonejs/keystone/commit/28e2b43d4a5a4624b3ad6683e5f4f0116a5971f4), [`b89377c9c`](https://github.com/keystonejs/keystone/commit/b89377c9c668c6a4b1be742a177cfb50568d48bf), [`b9e643dc6`](https://github.com/keystonejs/keystone/commit/b9e643dc6c66f75bc6d5b6ced74d91ba3ee7533d), [`cfa0d8275`](https://github.com/keystonejs/keystone/commit/cfa0d8275c89f09b89643c801b208161348b4f65), [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`d2927f78c`](https://github.com/keystonejs/keystone/commit/d2927f78c40bdb21190d06991466566f49a9f08b), [`dce39ca1b`](https://github.com/keystonejs/keystone/commit/dce39ca1be682647b05a2b59710f05e421b140a1), [`0e65409c7`](https://github.com/keystonejs/keystone/commit/0e65409c7416d285fdc4f9da4a7dfb0f652c6cb2)]:
  - @keystone-next/fields@3.0.0
  - @keystone-ui/core@1.0.2
  - @keystone-ui/fields@1.0.1
  - @keystone-next/keystone@3.0.0
  - @keystone-next/admin-ui@2.0.2
  - @keystone-next/types@3.0.0
  - @keystone-ui/button@2.0.1

## 2.0.1

### Patch Changes

- Updated dependencies [[`6c3b566a1`](https://github.com/keystonejs/keystone/commit/6c3b566a130fa4eb5ae57e638b4cff7a16299998), [`c3e4c1e3f`](https://github.com/keystonejs/keystone/commit/c3e4c1e3fdf8ffdbfd785860c26d15e665c5e25e), [`d6139dcf9`](https://github.com/keystonejs/keystone/commit/d6139dcf99f87d78c5e1bb0393349bb52bcb28bd), [`39a5890de`](https://github.com/keystonejs/keystone/commit/39a5890de2021b9e32569ce4011c3e2948d4ede6)]:
  - @keystone-ui/button@2.0.0
  - @keystone-ui/notice@1.0.1
  - @keystone-ui/core@1.0.1
  - @keystone-next/fields@2.0.1
  - @keystone-next/admin-ui@2.0.1

## 2.0.0

### Patch Changes

- [`71b74161d`](https://github.com/keystonejs/keystone/commit/71b74161dfc9d7f0b918a3451cf545935afce94d) [#4146](https://github.com/keystonejs/keystone/pull/4146) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Keep showing the loading state on the init first item page while the next page is loading after the mutation has finished

- Updated dependencies [[`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`71b74161d`](https://github.com/keystonejs/keystone/commit/71b74161dfc9d7f0b918a3451cf545935afce94d), [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`f3c0f79e3`](https://github.com/keystonejs/keystone/commit/f3c0f79e3005aa6a8e867efef4431b83bbdf9898), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797)]:
  - @keystone-next/types@2.0.0
  - @keystone-next/fields@2.0.0
  - @keystone-next/keystone@2.0.0
  - @keystone-next/admin-ui@2.0.0

## 1.0.0

### Major Changes

- [`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c) [#4106](https://github.com/keystonejs/keystone/pull/4106) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c)]:
  - @keystone-ui/button@1.0.0
  - @keystone-ui/core@1.0.0
  - @keystone-ui/fields@1.0.0
  - @keystone-ui/notice@1.0.0
  - @keystone-next/admin-ui@1.0.0
  - @keystone-next/fields@1.0.0
  - @keystone-next/keystone@1.0.0
  - @keystone-next/types@1.0.0
