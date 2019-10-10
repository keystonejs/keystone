Reduced reliance on environmental variables in AdminUI.

Experimental features will now be `false` by default in development and must be explicitly turned on with config:

```
 new AdminUIApp({ experimentalFeatures: true })
```

The webpack build mode will still default to `development` unless the environmental variable `NODE_ENV` is set to `production`. However this can now also be configured in the constructor allowing users more control over how environmental variables are configured. 

```
 new AdminUIApp({ buildMode: 'production' })
```
