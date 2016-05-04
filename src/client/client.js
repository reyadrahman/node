import 'babel-polyfill';

console.log('!!!! PLATFORM', PLATFORM);

function main() {
    require('../client/client-router.jsx');

    /*
    AWS.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:ed5cce84-3ee0-431a-9c48-cb409d707a63',
        }),
    });
    */
    /*
    AWSCognito.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:ed5cce84-3ee0-431a-9c48-cb409d707a63',
        }),
    });
    */

    /*
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:ed5cce84-3ee0-431a-9c48-cb409d707a63',
    });

    AWSCognito.config.region = 'us-east-1';
    AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:ed5cce84-3ee0-431a-9c48-cb409d707a63',
    });

    var poolData = { UserPoolId : 'us-east-1_HucYipUfN',
                     ClientId : '3l7t9s8f8rjaf8674f6kch4t76',
    };
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : 'email@mydomain.com'
    };
    var dataPhoneNumber = {
        Name : 'phone_number',
        Value : '+15555555555'
    };
    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);

    userPool.signUp('testname', 'testpassword', attributeList, null, function(err, result){
        if (err) {
            console.log(err);
            //alert(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
    });
    */


    /*
    console.log(AWS);
    var data = {
        UserPoolId : 'us-east-1_HucYipUfN',
        ClientId : '3l7t9s8f8rjaf8674f6kch4t76',
    };
    var userPool = new AWS.CognitoIdentityServiceProvider.CognitoUserPool(data);

    var attribute = {
        Name : 'phone_number',
        Value : '+12245657777'
    };

    var attribute = new AWS.CognitoIdentityServiceProvider.CognitoUser;
    Attribute(attribute);
    var attributeList = [];
    attributeList.push(attribute);
    var cognitoUser;

    userPool.signUp('abc', 'somepassword1', attributeList,
                    null, function(err, result)
        {
            if (err) {
                alert(err);
                return;
            }
            console.log('Success', result);
            cognitoUser = result.user;
        });
    */
}

window.onload = main;
