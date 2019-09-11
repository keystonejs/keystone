Adds a `cookieMaxAge` and `secureCookies` option to the keystone constructor. 

These will default to 30 days for `cookieMaxAge` and `true` in production `false` in other environments for `secureCookies`.

### Usage 
```javascript
const keystone = new Keystone({
  cookieMaxAge: 1000 * 60 * 60 * 24 * 7, // 1 week 
  secureCookies: true,
});
```