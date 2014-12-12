# ABOUT YOU app SDK

## Installation

`npm install aboutyou-sdk`

## Documentation

Documentation is available at https://developer.aboutyou.de/doc/
or in the repositories docs folder https://github.com/aboutyou/aboutyou-nodejs-sdk/

## API Overview

Every resource is accessed via your `ay` instance:

```js
var aboutYou = require('aboutyou-sdk')(' your ABOUT YOU App ID ',' your ABOUT YOU API key ');
```

## Versions

We use the version format 'Major.Minor.Patch'. Bug fixes not affecting the API increment the patch version, backwards compatible API additions/changes increment the minor version, and backwards incompatible API changes increment the major version.

Note: Currently, we are still in initial development. Anything may change at any time. The public API should not be considered stable.