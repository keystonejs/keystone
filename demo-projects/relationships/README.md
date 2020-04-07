# Demo Project: Relationships

This project demonstrates how to set up different types of relationships with Keystone.
It is particularly useful if you want to examine how different relationship types are stored in the database.

## Running the Project.

To run this demo project, all you need to do is run `yarn` within the Keystone project root to install all required packages, then run `REL_TYPE=one_one_to_many yarn manypkg run demo-projects/relationships dev` to begin running Keystone.

Once running, the Keystone Admin UI is reachable from `localhost:3000/admin`.

The environment variable `REL_TYPE` controls the type of relationship that is used. Valid values are:

- `one_one_to_many`
- `one_many_to_many`
- `two_one_to_many`
- `two_many_to_many`
- `two_one_to_one`
