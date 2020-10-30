import resolve from "swagger-client/es/resolver"
import { execute, buildRequest } from "swagger-client/es/execute"
import Http, { makeHttp, serializeRes, } from "swagger-client/es/http"
import resolveSubtree from "swagger-client/es/subtree-resolver"
import { opId } from "swagger-client/es/helpers"
import * as configsWrapActions from "./configs-wrap-actions"

import btoa from 'btoa';

export default function ({ configs, getConfigs }) {
  return {
    fn: {
      fetch: makeHttp(Http, configs.preFetch, configs.postFetch),
      buildRequest,
      applySecurities: (request, options) => {
        if (!request || !options || !options.operation || !options.securities) return;

        // This is needed to allow for distinguishing which specific Authentication Defination(s) is being sent with request.
        // Similiar logic can be found in --> node_modules\swagger-client\es\execute\oas3\build-request.js
        let operation = options.operation.toJSON();

        // If not a UserName/Password or If no security or non authorized - then no need to alter the request
        if (!request.headers.Authorization || !request.headers.Authorization.match(/^Basic /) || !Array.isArray(operation.security) || !operation.security.length || !options.securities.authorized || !Object.keys(options.securities.authorized).length)
          return;

        let isIBMiUser = null;

        for (let sCnt = 0; sCnt < operation.security.length; sCnt++) {
          let secNames = Object.keys(operation.security[sCnt]);

          for (let nCnt = 0; nCnt < secNames.length; nCnt++) {
            let secName = secNames[nCnt];
            let auth = options.securities.authorized[secName];
            if (!auth)
              break;

            let schema = options.spec.components.securitySchemes[secName];
            let value = auth.value || auth;

            if (value && schema.type === 'http' && schema.scheme.match(/^basic$/i)) {
              isIBMiUser = null;
              let username = value.username || '';
              let password = value.password || '';
              let encoded = btoa(username.concat(":", password));
              if (request.headers.Authorization == "Basic ".concat(encoded)) {

                // Allow for a ibmi user/pwd and non ibmi user/pwd to be exactly the same
                //  And if a non ibmi user/pwd auth matches - return 
                if (schema["x-ibmi"] === true)
                  isIBMiUser = true;
                else
                  return; // Treat as the non-ibmi user/pwd authentication

              }
            }
          }
        }

        if (isIBMiUser === true)
          request.headers["X-Auth"] = "ibmi";

      },
      execute,
      resolve,
      resolveSubtree: (obj, path, opts, ...rest) => {
        if (opts === undefined) {
          const freshConfigs = getConfigs()
          opts = {
            modelPropertyMacro: freshConfigs.modelPropertyMacro,
            parameterMacro: freshConfigs.parameterMacro,
            requestInterceptor: freshConfigs.requestInterceptor,
            responseInterceptor: freshConfigs.responseInterceptor
          }
        }

        return resolveSubtree(obj, path, opts, ...rest)
      },
      serializeRes,
      opId
    },
    statePlugins: {
      configs: {
        wrapActions: configsWrapActions
      }
    },
  }
}