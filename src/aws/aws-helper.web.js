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


// Sean's AWS account:
/*
const IdentityPoolId = 'us-east-1:bd245beb-b15b-4a45-87a1-1f955f0cc1f7';
const RoleArn = 'arn:aws:iam::063863219770:role/Cognito_myidentitypool1Unauth_Role';
const AccountId = '063863219770';
const UserPoolId = 'us-east-1_8TsX0W4Tz';
const ClientId = '5buhqgfeq5vj1qst7u0rukuvf';
const Region = 'us-east-1';
*/

// Emmanuel's AWS account:
const IdentityPoolId = 'us-east-1:ed5cce84-3ee0-431a-9c48-cb409d707a63';
const RoleArn = 'arn:aws:iam::517510819783:role/Cognito_LambdAuthUnauth_Role';
const AccountId = '517510819783';
const UserPoolId = 'us-east-1_HucYipUfN';
const ClientId = '3l7t9s8f8rjaf8674f6kch4t76';
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

export function getUserFromCache() {
    // TODO
    let username = 'shahab.sh.70@gmail.com';


}
