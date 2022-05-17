---
'@keystone-6/core': major
---

Large changes to the files and images fields.

#### Breaking

##### Move of `image` and `files` in the keystone config into new option `storage`

The `image` and `files` config options have been removed from Keystone's config - the configuration has
been moved into the `storage` option.

Old:

```ts
export default config({
    image: { upload: 's3' },
    s3: {
        bucketName: S3_BUCKET_NAME,
        region: S3_REGION,
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY
    },
    lists: { 
        images: { fields: { image() }
        /* ... */
    },
    /* ... */
})
```

New:

```ts
export default config({
    storage: {
        my_image_storage: {
            kind: 's3',
            type: 'image',
            bucketName: S3_BUCKET_NAME,
            region: S3_REGION,
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY
        },
    }
    lists: {
        images: { fields: image({ storage: 'my_image_storage' }) }
        /* ... */
    },
    /* ... */
})
```

##### Remove use of refs for `images` and `files`

Refs were an interesting situation! They allowed you to link images stored in your storage source (s3 or local), and use the same
image anywhere else images are used. This causes a bunch of complication, and prevented Keystone ever reliably being able
to remove images from your source, as it couldn't easily track where images were used.

To simplify things for you and us, we're removing `refs` as a concept, but don't panic just yet, we are conceptually replacing
them with something you are already familiar with: `relationships`.

If you wanted refs, where images could be available in multiple places, our new recommendation is:

```ts
export default config({
    storage: {
        my_image_storage: {
            /* ... */
        },
    }
    lists: {
        images: { fields: { image({ storage: 'my_image_storage' }) } },
        user: { fields: avatar: relationship({ ref: 'images' })}
        blog: { fields: photos: relationship({ ref: 'images', many: true })}
        /* ... */
    },
    /* ... */
})
```

This allows mirroring of the old functionality, while allowing us to add the below feature/breaking change.

##### Images will now be deleted from the source by default

Before this change, if you uploaded a file or image, Keystone would never remove it from where it was stored. The inability to tidy up unused
files or images was unwelcome. With the removal of `ref`, we can no remove things from the source, and this will be done by default.

If you don't want files or images removed, we recommend storing them as a `relationship`, rather than on items themselves, so the files
or images persist separate to lists that use them.

If you want the existing behaviour of keystone, set `preserve: true` on the storage instead.

##### `file` and `image` URLs now use `generatedUrl`, allowing more control over what is returned to the user

##### Local images no longer need a baseUrl

Previously, if you were using local storage (you scallywag), you needed to provide a path for keystone to host images on. You
can still do this, but if you plan on serving them from another location, you can opt into not doing this.


```ts
{
-   baseUrl: '/images'
+   serverRoute: {
+       path: '/images'
+   }
}
```

#### New bits

S3 support is no longer 'experimental'
S3 supports proxying through the keystone server
S3 signing is now supported
`preserve` flag added to both `file` and `image` fields to allow removal of files from the source
Support for multiple `storage` sources - each `image` and `file` field can now use its own config (or not)

#### Changes


