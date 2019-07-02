# KeystoneJS Demo Projects

These projects are designed to show off different aspects of KeystoneJS features
at a range of complexities (from a simple Todo App to a complex Meetup Site).

- `todo`: A Todo app showcasing the AdminUI and how to create a minimal List
- `blog`: A starting point for a blog including a WYSIWYG editor
- `meetup`: A local community event website with speakers and sponsors

## Requirements

Minimum requirements for the Demo Projects:

- [Node.js](https://nodejs.org/) >= 10.x
- [Bolt](http://boltpkg.com/)
- [MongoDB](https://v5.keystonejs.com/quick-start/mongodb) >= 4.x

Download a copy of the Keystone 5 repo, and check out the latest release:

```bash
git clone https://github.com/keystonejs/keystone-5.git
cd keystone-5
git checkout $(git describe --tags $(git rev-list --tags --max-count=1))
bolt
```

To run the default demo project (`todo`):

```
bolt dev
```

To run a specific demo project (eg; `blog`):

```
bolt demo blog dev
```

To create & start a production build, use the `build` command followed by `start`:

```
bolt demo blog build
bolt demo blog start
```
