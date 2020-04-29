<!--[meta]
section: api
subSection: utilities
title: Create Keystone app
[meta]-->

# Create Keystone app

A CLI for Keystone to help generate starter apps.

## Usage

### Interactive

```shell
yarn create keystone-app my-app
```

and follow the prompts.

### Non-Interactive

A non-interactive Keystone app creation could be useful in unattended app generation.
One such example is creating a Docker image with a generated Keystone app built in.
See the list of possible arguments in the **Arguments** section below.

```shell
npm init keystone-app --name "My App" --template "starter" --database "MongoDB" --connection-string mongodb://localhost/MyApp --test-connection false my-app
```

The app generation will fall back to interactive prompts if any of the arguments are
missing or have incorrect values.

> **Note:** By the time this documentation was written, `yarn create` was not working
> because the CLI arguments were not passed to the `create-keystone-app` script.

### Arguments

| Argument              | Type      | Description                                                                                                                     |
| :-------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `--name`              | `String`  | The Keystone app name visible in the Admin UI and page titles.                                                                  |
| `--template`          | `String`  | One of the existing app templates (folder name). For example: `starter`, `todo`, etc.                                           |
| `--database`          | `String`  | One of the databases listed in the app template. One of: `MongoDB` or `PostgreSQL`.                                             |
| `--connection-string` | `String`  | The connection string to connect to your database.                                                                              |
| `--test-connection`   | `Boolean` | Test the database connection before setting up the project.                                                                     |
| `--dry-run`           | `Boolean` | Will go through the app generation process validating the user inputs or CLI arguments but in the end no app will be generated. |

## Run the app

```shell allowCopy=false showLanguage=false
cd my-app # Change directory
yarn dev  # Start the development server
```
