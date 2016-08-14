/* @flow weak */

console.log('======== AWS CLIENT...');

import { ENV } from '../client/client-utils.js';
import { callbackToPromise } from '../misc/utils.js';

const { IDENTITY_POOL_ID, USER_POOL_ID, AWS_REGION,
        IDENTITY_POOL_UNAUTH_ROLE_ARN, IDENTITY_POOL_AUTH_ROLE_ARN,
        USER_POOL_APP_CLIENT_ID } = ENV;

const XMLHttpRequest = require('xhr2');
global.XMLHttpRequest = XMLHttpRequest;

// server uses 'aws-sdk'. Client uses 'external_modules/aws-sdk.min.js'
// $FlowFixMe
import 'script!aws-sdk.min.js';
// $FlowFixMe
import "script!jsbn.js";
// $FlowFixMe
import "script!jsbn2.js";
// $FlowFixMe
import 'script!sjcl.js';
// $FlowFixMe
import 'script!moment.min.js';

// TODO import min
// $FlowFixMe
import 'script!amazon-cognito-identity/dist/aws-cognito-sdk.js';

// TODO import min instead of importing one by one
// import 'script!amazon-cognito-identity/dist/amazon-cognito-identity.min.js';
import 'script!amazon-cognito-identity/src/CognitoUser.js';
import 'script!amazon-cognito-identity/src/CognitoUserPool.js';
import 'script!amazon-cognito-identity/src/CognitoRefreshToken.js';
import 'script!amazon-cognito-identity/src/CognitoIdToken.js';
import 'script!amazon-cognito-identity/src/CognitoAccessToken.js';
import 'script!amazon-cognito-identity/src/AuthenticationDetails.js';
import 'script!amazon-cognito-identity/src/CognitoUserSession.js';
import 'script!amazon-cognito-identity/src/CognitoUserAttribute.js';
import 'script!amazon-cognito-identity/src/AuthenticationHelper.js';
import 'script!amazon-cognito-identity/src/DateHelper.js';


class AutoRefreshCredential extends AWS.CognitoIdentityCredentials {
    constructor(params) {
        const { getSession, ...others } = params;
        super(params);
        this.getSession = getSession;
    }

    refresh(cb) {
        console.log('AutoRefreshCredential refresh');
        this.getSession()
            .then(session => {
                console.log('AutoRefreshCredential got session: ', session);
                this.params.Logins[`cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`] =
                    session.getIdToken().getJwtToken();
                console.log('AutoRefreshCredential params: ', this.params);
                super.refresh(cb);
            })
            .catch(cb);
    }
}


var _currentUser_ = null;


import fromPairs from 'lodash/fromPairs';

AWS.config.region = AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
    RoleArn: IDENTITY_POOL_UNAUTH_ROLE_ARN,
    // AccountId,
});

// $FlowFixMe
AWSCognito.config.region = AWS_REGION;
AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
// TODO is this needed?
//     RoleArn: IDENTITY_POOL_UNAUTH_ROLE_ARN,
//     // AccountId,
});

var poolData = {
    UserPoolId: USER_POOL_ID,
    ClientId: USER_POOL_APP_CLIENT_ID,
};
var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);


export function signup(data) {
    return new Promise((resolve, reject) => {
        let attributeList = [];
        let dataEmail = {
            Name : 'email',
            Value : data.email,
        };
        let attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
        attributeList.push(attributeEmail);

        let dataGivenName = {
            Name : 'given_name',
            Value : data.firstName,
        };
        let attributeGivenName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataGivenName);
        attributeList.push(attributeGivenName);


        let dataFamilyName = {
            Name : 'family_name',
            Value : data.lastName,
        };
        let attributeFamilyName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataFamilyName);
        attributeList.push(attributeFamilyName);

        let responseHandler = (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        };

        userPool.signUp(data.email, data.password, attributeList,
                        null, responseHandler);

    });
}

export function verifyRegistration(username, code) {
    return new Promise((resolve, reject) => {
        let userData = {
            Username : username,
            Pool : userPool
        };

        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        cognitoUser.confirmRegistration(code, true, (err, res) => {
            err ? reject(err) : resolve(res);
        });
    });
}

export function signin({email, password}) {
    return new Promise((resolve, reject) => {
        let authenticationData = {
            Username: email,
            Password: password,
        };
        let authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

        let userData = {
            Username : email,
            Pool : userPool
        };
        let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: session => {
                _currentUser_ = cognitoUser;
                updateCredentials(session)
                    .then(() => {
                        resolve(session);
                    })
                    .catch(error => {
                        reject(error);
                    });
            },
            onFailure: reject,
        });
    });
}

// export async function ensureValidCredentialsForCurrentUser() {
//     getSession// TODO
// }

function updateCredentials(session) {
    return new Promise((resolve, reject) => {
        AWS.config.credentials = new AutoRefreshCredential({
            IdentityPoolId : IDENTITY_POOL_ID,
            getSession: getCurrentSession,
            RoleArn: IDENTITY_POOL_AUTH_ROLE_ARN,
            Logins: {},
            // Logins : {
            //     [`cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`]:
            //         session.getIdToken().getJwtToken()
            // }
        });

        // TODO ensure refresh is called automatically by AWS
        AWS.config.credentials.refresh(error => {
            if (error) {
                console.error('updateCredentials AWS.config.credentials.get error: ', error);
                return reject(error);
            }
            console.log('updateCredentials AWS.config.credentials updated: ', AWS.config.credentials);
            // const et = AWS.config.credentials.expireTime;
            // console.log('updateCredentials: expireTime: ', et instanceof Date, et);
            resolve();
        });
    });

}

export async function getSession(cognitoUser) {
    console.log('getSession cognitoUser: ', JSON.stringify(cognitoUser, null, ' '));
    // if session is valid
    if (cognitoUser.getSignInUserSession() != null && cognitoUser.getSignInUserSession().isValid()) {
        console.log('getSession: signInUserSession is already valid');
        return cognitoUser.getSignInUserSession();
    }
    console.log('getSession: signInUserSession is NOT valid');
    console.log('getSession: signInUserSession: ', JSON.stringify(cognitoUser.getSignInUserSession, null, ' '));

    // if session has expired:

    const fn = callbackToPromise(cognitoUser.getSession, cognitoUser);
    const session = await fn();
    await updateCredentials(session);
    return session;

    // console.log('getSession cognitoUser: ', JSON.stringify(cognitoUser, null, ' '));
    // console.log('getSession session: ', JSON.stringify(session, null, ' '));
    // console.log('getSession AWS.config.credentials before: ', JSON.stringify(AWS.config.credentials, null, ' '));
    // updateCredentials(session);
    // console.log('getSession AWS.config.credentials updating: ', JSON.stringify(AWS.config.credentials, null, ' '));
    // AWS.config.credentials.get(error => {
    //     if (error) {
    //         console.error('getSession AWS.config.credentials.get error: ', error);
    //         return;
    //     }
    //     console.log('getSession AWS.config.credentials updated: ', AWS.config.credentials);
    // });
}

export async function getCurrentSession() {
    // const cognitoUser = await userPool.getCurrentUser();
    // if (cognitoUser == null) {
    //     throw new Error('No current user');
    // }
    // return await getSession(cognitoUser);
    const cognitoUser = await getCurrentUser();
    return cognitoUser.getSignInUserSession();
}

export async function getCurrentUser() {
    if (_currentUser_) {
        await getSession(_currentUser_); // refreshes session if necessary
        return _currentUser_;
    }

    const cognitoUser = await userPool.getCurrentUser();
    if (cognitoUser == null) {
        throw new Error('No current user');
    }
    _currentUser_ = cognitoUser;
    await getSession(cognitoUser); // refreshes session if necessary
    return cognitoUser;
}

export function getCurrentUserAttributes() {
    return getCurrentUser().then(cognitoUser => {
        return new Promise((resolve, reject) => {
            cognitoUser.getUserAttributes(function(err, res) {
                if (err) {
                    return reject(err);
                }
                console.log('getCurrentUserAttributes: ', res);
                console.log('getCurrentUserAttributes map: ', res.map(x => [x.getName(), x.getValue()]));
                console.log('getCurrentUserAttributes fromPairs: ', fromPairs(res.map(x => [x.getName(), x.getValue()])));
                resolve(fromPairs(res.map(x => [x.getName(), x.getValue()])));
            });
        });
    });
}

export async function signout() {
    const cognitoUser = await getCurrentUser();
    cognitoUser.signOut();
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID,
        // RoleArn: IDENTITY_POOL_UNAUTH_ROLE_ARN,
    });
}

export async function s3GetSignedUrl(operation, params) {
    // TODO can we have just 1 global s3 instance?
    const s3 = new AWS.S3();
    const getSignedUrl = callbackToPromise(s3.getSignedUrl, s3);
    return await getSignedUrl(operation, params);
}
