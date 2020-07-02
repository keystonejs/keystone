---
'@keystonejs/file-adapters': patch
---

**Fix**: delete function not passing required config params

We are not setting global configuration (api_key, api_secret, and cloud_name) in our cloudinary SDK. 
We are relying on passing these mandatory config settings in the options param of the upload API.
But in the case of destroy method, we are omitting them and passing ondefault empty options object as an argument.
This results in a rejected promise. To fix this issue, we are now injecting these values in the provided options object. 

NOTE: User can still override these values if required.
