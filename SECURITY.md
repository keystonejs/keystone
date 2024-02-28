# Security Policy

## Reporting a Vulnerability

If you have a security flaw to report for any software in this repository, please don't hesitate to contact us at [security@keystonejs.com](mailto:security@keystonejs.com).

For feature requests, support questions or other issues, [please use GitHub](https://github.com/keystonejs/keystone/issues/new/choose).

## Auditing and testing

Keystone has not endured publicly-disclosable penetration testing or been professionally audited, and at this time our automated test coverage has a low emphasis on enterprise security considerations.

When deploying, we currently recommend not placing Keystone at the hard edge of your infrastructure - instead opting for appropriate defence-in-depth measures such as web application firewalls, reverse proxies and or caching and load balancing infrastructure.

The Keystone team holds security and security-related issues in high regard; and we issue GitHub security advisories (following a CVE process) for security vulnerabilities that are reported to us or discovered by our team.

Keystone is an open source project, and thereby uses open source security tooling including GitHub security advisories, [dependabot](https://github.com/dependabot) and [renovate](https://github.com/renovatebot/renovate) to monitor and update our dependencies.
