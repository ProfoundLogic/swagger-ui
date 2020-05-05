# Profound.js Swagger UI

This module, `profound.js-swagger-ui`, extends swagger-ui-dist package as a dependency-free npm module.
This package is designed to only be used internally by the Profound.js Server Framework.

To get an absolute path to this directory for static file serving, use the exported `getAbsoluteFSPath` method:

```javascript
const swaggerUIPath = require("profoundjs-swagger-ui").getAbsoluteFSPath()

```

For anything else, check the [Swagger-UI](https://github.com/swagger-api/swagger-ui) repository.
