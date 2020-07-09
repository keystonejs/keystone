---
'@keystonejs/demo-project-meetup': patch
---

Updated usage of Apollo based on Next.js [example](https://github.com/vercel/next.js/blob/canary/examples/with-apollo). 

The **key changes** are: 
- Less boilerplate code for setting/initializing Apollo Client
- Update home, events and about page to opt in for SSG
- Removed MyApp.getIntialProps as it will stop the [Auto Static optimization](https://nextjs.org/docs/api-reference/data-fetching/getInitialProps#caveats). 
- Handle the authentication in client-side only.
