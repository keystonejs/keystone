<!--[meta]
section: api
subSection: utilities
title: Create Keystone App
[meta]-->

# Create Keystone App

A CLI for Keystone 5 to help generate starter apps.

## Usage

### Arguments

| Argument     | Type      | Description                                                                                                                  |
| :----------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `--name`     | `String`  | The Keystone app name visible in the Admin UI and page titles.                                                              |
| `--template` | `String`  | One of the existing app templates (folder name). For example: `starter`, `todo`, etc.                                       |
| `--adapter`  | `String`  | One of the adapters listed in the app template. Usually one of: `Mongoose`, `Knex`.                                         |
| `--dry-run`  | `Boolean` | Will go through the app generation process validating the user inputs or CLI arguments but in the end no app will be generated. |


### Interactive

```sh
yarn create keystone-app my-app
```

and follow the prompts.

### Non-Interactive

A non-interactive Keystone app creation could be useful in unattended app generation. One such example is creating a Docker image with a generated Keystone app built in.

```sh
npm init keystone-app --name "My App" --template "starter" --adapter "Mongoose" my-app
```

The app generation will fall back to interactive prompts if any of the arguments are missing or have incorrect values.

**NOTE**: By the time this documentation was written, `yarn create` was not working because the CLI arguments were not passed to the `create-keystone-app` script.

## Run the App

```sh
cd my-app
yarn dev
```
