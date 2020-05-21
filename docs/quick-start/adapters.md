<!--[meta]
section: quick-start
title: Database setup
[meta]-->

# Database Setup

Before starting your Keystone project you need to have a database set up and ready for Keystone to use.

## Choosing A Database

Keystone currently provides support for [MongoDB](https://www.mongodb.com/) or [PostgreSQL](https://www.postgresql.org/) databases.
You will need to pick one of these databases to use for your system.
Both databases are fully supported, and you should consider the [pros and cons](https://www.google.com/search?q=mongodb+vs+postgresql) of each to determine which one is best suited to your situation.

Once you have chosen a database to use you will need to make sure that it is correctly installed and set up, and that you are able to connect to it.
The instructions below will take you through this process to ensure that you are ready to continue with your Keystone project.

> **Tip** Take note of the `connection string` that you use to connect to your database, as you will need to know this to set up your Keystone project.

## MongoDB

### Installation

#### MacOS

The simplest way to install MongoDB is using [Homebrew](https://brew.sh/).
Refer the [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/) for more information.

#### Windows

Follow the [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) for installing MongoDB on Windows.

#### Other Platforms

[Downloads](https://www.mongodb.com/download-center/community) and [instructions](https://docs.mongodb.com/manual/administration/install-on-linux/) for installation on various Linux systems are also available.

### Connection

Once you have installed MongoDB you can connect to your database using the command:

```shell allowCopy=false showLanguage=false
$ mongo mongodb://localhost/my-keystone-project
```

In this case the connection string `mongodb://localhost/my-keystone-project` tells MongoDB to connect to a database called `my-keystone-project` on your computer (`localhost`). You should see output which looks like this:

```none allowCopy=false showLanguage=false
$ mongo mongodb://localhost/my-keystone-project
MongoDB shell version v4.0.3
connecting to: mongodb://localhost/my-keystone-project
Implicit session: session { "id" : UUID("2f47e753-d347-4305-92e2-347c095c8072") }
MongoDB server version: 4.0.3
Server has startup warnings:
2020-04-08T09:31:10.824+1000 I CONTROL  [initandlisten]
2020-04-08T09:31:10.825+1000 I CONTROL  [initandlisten] ** WARNING: Access control is not enabled for the database.
2020-04-08T09:31:10.825+1000 I CONTROL  [initandlisten] **          Read and write access to data and configuration is unrestricted.
2020-04-08T09:31:10.825+1000 I CONTROL  [initandlisten]
---
Enable MongoDB's free cloud-based monitoring service, which will then receive and display
metrics about your deployment (disk utilization, CPU, operation statistics, etc).

The monitoring data will be available on a MongoDB website with a unique URL accessible to you
and anyone you share the URL with. MongoDB may use this information to make product
improvements and to suggest MongoDB products and deployment options to you.

To enable free monitoring, run the following command: db.enableFreeMonitoring()
To permanently disable this reminder, run the following command: db.disableFreeMonitoring()
---

>
```

If this works then you are ready to start setting up your Keystone project, and can head back to the [getting started guide](/docs/quick-start/README.md).

If you run into problems please consult the [MongoDB docs](https://docs.mongodb.com/manual/installation/) for troubleshooting tips.

## PostgreSQL

### Installation

#### MacOS

The simplest way to install PostgreSQL is using [Homebrew](https://brew.sh/).

```shell
brew install postgres
```

#### Other Platforms

For Windows and other platforms see the [download instructions](https://www.postgresql.org/download/) on the [postgresql.org](https://postgresql.org) website.

### Setup

Once you have installed PostgreSQL you will need to create a database for Keystone to use.
To create the database run the following command:

```shell allowCopy=false showLanguage=false
createdb my-keystone-project
```

If the command runs with no output then you have successfully created your database.
You may see an error which looks like this:

```shell allowCopy=false showLanguage=false
createdb: error: could not connect to database template1: FATAL:  password authentication failed for user ...
```

If this is the case then you will need to configure the user permissions for your database. Please consult the [PostgreSQL docs](https://www.postgresql.org/docs/) for instructions on how to do this.

### Connection

Once you have created your database you can connect to it using the command:

```shell allowCopy=false showLanguage=false
$ psql postgres://localhost/my-keystone-project
```

In this case the connection string `postgres://localhost/my-keystone-project` tells PostgreSQL to connect to a database called `my-keystone-project` on your computer (`localhost`). You should see output which looks like this:

```
$ psql postgres://localhost/my-keystone-project
psql (12.2, server 9.6.8)
Type "help" for help.

my-keystone-project=#
```

If you need to connect to to your database as a particular user then you can include the username and password in the connection string:

```shell allowCopy=false showLanguage=false
$ psql postgres://<username>:<password>@localhost/my-keystone-project
```

If this works then you are ready to start setting up your Keystone project, and can head back to the [getting started guide](/docs/quick-start/README.md).

If you run into problems please consult the [PostgreSQL docs](https://www.postgresql.org/docs/) for troubleshooting tips.
