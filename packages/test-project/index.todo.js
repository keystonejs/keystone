/*

keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  getRole(item) {
    return item.isAdmin ? 'user-admin' : 'user';
  },
  resetPasswordEmailConfig: {
    emailProvider: hereIsMyConfiguredMandrillEmailSender,
    template: './emails/forgotten-password.pug',
  },
});

server.app.get('/api/forgot-password', async (req, res) => {
  const token = await keystone.auth.User.password.generateResetToken({
    username: req.query.username,
  });
  if (token) {
    // send email
  }
  return res.json({ success: true });
});

server.app.get('/api/reset-password', async (req, res) => {
  const user = await keystone.auth.User.password.validateResetToken({
    token: req.query.token,
  });
  if (!user) {
    return res.json({ success: true });
  }
  const result = await keystone.signIn(user);
  res.json(result);
});

server.app.get('/api/signin-with-twitter', async (req, res) => {
  const result = await keystone.auth.User.twitter.validate({
    token: req.query.token,
    tokenSecret: req.query.tokenSecret,
  });

  // => {
  //   item: item || null,
  //   twitterSessionId: ID,
  //   twitterUser: 'jedwatson',
  //   name: 'Jed Watson',
  //   ...
  // }
  if (!result.success) {
    res.json({ error: result });
  } else if (result.item) {
    const session = await keystone.signIn(result.item, {
      twitterSessionId: result.twitterSessionId,
    });
    res.json({ signedIn: true, user: result.item, session });
    // } else {
    //   const user = await keystone.lists.User.create({
    //     name: result.twitterName,
    //     twitterId: result.twitterId,
    //   });
    //   const session = await keystone.signIn(user);
    //   res.json(session);
  } else {
    res.json({ signedIn: false, twitterStuff: result });
  }
});

*/
