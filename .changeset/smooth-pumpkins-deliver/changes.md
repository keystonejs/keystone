Adds a `cookieMaxAge` and `secureCookies` option to the keystone constructor. 

These will default to 1 day and `true` in production. Or `null` and `false` in other environments.

### Usage 
```javascript
const keystone = new Keystone({
  cookieMaxAge: 1000 * 60 * 60 * 24 * 7, // 1 week 
  secureCookies: true,
});
```