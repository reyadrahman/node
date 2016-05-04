console.log('======== AWS CLIENT');

var BigInteger = require("exports?BigInteger!jsbn.js");
window.BigInteger = BigInteger;

require("jsbn2.js");
console.log('BigInteger', BigInteger);


import sjcl from 'sjcl';
window.sjcl = sjcl;

import moment from 'moment';
window.moment = moment;

console.log('AAA');
import 'aws-sdk/dist/aws-sdk';
const AWS = window.AWS;

console.log('BBB');
import 'amazon-cognito-identity-js/dist/aws-cognito-sdk.min.js';
window.AWSCognito = AWSCognito;
console.log('CCC');
import 'amazon-cognito-identity-js/dist/amazon-cognito-identity.min.js';


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

        let responseHandler = (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        };

        userPool.signUp(data.email, data.password, attributeList,
                        null, responseHandler);

    });
}

