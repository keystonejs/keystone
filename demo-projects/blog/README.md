# Demo Project: Blog

This is the Blog, a Demo Project for Keystone. Compared to the todo list, it is more complex and contains more features that really showcase the power of Keystone - one of which is 'relationships'. The Blog contains four lists - Posts, Post Categories, Users and Comments. Users can create Comments that relate to a certain Post, and Admins can create Posts that can relate to one or more Post Categories.

The Blog is a great example and boilerplate for more complex, real-world implementations of Keystone.

## Running the Project.

Before you can run this demo project, create a .env file within the project folder `touch demo-projects/todo/.env`, and write the following...

```
PORT=3000
```

Once the .env file is created, open your terminal and run `bolt` within the Keystone project root to install all required packages, then run `bolt start blog` to begin running Keystone.

The Keystone Admin UI is reachable from `localhost:3000/admin`. To log in, use the following credentials...
Username: `admin@keystone.project`
Password: `password`

To see an example Next.js app using Keystone's GraphQl APIs, head to `localhost:3000`.
