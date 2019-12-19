# airtable-api-proxy

Node API Proxy boilerplate for Airtable

Blog post: https://medium.com/@benoror/creating-an-ember-addon-for-airtable-api-d9e38d7bef97#.33q0r7hhm

Ember Airtable: https://github.com/benoror/ember-airtable

### Simple proxy, Non-Auth

Default proxy won't authenticate requests, just hide the private key in `APP_ID` & `API_KEY` environment variables:

```
node index.js
```

### Self-Auth

This server will use a table inside Airtable itself called `users` (see code for details) for authenticating credentials.

Then will respond with a encoded session and user's info fields, which can be used to filter results.

```
node self-auth.js
```

Feel free to customize values or modify Auth mechanism as needed (Ex. Passport, Auth0, Firebase, ...big etc)
