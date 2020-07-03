---
'@keystonejs/app-admin-ui': patch
---

**Fix**

Upon filtering out the lists based on the ids, an error could occur. Irrespective of the error, we were still storing the search value into the localStorage.
And when user transit back to this list page, the error would persist as we append the search query onto the url. 

This fix looks into any api error, and removes the localStorage search value `location.search`, which gets set when **Filter** form is submitted. 

See #3075
