/* @flow weak */

import { CONSTANTS } from '../client/client-utils.js';
import { callbackToPromise } from '../misc/utils.js';
import _ from 'lodash';
import Cookies from 'js-cookie';
const reportDebug = require('debug')('deepiks:aws');
const reportError = require('debug')('deepiks:aws:error');

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
        reportDebug('AutoRefreshCredential refresh');
        this.getSession()
            .then(session => {
                console.group();
                reportDebug('AutoRefreshCredential got session: ', session);
                console.groupEnd();
                this.params.Logins[`cognito-idp.${CONSTANTS.AWS_REGION}.amazonaws.com/${CONSTANTS.USER_POOL_ID}`] =
                    session.getIdToken().getJwtToken();
                reportDebug('AutoRefreshCredential params: ', this.params);
                super.refresh(cb);
            })
            .catch(cb);
    }
}


var _currentUser_ = null;


AWS.config.region = CONSTANTS.AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: CONSTANTS.IDENTITY_POOL_ID,
    RoleArn: CONSTANTS.IDENTITY_POOL_UNAUTH_ROLE_ARN,
    // AccountId,
});

// $FlowFixMe
AWSCognito.config.region = CONSTANTS.AWS_REGION;
AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: CONSTANTS.IDENTITY_POOL_ID,
// TODO is this needed?
//     RoleArn: CONSTANTS.IDENTITY_POOL_UNAUTH_ROLE_ARN,
//     // AccountId,
});

var poolData = {
    UserPoolId: CONSTANTS.USER_POOL_ID,
    ClientId: CONSTANTS.USER_POOL_APP_CLIENT_ID,
};
var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);


export function signUp(firstName, lastName, email, password) {
    return new Promise((resolve, reject) => {
        let attributeList = [];
        let dataEmail = {
            Name : 'email',
            Value : email,
        };
        let attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
        attributeList.push(attributeEmail);

        let dataGivenName = {
            Name : 'given_name',
            Value : firstName,
        };
        let attributeGivenName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataGivenName);
        attributeList.push(attributeGivenName);


        let dataFamilyName = {
            Name : 'family_name',
            Value : lastName,
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

        userPool.signUp(email, password, attributeList,
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

export function signIn(email, password) {
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
                        Cookies.set('signedIn', 'yes', { expires: 1000, path: '/' });
                    })
                    .catch(error => {
                        reject(error);
                    });
            },
            onFailure: reject,
        });
    });
}

export async function updateCurrentUserAttrsAndPass(attrs: Object,
                                                    oldPassword?: string,
                                                    newPassword?: string)
{
    reportDebug('aws.updateCurrentUserAttrsAndPass attrs: ', attrs);
    const cognitoUser = await getCurrentUser();
    const cp = callbackToPromise(cognitoUser.changePassword, cognitoUser);
    if (newPassword) {
        const cpRes = await cp(oldPassword, newPassword);
        reportDebug('aws.updateCurrentUserAttrsAndPass password update res: ', cpRes);
    }

    const attributeList = _.map(attrs, (v, k) =>
        new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: k,
            Value: v,
        })
    );
    const ua = callbackToPromise(cognitoUser.updateAttributes, cognitoUser);
    const res = await ua(attributeList);
    reportDebug('aws.updateCurrentUserAttrsAndPass attrs update res: ', res);
}

function updateCredentials(session) {
    return new Promise((resolve, reject) => {
        AWS.config.credentials = new AutoRefreshCredential({
            IdentityPoolId : CONSTANTS.IDENTITY_POOL_ID,
            getSession: getCurrentSession,
            RoleArn: CONSTANTS.IDENTITY_POOL_AUTH_ROLE_ARN,
            Logins: {},
            // Logins : {
            //     [`cognito-idp.${CONSTANTS.AWS_REGION}.amazonaws.com/${CONSTANTS.USER_POOL_ID}`]:
            //         session.getIdToken().getJwtToken()
            // }
        });

        // TODO ensure refresh is called automatically by AWS
        AWS.config.credentials.refresh(error => {
            if (error) {
                reportError('updateCredentials AWS.config.credentials.get error: ', error);
                return reject(error);
            }
            reportDebug('updateCredentials AWS.config.credentials updated: ', AWS.config.credentials);
            // const et = AWS.config.credentials.expireTime;
            // reportDebug('updateCredentials: expireTime: ', et instanceof Date, et);
            resolve();
        });
    });

}

export async function getSession(cognitoUser) {
    console.group();
    reportDebug('getSession cognitoUser: ', JSON.stringify(cognitoUser, null, ' '));
    console.groupEnd();
    // if session is valid
    if (cognitoUser.getSignInUserSession() != null && cognitoUser.getSignInUserSession().isValid()) {
        reportDebug('getSession: signInUserSession is already valid');
        return cognitoUser.getSignInUserSession();
    }
    reportDebug('getSession: signInUserSession is NOT valid');
    reportDebug('getSession: signInUserSession: ', JSON.stringify(cognitoUser.getSignInUserSession, null, ' '));

    // if session has expired:

    const fn = callbackToPromise(cognitoUser.getSession, cognitoUser);
    const session = await fn();
    await updateCredentials(session);
    return session;

    // reportDebug('getSession cognitoUser: ', JSON.stringify(cognitoUser, null, ' '));
    // reportDebug('getSession session: ', JSON.stringify(session, null, ' '));
    // reportDebug('getSession AWS.config.credentials before: ', JSON.stringify(AWS.config.credentials, null, ' '));
    // updateCredentials(session);
    // reportDebug('getSession AWS.config.credentials updating: ', JSON.stringify(AWS.config.credentials, null, ' '));
    // AWS.config.credentials.get(error => {
    //     if (error) {
    //         reportError('getSession AWS.config.credentials.get error: ', error);
    //         return;
    //     }
    //     reportDebug('getSession AWS.config.credentials updated: ', AWS.config.credentials);
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

export async function getCurrentUserAttributes() {
    const cognitoUser = await getCurrentUser();
    const getAttrs = callbackToPromise(cognitoUser.getUserAttributes, cognitoUser);
    const res = await getAttrs();
    reportDebug('getCurrentUserAttributes: ', res);
    return _.fromPairs(res.map(x => [ x.getName(), x.getValue() ]));
}

export async function signOut() {
    try {
        const cognitoUser = await getCurrentUser();
        cognitoUser.signOut();
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: CONSTANTS.IDENTITY_POOL_ID,
            // RoleArn: CONSTANTS.IDENTITY_POOL_UNAUTH_ROLE_ARN,
        });
        Cookies.remove('signedIn', { path: '/' });
    } catch(error) {}
}

export async function s3GetSignedUrl(operation, params) {
    // TODO can we have just 1 global s3 instance?
    //      what's the cost of creating a new instance?
    const s3 = new AWS.S3();
    const getSignedUrl = callbackToPromise(s3.getSignedUrl, s3);
    return await getSignedUrl(operation, params);
}
