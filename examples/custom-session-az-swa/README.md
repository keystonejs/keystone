# KeystoneJS [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/overview) Example

This project demonstrates how to integrate a KeystoneJS backend with a React frontend, deployed on Azure Static Web Apps. It showcases a custom session implementation using Azure's authentication headers. Additionally, it demonstrates how to use roles for authorization on the backend.

## Features

- React frontend with login/logout functionality, and role-based authorization tests
- KeystoneJS backend with authorization based on roles
- Custom session implementation using `x-ms-client-principal` header

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- An Azure account with an active subscription
- Azure CLI (optional, for deployment)

## Project Structure

```
custom-session-az-swa/
├── frontend/
│   ├── src/
│   │   └── App.js
│   └── package.json
│   └── staticwebapp.config.json
├── backend/
│   ├── keystone.ts
│   ├── schema.ts
│   ├── session.ts
│   └── package.json
├── staticwebapp.config.json
└── README.md
└── swa-cli.config.json
```

## Setup and Installation
1. Install Azure Static Web Apps CLI https://azure.github.io/static-web-apps-cli/docs/use/install. It's required for local execution and testing.
2. Clone the repository:
   ```
   git clone https://github.com/keystonejs/keystone.git
   cd examples/custom-session-az-swa
   ```

3. Install dependencies:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```

4. Start the backend:
   ```
   cd backend
   npm run dev
   ```

5. In a new terminal, start the frontend:
   ```
   swa start
   ```

7. Visit `http://localhost:4280` to see the application running locally.

## Custom Session Implementation

The custom session implementation in `backend/session.ts` uses the `x-ms-client-principal` header provided by Azure Static Web Apps. This header contains encoded user information when a user is authenticated.

## Roles and Authorization
**NOTE: This is a simple example to demonstrate how to use roles for authorization. In a production application, you should use a more secure method to manage roles and permissions.**

The following roles are defined in `backend/session.ts`:
- `blogReader`: Can only read posts
- `blogContributor`: Can read, create, update, and delete posts
- `admin`: Can perform all operations

- Roles are used for authorization on the **Post** list.
```
operation: {   
    query: ({ session}) => isBlogReader({ session }) || isBlogContributor({ session }),              
    create: isBlogContributor,
    update: isBlogContributor,
    delete: isBlogContributor,
},
```

## Important Notes

- Ensure all API routes are prefixed with `/api` in your frontend requests.
- Because backend is "hiden" under a reverse proxy under /api sub path,  the Admin dashboard is moved to /api/admin, 

- The local development environment may not fully replicate the Azure Static Web Apps authentication. Always test in a staging environment before deploying to production.

