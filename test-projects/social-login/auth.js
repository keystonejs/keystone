const {
  GoogleAuthStrategy,
  FacebookAuthStrategy,
  TwitterAuthStrategy,
  GitHubAuthStrategy,
} = require('@keystonejs/auth-passport');

const { google, facebook, twitter, github } = require('./config');

if (google) {
  module.exports.authGoogle = {
    type: GoogleAuthStrategy,
    idField: 'googleId',
    appId: google.appId,
    appSecret: google.appSecret,
    loginPath: '/auth/google',
    callbackPath: '/auth/google/callback',

    loginPathMiddleware: (req, res, next) => {
      // Pull redirect URLs off of the query string
      const { successRedirect = '/profile', failureRedirect = '/' } = req.query || {};
      // Store them in a cookie so we can access them again later
      res.cookie('redirects', JSON.stringify({ successRedirect, failureRedirect }));
      // Continue with social authing
      next();
    },

    callbackPathMiddleware: (req, res, next) => {
      console.log('Google callback URL fired');
      next();
    },

    // Called when there's no existing user for the given googleId
    // Default: resolveCreateData: () => ({})
    resolveCreateData: (
      { createData, serviceProfile, actions: { pauseAuthentication } },
      req,
      res
    ) => {
      // If we don't have the right data to continue with a creation
      if (!createData.email) {
        // then we pause the flow
        pauseAuthentication();
        const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
        // And redirect the user to a page where they can enter the data.
        // Later, the `resolveCreateData()` method will be re-executed this
        // time with the complete data.
        res.redirect(
          `/auth/google/step-2?email=${encodeURIComponent(email)}&authType=${
            GoogleAuthStrategy.authType
          }`
        );
        return;
      }

      return createData;
    },

    // Once a user is found/created and successfully matched to the
    // googleId, they are authenticated, and the token is returned here.
    onAuthenticated: (tokenAndItem, req, res) => {
      console.log(tokenAndItem);
      // Grab the redirection target from the cookie set earlier
      const redirectTo = JSON.parse(req.cookies.redirects).successRedirect;
      // And redirect there
      // NOTE: You should probabaly do some safety checks here for a valid URL
      // and/or ensure it's a relative URL to avoid phising attacks.
      res.redirect(redirectTo);
    },

    // If there was an error during any of the authentication flow, this
    // callback is executed
    onError: (error, req, res) => {
      console.error(error);
      // Grab the redirection target from the cookie set earlier
      const redirectTo = JSON.parse(req.cookies.redirects).failureRedirect;
      // And redirect there
      // NOTE: You should probabaly do some safety checks here for a valid URL
      // and/or ensure it's a relative URL to avoid phising attacks.
      res.redirect(`${redirectTo}?error=${encodeURIComponent(error.message || error.toString())}`);
    },
  };
}

if (facebook) {
  module.exports.authFacebook = {
    type: FacebookAuthStrategy,
    idField: 'facebookId',
    appId: facebook.appId,
    appSecret: facebook.appSecret,
    loginPath: '/auth/facebook',
    callbackPath: '/auth/facebook/callback',
    // Called when there's no existing user for the given googleId
    // Default: resolveCreateData: () => ({})
    resolveCreateData: ({ createData, serviceProfile }) => {
      // If we don't have the right data to continue with a creation
      if (!createData.email) {
        const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
        if (email) {
          createData.email = email;
        }
      }

      return createData;
    },

    // Once a user is found/created and successfully matched to the
    // googleId, they are authenticated, and the token is returned here.
    onAuthenticated: (tokenAndItem, req, res) => {
      console.log(tokenAndItem);
      res.redirect('/profile');
    },

    // If there was an error during any of the authentication flow, this
    // callback is executed
    onError: (error, req, res) => {
      console.error(error);
      res.redirect(`/?error=${encodeURIComponent(error.message || error.toString())}`);
    },
  };
}

if (twitter) {
  module.exports.authTwitter = {
    type: TwitterAuthStrategy,
    idField: 'twitterId',
    appId: twitter.appId,
    appSecret: twitter.appSecret,
    loginPath: '/auth/twitter',
    callbackPath: '/auth/twitter/callback',
    resolveCreateData: ({ createData, serviceProfile }) => {
      if (!createData.email) {
        const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
        if (email) {
          createData.email = email;
        }
      }
      return createData;
    },
    onAuthenticated: (tokenAndItem, req, res) => res.redirect('/profile'),
    onError: (error, req, res) => {
      console.error(error);
      res.redirect(`/?error=${encodeURIComponent(error.message || error.toString())}`);
    },
  };
}

if (github) {
  module.exports.authGithub = {
    type: GitHubAuthStrategy,
    idField: 'githubId',
    appId: github.appId,
    appSecret: github.appSecret,
    loginPath: '/auth/github',
    callbackPath: '/auth/github/callback',
    resolveCreateData: ({ createData, serviceProfile }) => {
      if (!createData.email) {
        const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
        if (email) {
          createData.email = email;
        }
      }
      return createData;
    },
    onAuthenticated: (tokenAndItem, req, res) => res.redirect('/profile'),
    onError: (error, req, res) => {
      console.error(error);
      res.redirect(`/?error=${encodeURIComponent(error.message || error.toString())}`);
    },
  };
}
