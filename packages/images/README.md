# Image Service

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
