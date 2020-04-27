<!--[meta]
section: guides
title: Heroku
subSection: deployment
[meta]-->

# Deploying Keystone to Heroku

This quick start guide shows how to deploy your first KeystoneJS app to Heroku and use MongoDB Atlas as our database service.

## Requirements

Before we start, make sure you have [Git](https://git-scm.com/downloads) installed with `git --version`, and that you have created your first KeystoneJS app.

If not, see the guide [Your first KeystoneJS app in 5 minutes](https://www.keystonejs.com/quick-start/).

> **Note:** Deploying [the STARTER starter project](#deploy-the-starter-starter-project) requires a few tweaks.

## MongoDB Atlas

MongoDB Atlas has a free tier that we can use as our database service. You need to create an account, but you can use the free tier.

- Create [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/signup) account and add a free tier Cluster.

### Allow Heroku to access our database

- Make sure to enable access from any network by going to SECURITY/Network Access, press [+Add ip address], [Allow access from anywhere] and confirm. This should add a rule that allow traffic from 0.0.0.0/0 (all networks).

### Create a new user and get the database connection string

- Go to SECURITY/Database access, press [+Add new database user] and create a new user with read and write privileges.

- Take a note of the database connection string by selecting Clusters, press [Connect], [Connect your application], select Node.js and copy the connection string. It should look something like this `mongodb+srv://<username>:<password>@cluster0-szafh.azure.mongodb.net/test?retryWrites=true&w=majority`.

## Heroku

Also Heroku has a free option. To use that we need to start to create a new account and install Heroku CLI.

### Install Heroku CLI

Heroku CLI is used to push the app to Heroku.

- Download and install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

### Create a new Heroku app

- Create an account on [Heroku](https://heroku.com).
- A new app can then be [created from the dashboard](https://dashboard.heroku.com/new-app).

### Setup your database connection

KeystoneJS automatically fetches the database connection string from an environment variable. And as Heroku apps also can handle environment variables we use that to provide our database connection string to the KeystonJS app.

- Go to your Heroku app in the dashboard, select Settings and press [Reveal config vars].

- Create a new environment variable called `DATABASE_URL` set it to the database connection string we got from MongoDB Atlas, e.g. `mongodb+srv://<username>:<password>@cluster0-szafh.azure.mongodb.net/test?retryWrites=true&w=majority`.

### Push the KeystoneJS app to Heroku

Make sure you are in the root folder of your newly created KeystoneJS app and run below commands.

Login to Heroku CLI

```sh
heroku login
```

Initialize a new git repo and add it to Heroku Git

```sh
git init
heroku git:remote -a <heroku-app-name>
```

Commit you app and push it to Heroku

```sh
git add .
git commit -am "initial commit"
git push heroku master
```

Your KeystoneJS project is now pushed to Heroku and the build process is started. The Overview page for your Heroku app shows real-time status of the current build.

## Congratulations! 🎉

You should now be able to open your new app by pressing [Open App].

## Caveats

### Deploy the STARTER starter project

This project includes users and authentication. To run it on Heroku we need to add SecureCookies and to login we need to know the login credentials.

#### User credentials

A default administrator is created the first time the app is started, or if the user count is zero. The credentials are printed to the start up log, but only the first time the app is started.

The Heroku app start log can be reached by pressing [More] and View logs.

```
2020-03-25T07:19:04.841481+00:00 app[web.1]: User created:
2020-03-25T07:19:04.841483+00:00 app[web.1]:   email: admin@example.com
2020-03-25T07:19:04.841483+00:00 app[web.1]:   password: a04ecbcb963d
2020-03-25T07:19:04.841483+00:00 app[web.1]: Please change these details after initial login.
```

#### Use secure cookies

To use secure cookies we need to add below to index.js.

```js
const keystone = new Keystone({
  ...
  cookie: {
    secure: true,
  },
  cookieSecret: 'very-secret'
});

module.exports = {
  ...
  configureExpress: app => {
    app.set('trust proxy', 1);
  }
};
```
