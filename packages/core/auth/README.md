# Authentication Strategies

## Twitter

### Usage

#### 0-step new user creation

```javascript
const result = await keystone.auth.User.twitter.validate({ token, tokenSecret });
let userItem = result.item;

if (!result.success) {
  // An error occured validating the twitter tokens, so we can't continue
  // Important to stop here to avoid bad actors sending fake tokens
  throw new Error('Unable to validate Twitter tokens');
} else if (result.newUser) {
  // Successfully validated twitter tokens
  // But were unable to find an associated user in Keystone
  // So we create a new one immediately:
  const newUser = await keystone.createItem('Users', { role: 'user' });
  userItem = newUser;
}

// Connect up the Twitter login session and the user item in Keystone
await keystone.auth.User.twitter.connectItem({ ...result, item: userItem });

// finally, we create the logged in session now that we have all the info we
// need
await keystone.session.create(req, { item: userItem, list: keystone.lists.Users } );
```

#### Multi-step new user creation

eg; After giving permission to Twitter, we then want to ask for an email, an
address, their social security info, their mother's maiden name, and their
bank's password over multiple server requests / page refreshes:

```javascript
const result = await keystone.auth.User.twitter.validate({ token, tokenSecret });

if (!result.success) {
  // An error occured validating the twitter tokens, so we can't continue
  // Important to stop here to avoid bad actors sending fake tokens
  throw new Error('Unable to validate Twitter tokens');
} else if (!result.newUser) {
  // All validated and an existing user is associated with that twitter
  // account, Log the user in
  await keystone.session.create(req, result);
} else {
  // Successfully validated twitter tokens
  // But were unable to find an associated user in Keystone
  // So we pause the validation step, to be picked up later (possibly at a
  // future request)
  await keystone.auth.User.twitter.pauseValidation(req, result);
}

// ...
// ... Do some other things, maybe make a sandwich if you want
// ...

// Finally, we have enough to create a new user
const newUser = await keystone.createItem('Users', { role: 'user' });

// Now that we have the necessary info, resume validation
await keystone.auth.User.twitter.connectItem({ req, item: result.item });

// finally, we create the logged in session now that we have all the info we
// need
await keystone.session.create(req, { item: newUser, list: keystone.lists.Users } );
```
