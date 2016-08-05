console.log('======== AWS CLIENT...');

import { CLIENT_ENV } from '../misc/utils.js';

const { IDENTITY_POOL_ID, IDENTITY_POOL_ROLE_ARN, USER_POOL_ID,
        USER_POOL_APP_CLIENT_ID, AWS_REGION} = CLIENT_ENV;

const XMLHttpRequest = require('xhr2');
global.XMLHttpRequest = XMLHttpRequest;

// server uses 'aws-sdk'. Client uses 'external_modules/aws-sdk.js'
import 'script!aws-sdk.js';
import "script!jsbn.js";
import "script!jsbn2.js";
import 'script!sjcl.js';
import 'script!moment.min.js';
import 'script!amazon-cognito-identity/dist/aws-cognito-sdk.min.js';
import 'script!amazon-cognito-identity/dist/amazon-cognito-identity.min.js';

import fromPairs from 'lodash/fromPairs';

AWS.config.region = AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
    RoleArn: IDENTITY_POOL_ROLE_ARN,
    // AccountId,
});

AWSCognito.config.region = AWS_REGION;
AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
    RoleArn: IDENTITY_POOL_ROLE_ARN,
    // AccountId,
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
            onSuccess: resolve,
            onFailure: reject,
        });
    });
}

export function getCurrentUser() {
    console.log('X 1');
    return new Promise((resolve, reject) => {
        console.log('X 2');
        let cognitoUser = userPool.getCurrentUser();
        if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {
                if (err) {
                    reject(err);
                } else {
                    resolve(cognitoUser);
                }
            });
        } else {
            reject('no current user');
        }
    });
}

export function getCurrentUserAttributes() {
    console.log('1');
    return getCurrentUser().then(cognitoUser => {
        console.log('2');
        return new Promise((resolve, reject) => {
            console.log('3');
            cognitoUser.getUserAttributes(function(err, res) {
                console.log('4');
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

export function signout() {
    return getCurrentUser().then(cognitoUser => {
        cognitoUser.signOut();
    });
}

/*
export function getUserFromCache() {
    // TODO
    let username = 'shahab.sh.70@gmail.com';
}
*/
