console.log('======== AWS CLIENT...');

import fromPairs from 'lodash/fromPairs';

import "script!jsbn.js";
//window.BigInteger = BigInteger;

import "script!jsbn2.js";
console.log('BigInteger', BigInteger);


import 'script!sjcl.js';
//window.sjcl = sjcl;

import 'script!moment.min.js';
//window.moment = moment;

import 'script!aws-sdk/dist/aws-sdk';
//const AWS = window.AWS;

import 'script!amazon-cognito-identity-js/dist/aws-cognito-sdk.min.js';
import 'script!amazon-cognito-identity-js/dist/amazon-cognito-identity.min.js';


const IdentityPoolId = 'us-east-1:bd245beb-b15b-4a45-87a1-1f955f0cc1f7';
const RoleArn = 'arn:aws:iam::063863219770:role/Cognito_myidentitypool1Unauth_Role';
const AccountId = '063863219770';
const UserPoolId = 'us-east-1_8TsX0W4Tz';
const ClientId = '5buhqgfeq5vj1qst7u0rukuvf';
const Region = 'us-east-1';



AWS.config.region = Region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId,
    RoleArn,
    AccountId,
});

AWSCognito.config.region = Region;
AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId,
    RoleArn,
    AccountId,
});

var poolData = {
    UserPoolId,
    ClientId,
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
    return new Promise((resolve, reject) => {
        let cognitoUser = userPool.getCurrentUser();
        if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {
                if (err) {
                    reject(err);
                } else {
                    resolve(cognitoUser);
                }
            });
        }
    });
}

export function getUserAttributes() {
    return getCurrentUser().then(cognitoUser => {
        return new Promise((resolve, reject) => {
            cognitoUser.getUserAttributes(function(err, res) {
                if (err) {
                    return reject(err);
                }
                console.log('getUserAttributes: ', res);
                console.log('getUserAttributes map: ', res.map(x => [x.getName(), x.getValue()]));
                console.log('getUserAttributes fromPairs: ', fromPairs(res.map(x => [x.getName(), x.getValue()])));
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
