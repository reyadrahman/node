// NOTE webpack will use aws-helper.js on the server
//      and aws-helper.web.js on the client
// server uses 'aws-sdk'. Client uses 'external_modules/aws-sdk.min.js'
export * from './aws-helper';


//
// export function sendEmail(data) {
//     return apigClient.emailPost({}, data, {})
//                      .then(res => {
//                          if (res.data && res.data.errorMessage) {
//                              return Promise.reject(res.data.errorMessage);
//                          }
//                          console.log('sendEmail, SUCCESS', res);
//                          return res.data;
//                      })
//                      .catch(err => {
//                          console.log('sendEmail, FAILURE', err);
//                          return Promise.reject(err);
//                      });
// }
