# @keystone-next/example-next-lite

## 2.0.2

### Patch Changes

- [#5601](https://github.com/keystonejs/keystone/pull/5601) [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.2.0`.

- Updated dependencies [[`1c0265171`](https://github.com/keystonejs/keystone/commit/1c0265171db2e334c25d014d855ec919c3d4782c), [`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9), [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b), [`1043243ff`](https://github.com/keystonejs/keystone/commit/1043243ff5a22bb067cf4aa6e46d28a529203121)]:
  - @keystone-next/keystone@17.1.0
  - @keystone-next/fields@8.1.0
  - @keystone-next/admin-ui@14.1.1

## 2.0.1

### Patch Changes

- Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`18ae28bde`](https://github.com/keystonejs/keystone/commit/18ae28bde943c140332ad5e0cd0b5238555fb1b8), [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fbf5f77c5`](https://github.com/keystonejs/keystone/commit/fbf5f77c515b2413c4019b4a521dd4f4aa965276), [`dbc62ff7c`](https://github.com/keystonejs/keystone/commit/dbc62ff7c71ca4d4db1fab76f3e0ab729af5b80c), [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6), [`91e603d7a`](https://github.com/keystonejs/keystone/commit/91e603d7a686185c145bcbc445a27939f94aafa8), [`a6cdf3da8`](https://github.com/keystonejs/keystone/commit/a6cdf3da8a9b2ca943048fee6cacd376ea4aae50), [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc), [`ddf51724a`](https://github.com/keystonejs/keystone/commit/ddf51724ab2043f395d1d197213748c06a5300b7), [`d216fd04c`](https://github.com/keystonejs/keystone/commit/d216fd04c92ec594fb9b448025fc3e23fe6dfdad), [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a), [`2df2fa021`](https://github.com/keystonejs/keystone/commit/2df2fa0213146adab79e5e17c60d43259041093d), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`f76938ac2`](https://github.com/keystonejs/keystone/commit/f76938ac223194ce401179fd9fa1226e11077277), [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351)]:
  - @keystone-next/admin-ui@14.1.0
  - @keystone-next/fields@8.0.0
  - @keystone-next/keystone@17.0.0

## 2.0.0

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

* [#5388](https://github.com/keystonejs/keystone/pull/5388) [`29c9a36b7`](https://github.com/keystonejs/keystone/commit/29c9a36b70b7ba689b049ce6c1555806fbfc8e1e) Thanks [@timleslie](https://github.com/timleslie)! - Updated example project to use the new `db.provider` config option over the deprecated `db.adapter` option.

- [#5366](https://github.com/keystonejs/keystone/pull/5366) [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.1.3`.

- Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`3d3fb860f`](https://github.com/keystonejs/keystone/commit/3d3fb860faa303cbfe75eeb0855a8a575113320c), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`588f31ddc`](https://github.com/keystonejs/keystone/commit/588f31ddce15ab752a987a1dc1429fa1d6f03d7c), [`781b3e5ab`](https://github.com/keystonejs/keystone/commit/781b3e5abcf9a8b6d29c86d6470adfd08b4413c8), [`49025d1ad`](https://github.com/keystonejs/keystone/commit/49025d1ad0d85c4f80e5430a365c4fc78db96c92), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`d9e1acb30`](https://github.com/keystonejs/keystone/commit/d9e1acb30e384ce88e6681ba9d299d917dea97d9), [`24e62e29c`](https://github.com/keystonejs/keystone/commit/24e62e29c51c04448a272a25292251fc13e06d7a), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`6861ecb40`](https://github.com/keystonejs/keystone/commit/6861ecb40345434f8d070950a3c8fb85f3d59994), [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`202d362f3`](https://github.com/keystonejs/keystone/commit/202d362f38d0c8827263e6cd2d286d8dcbdd22ad), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`962cde7e3`](https://github.com/keystonejs/keystone/commit/962cde7e32ec7ce23d15180f315549f4f34069ee), [`f67497c1a`](https://github.com/keystonejs/keystone/commit/f67497c1a9dd7462e7d6564250712f5456dc5cb0), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`76692d266`](https://github.com/keystonejs/keystone/commit/76692d26642eabf23d2ef038dec35d35d4e35d31), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`ad1776b74`](https://github.com/keystonejs/keystone/commit/ad1776b7418b7a0d1c8e5def8d82051752c01aa9), [`309596591`](https://github.com/keystonejs/keystone/commit/3095965915adbb93ff6879d4e9bf3f0dd504708c), [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853), [`a73aea7d7`](https://github.com/keystonejs/keystone/commit/a73aea7d78d4c520856f06f9d1b79efe4b36993b)]:
  - @keystone-next/admin-ui@14.0.0
  - @keystone-next/keystone@16.0.0
  - @keystone-next/fields@7.0.0

## 1.0.4

### Patch Changes

- Updated dependencies [[`901817fed`](https://github.com/keystonejs/keystone/commit/901817fedf4bcfb269416c3c68093ae0263f4d00), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1a4db6c87`](https://github.com/keystonejs/keystone/commit/1a4db6c87c17706c8e5db2816e0a6b1b8f79e217), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`5c4b48636`](https://github.com/keystonejs/keystone/commit/5c4b4863638cffa794dd1b02c445a87655a4178c), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b), [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`bc21855a7`](https://github.com/keystonejs/keystone/commit/bc21855a7ff6dd4dbc278b3e15c9157de765e6ba)]:
  - @keystone-next/keystone@15.0.0
  - @keystone-next/admin-ui@13.0.0
  - @keystone-next/fields@6.0.0
