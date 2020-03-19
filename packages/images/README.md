# Image Service

Keystone includes an image service and corresponding field type. At the moment,
this is only suitable for development and should not be used in a production
environment.

Supports uploading images:

```
POST /upload
```

Suports downloading images:

```
GET /image/{imageid}
GET /image/{imageid}/meta
```

Supports image transforms via URL parameters:

```
fit=cover|contain|fill|inside|outside
width={width}
height={height}
```
