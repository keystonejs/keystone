---
title: "Privacy Policy (Telemetry)"
description: "Keystone collects anonymous telemetry events when running `keystone dev` - Learn what is sent, what the information is used for, and how to opt-out"
---


Keystone 6 is software developed and maintained by Thinkmill Labs Pty Ltd and the open source community, and this privacy policy is on behalf of Thinkmill Labs and in relation to Keystone, and to the extent applicable, similar software under the Keystone GitHub organisation.

This page describes how we collect and hold **anonymous** telemetry data, the rationale for why we are collecting this information, when it is collected, and how **you can opt-out**. Unless you opt out, you consent to us collecting, holding, analysing and using the telemetry data in accordance with this policy, which may be updated from time to time.

Please note that Keystone currently uses [NextJS](https://nextjs.org/) and [Prisma](https://www.prisma.io/) as software dependencies, and each of these projects include their own telemetry with their own respective privacy policies.
You can learn more about them by visiting the following:

- [https://nextjs.org/telemetry](https://nextjs.org/telemetry)
- [https://www.prisma.io/docs/concepts/more/telemetry](https://www.prisma.io/docs/concepts/more/telemetry)

---

## Why do we collect and hold telemetry?

Keystone only collects telemetry that we reasonably require for the continued development of the software, and, to the extent applicable, we do so in accordance with the Australian Privacy Principles.

Telemetry helps us learn about how Keystone is being used by developers and projects that may not be actively participating on our GitHub, Twitter and Slack.
The questions we want to currently answer using telemetry are the following:

- How many active developers are using Keystone, compared to how many are active in the community,
- How complex are projects that use Keystone,
- What field types and `@keystone-6` or community packages are being used by developers, and
- What operating systems and node versions are being used by the community?

This information will help Thinkmill Labs prioritise future features or maintenance efforts for ongoing development.

---

## When is telemetry collected?

Keystone only collects telemetry when you, the developer, explicitly start the software using `keystone dev`, or by using the `cli` function with an `argv` value of `dev`, as exposed by our `@keystone-6/core/scripts/cli` export.

There are four scenarios when running `keystone dev`, where we **do not collect** telemetry:

- The first time running `keystone dev`, when displaying the telemetry notice, or
- If the `CI` environment variable is set (to anything), or
- If the `NODE_ENV` environment variable is set to `"production"`, or
- If you have opted out - see [How to opt-out below](#how-to-opt-out)

In any of these scenarios, telemetry will be disabled and prevented from sending any information.

---

## What information is collected?

{% hint kind="warn" %}
⚠️ The exact structure and contents of the telemetry information collected may be subject to change when the software is updated.
Developers should watch [our releases on GitHub](https://github.com/keystonejs/keystone/releases) for any changes in what telemetry information is reported by the Software.
Any material increase in the amount of information collected will result in us re-notifying developers of that change the next time they run `keystone dev`; and updating this page.

{% /hint %}

Keystone collects telemetry information in the form of two different types of data reports:

- Information about the device running `keystone dev`, and
- Information about the project’s configuration

We refer to these two different reports, as “device telemetry” and “project telemetry” respectively.

These reports are forwarded to [https://telemetry.keystonejs.com/](https://telemetry.keystonejs.com/), and are reported separately to minimize any correlation between them insofar as the timing and grouping of that data, that an otherwise combined report may have. We are collecting these two reports for different reasons, and thus have no need to associate them.

We additionally record a timestamp of the time that the report is received by the server at [https://telemetry.keystonejs.com](https://telemetry.keystonejs.com/).

**Device Telemetry**
The type of information contained within a device telemetry report is currently:

- The last date you used `keystone dev`, and
- The node major version number, and
- The name of your operating system

A device telemetry report is formatted as JSON and currently looks like:

```json
{
  "previous": "2022-11-23",
  "os": "darwin",
  "node": "18"
}
```

**Project Telemetry**

The type of information contained within a project telemetry report is currently:

- The last date you used `keystone dev` for this project, and
- The resolved versions of any `@keystone-6` packages used by this project, and
- The number of lists for this project, and
- The name and number of field types that you are using

A project telemetry report is formatted as JSON and currently looks like:

```json
{
  "previous": "2022-11-23",
  "versions": {
    "@keystone-6/auth": "5.0.1",
    "@keystone-6/core": "3.1.2",
    "@keystone-6/document-renderer": "1.1.2",
    "@keystone-6/fields-document": "5.0.2"
  },
  "lists": 3,
  "fields": {
    "unknown": 1,
    "@keystone-6/text": 5,
    "@keystone-6/image": 1,
    "@keystone-6/file": 1
  }
}
```

---

## Will we share this information?

The telemetry information as collected will be used and analysed by Thinkmill Labs to answer the aforementioned questions. For these purposes, we might use 3rd party services.

Where possible, we want to share this information with the open-source community surrounding Keystone. Thinkmill Labs respects your privacy, and as such, any information that is shared will only be shared in an aggregate form.

We do not sell this data, and we don’t intend to.

Thinkmill Labs will make its best effort to remove any outliers, even in aggregate form, that could be used to identify a particular device or project.

---

## How long will we keep this information?

Thinkmill Labs will only keep this information until it can be reduced down to aggregate form to answer the aforementioned questions.
For that purpose, **we currently only retain telemetry reports and their respective timestamps for 1 year**. After that period, singular telemetry reports are deleted and only the analysed, aggregate form of the respective data is retained.

---

## How to opt-out?

To opt-out of Keystone device and project telemetry for your user profile, in 1 command, you can use the following:

```bash
$ keystone telemetry disable
```

If you change your user profile on your device, you will need to run this command again.
Alternatively, to disable telemetry for your project in a way that is compatible with your source control, add the following to your project's `keystone.ts` configuration file:

```tsx
export default config({
  db: {
    // ...
  },
  lists,

  // this will opt-out of device and project telemetry, for this project
  telemetry: false
})
```

If you want to reset your telemetry configuration for your user profile, you can use `keystone telemetry reset`.
If you want to opt-in to keystone telemetry for your user profile, you can use `keystone telemetry enable`.

Keystone stores your telemetry preferences in a location defined by [env-paths](https://github.com/sindresorhus/env-paths#pathsconfig), an open source library, which currently stores the data in the following locations:

| Operating System | Location |
| --- | --- |
| MacOS | ~/Library/Preferences/keystonejs |
| Linux | ~/.config/keystonejs (or $XDG_CONFIG_HOME/keystonejs) |
| Windows | %APPDATA%\keystonejs\Config (for example C:\Users\YOUR_USERNAME\AppData\Roaming\keystonejs\Config) |

**Environment Variable**
You can opt-out of all telemetry by setting the `KEYSTONE_TELEMETRY_DISABLED` environment variable to `'1'`
**Network-wide opt-out**

If you have a network-wide firewall, you can opt-out of Keystone telemetry by not resolving the following domain: [telemetry.keystonejs.com](https://telemetry.keystonejs.com)

---

## How can I see what is currently configured

If you wish to see how telemetry is currently configured for your device or project, you can run `keystone telemetry status`.

## What if I have a complaint or question

If you have any questions or concerns about the information that is gathered please contact us by logging a GitHub Issue [https://github.com/keystonejs/keystone](https://github.com/keystonejs/keystone). 

Alternatively please contact our Privacy Officer by email to [privacy@keystonejs.com](mailto:privacy@keystonejs.com), or by mail to Level 10, 191 Clarence Street, Sydney NSW 2000. 

For further information about Keystone’s security policy please see [https://github.com/keystonejs/keystone/security/policy](https://github.com/keystonejs/keystone/security/policy)