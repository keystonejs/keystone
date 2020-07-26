# @keystonejs/demo-custom-fields

## 1.0.6

### Patch Changes

- [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7) [#3227](https://github.com/keystonejs/keystone/pull/3227) Thanks [@Vultraz](https://github.com/Vultraz)! - Moved `name` config option from Keystone constructor to Admin UI constructor.

* [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a) [#3171](https://github.com/keystonejs/keystone/pull/3171) Thanks [@timleslie](https://github.com/timleslie)! - Hooks no longer recieve a `{ query }` argument. This functionality has been superseded by `context.executeGraphQL()`.

  ```
  {
    ...
    hooks: {
      resolveInput: async ({ actions: { query } } ) => {
        ...
        const { data, errors } = await query(`{ ... }`);
        ...
      }
    }
  }
  ```

  should be changed to

  ```
  {
    ...
    hooks: {
      resolveInput: async ({ context } ) => {
        ...
        const { data, errors } = await context.executeGraphQL({ query: `{ ... }` });
        ...
      }
    }
  }
  ```

  See [the docs](/docs/discussions/server-side-graphql.md) for more details on how to use `context.executeGraphQL()`.

- [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669) [#3146](https://github.com/keystonejs/keystone/pull/3146) Thanks [@Vultraz](https://github.com/Vultraz)! - Migrated to @primer/octicons-react v10.

- Updated dependencies [[`5ad84ccd8`](https://github.com/keystonejs/keystone/commit/5ad84ccd8d008188e293629e90a4d7e7fde55333), [`61cdafe20`](https://github.com/keystonejs/keystone/commit/61cdafe20e0a22b5a1f9b6a2dcc4aefa45a26902), [`8480f889a`](https://github.com/keystonejs/keystone/commit/8480f889a492d83ee805f19877d49fd112117939), [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7), [`02f069f0b`](https://github.com/keystonejs/keystone/commit/02f069f0b6e28ccfe6d5cdeb59ab01bde27a655e), [`e6117d259`](https://github.com/keystonejs/keystone/commit/e6117d259e0ceeacc0b42e3db0bd39dd39537090), [`4b95d8a46`](https://github.com/keystonejs/keystone/commit/4b95d8a46d53d32b2873e350716311441cd37262), [`e114894d1`](https://github.com/keystonejs/keystone/commit/e114894d1bbcea8940cf14486fc336aa8d112da7), [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a), [`56e1798d6`](https://github.com/keystonejs/keystone/commit/56e1798d6815723cfba01e6d7dc6b4fe73d4447b), [`06f86c6f5`](https://github.com/keystonejs/keystone/commit/06f86c6f5c573411f0efda565a269d1d7ccb3c66), [`0cbb7e7b0`](https://github.com/keystonejs/keystone/commit/0cbb7e7b096c2a99685631a601fce7273d03cc70), [`81b4df318`](https://github.com/keystonejs/keystone/commit/81b4df3182fc63c583e3fae5c05c528b678cab95), [`e6909b003`](https://github.com/keystonejs/keystone/commit/e6909b0037c9d3dc4fc6131da7968a424ce02be9), [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504), [`3ce644d5f`](https://github.com/keystonejs/keystone/commit/3ce644d5f2b6e674adb2f155c0e729536079347a), [`622cc7d69`](https://github.com/keystonejs/keystone/commit/622cc7d6976ecb71f5b135c931ac0fcb4afdb1c7), [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669)]:
  - @keystonejs/keystone@12.0.0
  - @keystonejs/app-admin-ui@7.1.0
  - @keystonejs/fields@14.0.0
  - @keystonejs/adapter-mongoose@9.0.0
  - @keystonejs/app-graphql@6.0.0
  - @arch-ui/fields@3.0.3

## 1.0.5

### Patch Changes

- Updated dependencies [[`c235e34c7`](https://github.com/keystonejs/keystone/commit/c235e34c7a72cd05b05b3d1af08c93c1e98a8e91), [`dec3d336a`](https://github.com/keystonejs/keystone/commit/dec3d336adbe8156722fbe65f315a57b2f5c08e7), [`78a5d5a45`](https://github.com/keystonejs/keystone/commit/78a5d5a457f80bba592e5a81056125b11469a5a8), [`2e5a93dee`](https://github.com/keystonejs/keystone/commit/2e5a93dee5be11bf020c1397c7653bdf07a90d24), [`1c69f4dc8`](https://github.com/keystonejs/keystone/commit/1c69f4dc8ab1eb23bc0a34850f48a51f2e9f1dce), [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8), [`950f23443`](https://github.com/keystonejs/keystone/commit/950f23443ef8f1a176a3cf6b039f93a29d954f5e), [`3c3c67abb`](https://github.com/keystonejs/keystone/commit/3c3c67abb5ec82155fec893d389eac3bbeb12bbd)]:
  - @keystonejs/fields@13.0.0
  - @keystonejs/keystone@11.1.0
  - @keystonejs/app-admin-ui@7.0.3

## 1.0.4

### Patch Changes

- Updated dependencies [[`8df24d2ab`](https://github.com/keystonejs/keystone/commit/8df24d2ab4bed8a7fc1a856c20a571781dd7c04e), [`083621c90`](https://github.com/keystonejs/keystone/commit/083621c9043a26af6fd48a57646e96b062c625a1), [`2a7f22062`](https://github.com/keystonejs/keystone/commit/2a7f220628bb0b4d58d0a4dca370e8922a25da80), [`37f57c39a`](https://github.com/keystonejs/keystone/commit/37f57c39ac490fa8a67499ac7ac75a8c04af41bf), [`33046a66f`](https://github.com/keystonejs/keystone/commit/33046a66f33a82cf099880303b44d9736344667d), [`7c38e2671`](https://github.com/keystonejs/keystone/commit/7c38e267143491f38699326f02764f40f337d416), [`835866e1a`](https://github.com/keystonejs/keystone/commit/835866e1a2954113d809c9f0bac186485ac6212b)]:
  - @keystonejs/keystone@11.0.0
  - @keystonejs/app-admin-ui@7.0.2
  - @keystonejs/adapter-mongoose@8.1.3

## 1.0.3

### Patch Changes

- [`105fa7dbc`](https://github.com/keystonejs/keystone/commit/105fa7dbcee6a259eb5f9ef084b120a215467ae7) [#3077](https://github.com/keystonejs/keystone/pull/3077) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a null check to the code that allows default values to work.

- Updated dependencies [[`4104e1f15`](https://github.com/keystonejs/keystone/commit/4104e1f15c545c05f680e8d16413862e875ca57a), [`c2ebb51c7`](https://github.com/keystonejs/keystone/commit/c2ebb51c786297879fe9fac2007804055631e9e2), [`c3faeeff4`](https://github.com/keystonejs/keystone/commit/c3faeeff41f9b29a9fc31ca4e7778b596fcb20b9), [`f493eecc3`](https://github.com/keystonejs/keystone/commit/f493eecc34a0f1a6ba9f8eea1c34882784c1b5fe), [`b61987552`](https://github.com/keystonejs/keystone/commit/b619875520aa3b10d104794140f7977ffaebfbf0), [`397982096`](https://github.com/keystonejs/keystone/commit/39798209642571d3ba698e11410f5161cd1943bb), [`538378e4e`](https://github.com/keystonejs/keystone/commit/538378e4eb143dbe6e7a943408e0af302eb86b85), [`9f67e0e91`](https://github.com/keystonejs/keystone/commit/9f67e0e912b4f7dcb90fcb07c4b30bd6c45de464), [`ea9608342`](https://github.com/keystonejs/keystone/commit/ea960834262cec66f52fa39c1b3b07b702b3cd4d), [`8fddd97b2`](https://github.com/keystonejs/keystone/commit/8fddd97b20f1928ff7306d5d0dcc96e58ffe55fb), [`fdfb01417`](https://github.com/keystonejs/keystone/commit/fdfb01417b6d330342f4b6c326767c9567e35ca5), [`83548d43d`](https://github.com/keystonejs/keystone/commit/83548d43d661959a34a6de475994430ee1de3a1d), [`5ea313461`](https://github.com/keystonejs/keystone/commit/5ea313461aa2cba310b2634cc87780092c84b5be), [`cbfc67470`](https://github.com/keystonejs/keystone/commit/cbfc6747011329f7210e79ebe228f44ed8607321), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`3204ae785`](https://github.com/keystonejs/keystone/commit/3204ae78576b0ab5649d5f5ae9cfbb1def347af1), [`da8ca8835`](https://github.com/keystonejs/keystone/commit/da8ca8835a910cc9b2f53e12ddaef88ffc194695), [`04c57fa78`](https://github.com/keystonejs/keystone/commit/04c57fa7840714d3413e093d468b78d740c95c9a), [`fd4e9100a`](https://github.com/keystonejs/keystone/commit/fd4e9100a636e0654db45d2471ce47a19b753647), [`f33388b50`](https://github.com/keystonejs/keystone/commit/f33388b5061d59747ab46e238f43e9b08f52bd1e), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`649017fbd`](https://github.com/keystonejs/keystone/commit/649017fbd5ea17c36e8c49d44836e1f2bcae2692), [`6ab523476`](https://github.com/keystonejs/keystone/commit/6ab523476ceca5ad57e7833ebd172b2da6c0b5fd), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b), [`9ca0733e5`](https://github.com/keystonejs/keystone/commit/9ca0733e57b525a7efdfdedfb7c80364e186994e), [`a8d444b25`](https://github.com/keystonejs/keystone/commit/a8d444b25109f84e9d4659f2a260c5ad65f93393), [`7203c5889`](https://github.com/keystonejs/keystone/commit/7203c588901c46fae1550f3596cab43a1dd5052a), [`d2390b703`](https://github.com/keystonejs/keystone/commit/d2390b703d30e0b4264ab6ed9b1ba4d7bb9fca6c), [`34a9816d3`](https://github.com/keystonejs/keystone/commit/34a9816d3c40a35409be735e748cea2c6d5aa895), [`64c0d68ac`](https://github.com/keystonejs/keystone/commit/64c0d68acb1ee969097a8fe59b5c296473790c5c), [`60db743aa`](https://github.com/keystonejs/keystone/commit/60db743aa79f6590d6a3ebb0169021f1c36f64cc), [`326242533`](https://github.com/keystonejs/keystone/commit/3262425335de5eee6979e38ebb45f19a22c1ee1a), [`b15221ac2`](https://github.com/keystonejs/keystone/commit/b15221ac21746b1380ddb31395cdd386d52920a9), [`16649fa55`](https://github.com/keystonejs/keystone/commit/16649fa556ae3723ca97eb0752653259ccae4bc2), [`ba363d9a8`](https://github.com/keystonejs/keystone/commit/ba363d9a82d3ca3ec464547a5d9e38354bc2a172), [`170faf568`](https://github.com/keystonejs/keystone/commit/170faf568fef5b74147791476b466dc7a25c7d6f), [`927150d81`](https://github.com/keystonejs/keystone/commit/927150d81e297fdb5c8ccad087ea255b861dfe32), [`c7599a46f`](https://github.com/keystonejs/keystone/commit/c7599a46f05108b10b3a805a20b77b4d834e616d), [`b696b2acb`](https://github.com/keystonejs/keystone/commit/b696b2acbf7def8dba41f46ccef5ff852703b95a), [`d970580e1`](https://github.com/keystonejs/keystone/commit/d970580e14904ba2f2ac5e969257e71f77ab67d7), [`1cc3deaf0`](https://github.com/keystonejs/keystone/commit/1cc3deaf0b0a48aecb0f0f2454f4fe2634e1da5f), [`070519dbe`](https://github.com/keystonejs/keystone/commit/070519dbec289b759759343d084bc5d2de9d4b37), [`10babad4b`](https://github.com/keystonejs/keystone/commit/10babad4b4135738bc0633b113e5c96d3ddb9e9f), [`24f5ab51c`](https://github.com/keystonejs/keystone/commit/24f5ab51c69d744fb0e1f47a0723c2cc70492010), [`de27d2c16`](https://github.com/keystonejs/keystone/commit/de27d2c16b520ae5126a74efb85c70ae88ae6b60), [`c35f9cd1c`](https://github.com/keystonejs/keystone/commit/c35f9cd1cba5bf27eb9cf7cc1a113716bc4a50ef)]:
  - @keystonejs/keystone@10.0.0
  - @keystonejs/app-admin-ui@7.0.0
  - @keystonejs/fields@12.0.0
  - @keystonejs/app-graphql@5.1.8
  - @arch-ui/fields@3.0.2
  - @keystonejs/adapter-mongoose@8.1.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`2b0f6441`](https://github.com/keystonejs/keystone/commit/2b0f6441e50787a4a82f417b573078717b39e9be), [`a124417f`](https://github.com/keystonejs/keystone/commit/a124417fddc75889db5e4e8e0d5625fb4af12590), [`54931d75`](https://github.com/keystonejs/keystone/commit/54931d75d3f26f4f300c2c4c3ee65ed3183b4a6a), [`f9604621`](https://github.com/keystonejs/keystone/commit/f9604621048afceb071a43c7b8d36d944555487f), [`3e5a8962`](https://github.com/keystonejs/keystone/commit/3e5a8962cc982765574464537904008be975b446), [`5a58bde6`](https://github.com/keystonejs/keystone/commit/5a58bde636f551f2d241086d47781d3c88852b99), [`e9a0de2c`](https://github.com/keystonejs/keystone/commit/e9a0de2cc03c211beca01ec206244105bdca6afc), [`3b0f4137`](https://github.com/keystonejs/keystone/commit/3b0f4137df4112c79e6db57ae68fe04ad338da4c), [`15c57317`](https://github.com/keystonejs/keystone/commit/15c573178fa056912503f3ed83efeccceabba3ec), [`d60e2ca9`](https://github.com/keystonejs/keystone/commit/d60e2ca91ab4a7dd815e030bcc92991c3380fa7e), [`94d55b8f`](https://github.com/keystonejs/keystone/commit/94d55b8fc3a334a556c19765063e9efb594b41a7), [`59ed6310`](https://github.com/keystonejs/keystone/commit/59ed6310bacc76f571639de048689becbedbeac5), [`2709a6b5`](https://github.com/keystonejs/keystone/commit/2709a6b512fe636d979837599b67bdb17b2517b1)]:
  - @keystonejs/app-admin-ui@6.0.1
  - @keystonejs/fields@11.0.0
  - @keystonejs/keystone@9.0.1

## 1.0.1

### Patch Changes

- [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27) [#2919](https://github.com/keystonejs/keystone/pull/2919) Thanks [@Vultraz](https://github.com/Vultraz)! - Made handling of field-specific config options more consistent.

* [`572c6a61`](https://github.com/keystonejs/keystone/commit/572c6a614f39dfa5c5c57ec60388044a8e8f1272) [#2883](https://github.com/keystonejs/keystone/pull/2883) Thanks [@Vultraz](https://github.com/Vultraz)! - Used new FieldDescription syntax.

- [`e2800875`](https://github.com/keystonejs/keystone/commit/e28008756cbcc1e07e012a9fdb0cfa0ad94f3673) [#2897](https://github.com/keystonejs/keystone/pull/2897) Thanks [@Vultraz](https://github.com/Vultraz)! - Elevated isOrderable, isRequired, and adminDoc keys to direct FieldController properties.

* [`60e2c7eb`](https://github.com/keystonejs/keystone/commit/60e2c7eb2298a016c68a19a056040a3b45beab2a) [#2865](https://github.com/keystonejs/keystone/pull/2865) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed a bunch more duplicate field class names (no functional changes).

* Updated dependencies [[`4d3efe0f`](https://github.com/keystonejs/keystone/commit/4d3efe0fb65e0155c130cf3e0c378f024965f46d), [`c506dfa8`](https://github.com/keystonejs/keystone/commit/c506dfa81a5ef3640716f69412b1a37c947d4f95), [`72e0a4e1`](https://github.com/keystonejs/keystone/commit/72e0a4e19942df11c72d11c2cf6ee9bc94300d87), [`5e20df81`](https://github.com/keystonejs/keystone/commit/5e20df81aaa8b464071c1e0adc64635752163362), [`a1c9c372`](https://github.com/keystonejs/keystone/commit/a1c9c372c274de8cb0d0012c0d5c20c46f356b0a), [`04dffb3c`](https://github.com/keystonejs/keystone/commit/04dffb3c0abd03712df431ff57b3271b10f4f47b), [`bfa3a287`](https://github.com/keystonejs/keystone/commit/bfa3a287a40f625b74d1f430dff6826296bb7019), [`12126788`](https://github.com/keystonejs/keystone/commit/121267885eb3e279eb5b6d035568f547323dd245), [`d639624d`](https://github.com/keystonejs/keystone/commit/d639624db8615b52731af56fea0ae9c573ef38a1), [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`3e9bfb85`](https://github.com/keystonejs/keystone/commit/3e9bfb854196dffcca98f60c5de9ad463d79f4f2), [`5ec4e5d5`](https://github.com/keystonejs/keystone/commit/5ec4e5d547503baeae2ac2f6317b66c2ebae93b7), [`6e507838`](https://github.com/keystonejs/keystone/commit/6e5078380e1d17eb2884554eef114fdd521a15f4), [`c8e52f3b`](https://github.com/keystonejs/keystone/commit/c8e52f3ba892269922c1ed3af0c2114f07387704), [`3cd5f205`](https://github.com/keystonejs/keystone/commit/3cd5f205348311a2ad00875782530b96c3c477af), [`08087998`](https://github.com/keystonejs/keystone/commit/08087998af0045aa45b26d721f75639cd279ae1b), [`6c19f04c`](https://github.com/keystonejs/keystone/commit/6c19f04c0e5ce972283562daebe60c9f4a29c55c), [`fcb9f2c1`](https://github.com/keystonejs/keystone/commit/fcb9f2c1751ec866adddeb6946e8ab60ffef06e6), [`547fd837`](https://github.com/keystonejs/keystone/commit/547fd8373797f0cb5d8dd0acd193750686053fac), [`2a1e4f49`](https://github.com/keystonejs/keystone/commit/2a1e4f49d7f234c49e5b04440ff786ddf3e9e7ed), [`9e2e0071`](https://github.com/keystonejs/keystone/commit/9e2e00715aff50f2ddfedf3dbc14f390275ff23b), [`b5c44934`](https://github.com/keystonejs/keystone/commit/b5c4493442c5e4cfeba23c058a9a6819c628aab9), [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d), [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27), [`d8584765`](https://github.com/keystonejs/keystone/commit/d85847652e224e5000e036be2df0b8a45ab96385), [`405d0ae1`](https://github.com/keystonejs/keystone/commit/405d0ae1d332e31423db43f58ac26c25abbe94a3), [`121cb02d`](https://github.com/keystonejs/keystone/commit/121cb02d1c9886a24bfa14c985ede48d6a56edca), [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d), [`285026a0`](https://github.com/keystonejs/keystone/commit/285026a04ffce23ab72d7defc18ced2e980b0de4), [`d4811b02`](https://github.com/keystonejs/keystone/commit/d4811b0231c5d64e95dbbce57531df0931d4defa), [`e2800875`](https://github.com/keystonejs/keystone/commit/e28008756cbcc1e07e012a9fdb0cfa0ad94f3673), [`60e2c7eb`](https://github.com/keystonejs/keystone/commit/60e2c7eb2298a016c68a19a056040a3b45beab2a), [`99da34a8`](https://github.com/keystonejs/keystone/commit/99da34a8db26b8861b08cee330407605e787a80c), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533), [`9a94cee8`](https://github.com/keystonejs/keystone/commit/9a94cee8e59fdf7956d82887390dfb84bf6185fa), [`bcf03a7f`](https://github.com/keystonejs/keystone/commit/bcf03a7f8067a3f29f22dde397b957bf5cee1a07), [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a), [`1ca8951c`](https://github.com/keystonejs/keystone/commit/1ca8951c71c5af3b0ff338a9a6a8733231fb90c4), [`d7eb2601`](https://github.com/keystonejs/keystone/commit/d7eb260144d2aa31e7ef4e636e7a23f91dc37285)]:
  - @keystonejs/app-admin-ui@6.0.0
  - @keystonejs/fields@10.0.0
  - @keystonejs/keystone@9.0.0
  - @keystonejs/adapter-mongoose@8.1.0
  - @keystonejs/app-graphql@5.1.7

## 1.0.0

### Major Changes

- [`9b8cfbb2`](https://github.com/keystonejs/keystone/commit/9b8cfbb230480a74818c87e9a53b05a5154a24fe) [#2794](https://github.com/keystonejs/keystone/pull/2794) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a new demo to help people creating custom field types.

### Patch Changes

- Updated dependencies [[`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a)]:
  - @keystonejs/app-admin-ui@5.11.1
  - @arch-ui/controls@0.1.8
  - @arch-ui/fields@3.0.1
  - @arch-ui/icons@0.1.1
  - @arch-ui/lozenge@0.0.16
  - @keystonejs/fields@9.0.4
