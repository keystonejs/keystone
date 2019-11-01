<!--[meta]
section: road-map
title: Road Map
order: 1
[meta]-->

# Roadmap

## Overview

The **core goals of Keystone** are:

- allow fast definition of schema and application structure
- provide content management that matches any application structure
- allow effortless and flexible access control configuration
- provide the most intuitive GraphQL API
- comprise small independent packages that can be added and combined as required
- allow freedom of choice and interoperability outside these narrow areas of control

**Keystone is not trying to be**:

- an ORM like Knex or Mongoose
- a simple database wrapper like Prisma
- a front-end hosting service like Netlify
- an application hosting service like Heroku
- a database provisioning service like MongoLab
- a build or deployment tool
- a template engine (Keystone is headless)

We want people to use these types of services interchangeably with Keystone with as little effort as possible. Rather than position itself as a competitor to any of the above, Keystone empowers people by not limiting these choices.

There may be complementary services, plugins or packages that tie in with the above. Although we will avoid adding these features to 'core' we want to provide a supportive environment for these to be developed within the Keystone community.

We also want to ensure Keystone works well with static sites and serverless architecture. This goal will help keep Keystone light-weight, nimble, customisable and not tied to a specific architecture, in-line with our core goals.

## Our Current Focus

A lot of work has been done on Keystone's core architecture. In this area Keystone 5 is significantly more mature than Keystone 4 was. We'd like to add database transactions, slightly refactor some of the internal workings of relationship fields and make the experience of database migrations easier. Aside from this we imagine the core architecture will remain largely the same.

In the short term we want to focus on a better onboarding experience and making it easier to build typical applications with Keystone. This involves better error messages, documentation and examples, extensibility of the AdminUI as well as new field types and adapters.

All PRs in these areas will be welcome. The list of features and bugs below represents identified tasks that align with Keystone's core goals and current focus. Although the core goals of this project will remain the same, some tasks may evolve, new tasks may be added and priorities might change. For the latest list of Roadmap tasks, take a look at our [Roadmap Milestone on Github](https://github.com/keystonejs/keystone-5/milestone/6).

### Features

- Options pages ([#1639](https://github.com/keystonejs/keystone-5/issues/1639))
- Better seeding of initial data ([#301](https://github.com/keystonejs/keystone-5/issues/301))
- Migrations ([#299](https://github.com/keystonejs/keystone-5/issues/299))
- Virtual\\Dynamic fields ([#1117](https://github.com/keystonejs/keystone-5/issues/1117))
- Repeating sections ([#313](https://github.com/keystonejs/keystone-5/issues/313), [#195](https://github.com/keystonejs/keystone-5/issues/195))
- Ability to deploy the Admin UI to a static server ([#734](https://github.com/keystonejs/keystone-5/issues/734), [#1258](https://github.com/keystonejs/keystone-5/issues/1258), [#1257](https://github.com/keystonejs/keystone-5/issues/1257))
- Add a DateRange field type ([#215](https://github.com/keystonejs/keystone-5/issues/215))
- Add case options to text fields ([#1639](https://github.com/keystonejs/keystone-5/issues/1639))
- A React App ([#1669](https://github.com/keystonejs/keystone-5/issues/1669))
- Transaction Support ([#211](https://github.com/keystonejs/keystone-5/issues/211))
- Admin UI Hooks ([#1665](https://github.com/keystonejs/keystone-5/issues/1665))
- StateMachine Type ([#1528](https://github.com/keystonejs/keystone-5/issues/1528))
- Make Hooks an Array ([#1495](https://github.com/keystonejs/keystone-5/issues/1495))
- Finalise query limits ([#1469](https://github.com/keystonejs/keystone-5/issues/1469))
- JSON & Memory Adapters ([#947](https://github.com/keystonejs/keystone-5/issues/947), [#324](https://github.com/keystonejs/keystone-5/issues/324))
- Allow `where` clauses on single relationships ([#699](https://github.com/keystonejs/keystone-5/issues/699))
- Allow upsert mutations ([#182](https://github.com/keystonejs/keystone-5/issues/182))
- Auth Strategy and Authentication improvement ([#878](https://github.com/keystonejs/keystone-5/issues/878))

### Developer Experience & Maintenance

- Creating custom field types ([#1054](https://github.com/keystonejs/keystone-5/issues/1054), [#1218](https://github.com/keystonejs/keystone-5/issues/1218))
- Creating new adapters
- Error messages ([#1659](https://github.com/keystonejs/keystone-5/issues/1659))
- Upgrade to Next.js v9 ([#1670](https://github.com/keystonejs/keystone-5/issues/1670))
- Improve the speed of our CI ([#1672](https://github.com/keystonejs/keystone-5/issues/1672))

### Planning

- Plugin Architecture ([#1489](https://github.com/keystonejs/keystone-5/issues/1489))
- Relationship field types ([#1322](https://github.com/keystonejs/keystone-5/issues/1322))

### High Priority Bugs

- Removing items form to many relationships ([#1548](https://github.com/keystonejs/keystone-5/issues/1548))
- Create form submits unedited values ([#1398](https://github.com/keystonejs/keystone-5/issues/1398))
- Create many mutation not connecting relationships ([#1318](https://github.com/keystonejs/keystone-5/issues/1318))
