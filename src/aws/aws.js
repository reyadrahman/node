const XMLHttpRequest = require('xhr2');
global.XMLHttpRequest = XMLHttpRequest;


// NOTE webpack will use aws-helper.js on the server
//      and aws-helper.web.js on the client
export * from './aws-helper';


import 'script!apiGateway-js-sdk/lib/axios/dist/axios.standalone.js'
import 'script!apiGateway-js-sdk/lib/CryptoJS/rollups/hmac-sha256.js'
import 'script!apiGateway-js-sdk/lib/CryptoJS/rollups/sha256.js'
import 'script!apiGateway-js-sdk/lib/CryptoJS/components/hmac.js'
import 'script!apiGateway-js-sdk/lib/CryptoJS/components/enc-base64.js'
import 'script!apiGateway-js-sdk/lib/url-template/url-template.js'
import 'script!apiGateway-js-sdk/lib/apiGatewayCore/sigV4Client.js'
import 'script!apiGateway-js-sdk/lib/apiGatewayCore/apiGatewayClient.js'
import 'script!apiGateway-js-sdk/lib/apiGatewayCore/simpleHttpClient.js'
import 'script!apiGateway-js-sdk/lib/apiGatewayCore/utils.js'
import 'script!apiGateway-js-sdk/apigClient.js'

var apigClient = apigClientFactory.newClient();


export function search(query) {
    return new Promise((resolve, reject) => {
        const params = {
        };
        const additionalParams = {
            // If there are any unmodeled query parameters or headers that need
            // to be sent with the request you can add them here
            headers: { },
            queryParams: {
                q: query.searchPhrase,
                size: 1,
            },
        };

        apigClient.mytestlambda1Get(params, {}, additionalParams)
                  .then(result => {
                      if(!result.data || !Array.isArray(result.data)) {
                          return reject(result);
                      }
                      return resolve(result.data);
                      /*
                      if (!result.data.hits) {
                          if (result.data.__type && result.data.message) {
                              return reject(`${result.data.message} (${result.data.__type})`);
                          }
                          return reject('Search Failed');
                      }
                      return resolve(result.data);
                      */
                  }).catch(err => {
                      return reject(err);
                  });
    });
}
