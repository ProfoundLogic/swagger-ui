/**
 * @prettier
 */

import configBuilder from "./_config-builder"

const result = configBuilder(
  {
    minimize: true,
    mangle: true,
    sourcemaps: false,
    includeDependencies: false,
  },
  {
    entry: {
      "swagger-ui": [
        "./src/core/index.js"
      ],
    },

    output: {
      library: "SwaggerUICore",
    },
  }
)

export default result
