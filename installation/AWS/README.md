# Installation on AWS
## Config
### .env file or Environment variables in console
Here are the the list of environment variables with their default values:
```
NODE_ENV=production
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DB_TABLES_PREFIX=
S3_BUCKET_NAME=
IDENTITY_POOL_ID=
IDENTITY_POOL_UNAUTH_ROLE_ARN=
IDENTITY_POOL_AUTH_ROLE_ARN=
USER_POOL_ID=
USER_POOL_APP_CLIENT_ID=
CONVERSATIONAL_ENGINE_LAMBDA=
CALL_SERVER_LAMBDA_SECRET=
CONTACT_EMAIL=
EMAIL_ACTION_FROM_ADDRESS=
OWN_BASE_URL=
CDN=
PORT=3000
DEBUG=deepiks:*
RUNNING_LOCALLY=0
```

`NODE_ENV`, `DB_TABLES_PREFIX`, `CDN`, `PORT`, `DEBUG` and `RUNNING_LOCALLY` are **optional**.

`NODE_ENV` can be `production` (default) or `development`. When set to `development` you get much better error messages and debugging capability, but the output will be 10x larger. This doesn't cause a problem for the bot engine, but the website will be unusable for most people due to the size.

`CALL_SERVER_LAMBDA_SECRET` should be a random string that matches the same environment variable in the `CallServer` lambda (see [CallServer Lambda](#callserver_lambda) section ).

`OWN_BASE_URL` is the full address of your server (e.g. https://deepiks.io) and is used to, for example, set up webhooks automatically.

When you deploy locally set `RUNNING_LOCALLY=1`. Websocket, for example, behaves differently when deployed locally due to lack of nginx and ELB.

### .test.env file or environment variables in console
This is the same as `.env` but only used for running the **server side** tests (the "Tests" secion below). So pick different names for the database tables and s3 buckets as they will be modified.

Since tests are only run locally, `.ebextensions/*` files have no effect here.

### .ebextensions
Leave `.ebextensions/00.config` as is. Add your configs in separate files (e.g. `.ebextensions/01.config`). Everything in `.ebextensions/` is git-ignored except `00.config`.

Environment variables defined in these config files will overwrite those in `.env` file.

### Database and S3
No need to configure the database or s3 buckets. They are created automatically if none exists.

NOTE: Existing database tables and s3 buckets are never overwritten.

### User Pool & Identity Pool
In [AWS Cognito Console](https://console.aws.amazon.com/cognito) you need to create an a user pool by going to "Manage your user pools" and an identity pool by going to "Manage federated identities". Then add their IDs to the environment variables `USER_POOL_ID` and `IDENTITY_POOL_ID`.

While creating the user pool, you also need to create an app for it (`USER_POOL_APP_CLIENT_ID`). When doing so, make sure "Generate client secret" is **unchecked**.

While creating the identity pool, it should automatically create 2 new IAM roles, one for authenticated users (`IDENTITY_POOL_AUTH_ROLE_ARN`) and one for unauthenticated users (`IDENTITY_POOL_UNAUTH_ROLE_ARN`).

Then go to [AWS IAM Console -> Roles](https://console.aws.amazon.com/iam/home#roles) -> select `IDENTITY_POOL_AUTH_ROLE_ARN` role -> edit policy and replace it with the following where `XXX` is the name of your S3 bucket (`S3_BUCKET_NAME`):

``` json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "mobileanalytics:PutEvents",
                "cognito-sync:*",
                "cognito-identity:*"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "AllowPublisherListHisFolder",
            "Action": [
                "s3:ListBucket"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::XXX"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "${cognito-identity.amazonaws.com:sub}/*"
                    ]
                }
            }
        },
        {
            "Sid": "AllowPublisherFullControlOverHisFolder",
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::XXX/${cognito-identity.amazonaws.com:sub}/*"
            ]
        }
    ]
}
```

### Amazon Simple Email Service (SES)
In order to get the contact form to work, you must provide an email address as an environment variable named `CONTACT_EMAIL` and then have it verified in the SES. To verify the email, please go to your [AWS console -> SES](https://console.aws.amazon.com/ses) and in the "Email Addresses" section select "Verify a new email address".

### CallServer Lambda
Some tasks such as feeds processor tasks need to run periodically and some tasks are scheduled to run in the future. In order for them to work you need to deploy the `CallServer` lambda (from the micro-services repository). Then go to AWS console -> CloudWatch -> Events, create a rule of type "Schedule" and **set it to a fixed rate of 1 minute** and select the name of the `CallServer` lambda as the target.

The lambda (as mentioned in its own README), has an environment variable called `CALL_SERVER_LAMBDA_SECRET`. It must be a long random string and must match the `CALL_SERVER_LAMBDA_SECRET` that you provide here (the bot engine).

The `CallServer` lambda also takes another environment variable called `ENDPOINT_URL` which should be the url of the bot engine with the suffix `/run-periodic-tasks`. For example `https://deepiks.io/run-periodic-tasks`.

### AI Actions (Config)
Temporarily, until we have a UI for adding AI actions, we can enter them directly into the DynamoDB table `actions`.

Each item in the `actions` table represents 1 action, its name and target. The target could be a lambda function (mentioned by its name) or a URL. For example:
``` json
{
    "action": "getForecast",
    "lambda": "get-forecast-development"
}
```
This item sets the action named "getForecast" to the lambda function named "get-forecast-development".

**NOTE: When using node-lambda to deploy, it may add a suffix like "-development" to the name of your lambda**

An example of a URL action:
``` json
{
    "action": "getForecast",
    "url": "http://xxx.com/get-forecast"
}
```

You can add/remove/modify actions at run-time and the changes will take effect within at most 10s. That's because in order to avoid a DB call for every action, chat-bot caches the table for 10s.

## AI Actions (API)
Actions receive JSON data in the following form:
``` json
{
    "sessionId": "abcdefghi123",
    "context": { },
    "userPrefs": { },
    "publisherId": "abcdefg",
    "botId": "abcdefghijkl",
    "text": "the text message from user",
    "entities": {
        "location": [
            {
                "confidence": 0.959803566093133,
                "type": "value",
                "value": "London",
                "suggested":true
            }
        ]
    },
    "credentials": {
        "accessKeyId": "xxx",
        "secretAccessKey": "xxx",
        "sessionToken": "xxx",
        "expiration": "2016-08-15T00:24:26.000Z"
    },
    "s3": {
        "bucket": "bucket name",
        "prefix": "s3/directory/with/read/and/write/credentials/"
    },

}
```
- `sessionId`, `context` and `entities` are all values the chat-bot has received from Wit.ai. You can check Wit.ai's docs for more details on that
- Lambda actions receive the data in their `event` argument.
- URL actions receive it in the body of a **POST** request.
- In the action's server if you want to access AWS's services, use the `credentials` provided. See "Temporary Credentials" section for more details
- `context.userPrefs` is the user's preferences. See below for more details.


Each action is supposed to return JSON data in the following form:
``` json
{
    "context": {
        "forecast": "raining"
    },
    "msg": {
        "text": "some text message for user",
        "cards": [
            {
                "imageUrl": "http://xxx.com/a.jpg",
                "title": "title A",
                "subtitle": "subtitle B",
                "actions": [
                    {
                        "text": "button text",
                        "postback": "button's postback",
                        "fallback": "fallback text"
                    },
                    {
                        "text": "button text"
                    }
                ]

            }
        ],
        "actions": [
            {
                "text": "button X",
                "postback": "postback X"
            },
            {
                "text": "button Y",
                "postback": "postback Z",
                "fallback": "fallback text"
            }
        ]
    },
    "userPrefs": {
        "favoritePainter": "Van Gogh"
    }
}
```
- `context` is **required** and will be sent directly to Wit.ai
- `msg` is **optional**. It's just a message that will be sent to the user
- `msg` must have **at least one** of `text`, `cards` or `actions`
- In each card, `title`, `subtitle` and `actions` are **optional**.
- The `actions` inside each card is shown underneath the card itself, but the `msg.actions` is shown underneath the entire message, usually for simple buttons such as "yes" or "no"
- In each action (in `msg.cards[x].actions` or `msg.actions`) `postback` and `fallback` are **optional**. `text` is the label of the button shown to the user. `fallback` is the text shown to the user when the chat service doesn't support buttons. If fallback is omitted, the action will not be shown when buttons are not supported. `postback` is the message that will be sent to the server when the user clicks on the button. If `postback` is not provided, it defaults to the value of `text`.
- `userPrefs` is **optional**. If not provided, the user preferences remain the same. Otherwise, it will replace the old user preferences

***NOTE:*** actions receive `userPrefs` and return `userPrefs` separately from `context`. But in order for wit.ai stories to be able to access `userPrefs`, the server systematically injects the `userPrefs` into the `context` **only** when communicating with the wi.ai servers. This should be transparent to action servers. In wit.ai stories, you can access `userPrefs` like `userPrefs.language` for example.

## Temporary Credentials (Federation Tokens)
Temporary credentials consist of 3 values:
- `accessKeyId`
- `secretAccessKey`
- `sessionToken`

These credentials provide temporary and fine-grained access to certain resources. For example, it provides temporary read/write permissions to a certain S3 bucket and directory for up to 15 minutes.

Here's an example of how to use them in Node.js
``` javascript
import AWS from 'aws-sdk';

function handler() {
    const s3 = new AWS.S3({
        accessKeyId: 'XXX',
        secretAccessKey: 'XXX',
        sessionToken: 'XXX',
    });

    // Now use s3 as normal

    s3.getObject({
        Bucket: 'mybucket',
        Key: 'some/key',
    }, (error, res) => {
        // ...
    });
}
```

## Deploy
We are using [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js) as a git submodule. So after running `git clone` for this repository, you need to also populate the submodule using the following command:
```
git submodule update --init
```
You also need to run the above command after `git pull` if the submodule has been modified.

For deployment, you should have awsebcli installed and configured. See [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) and [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html?shortFooter=true).

This command will let you create a new app or choose an old one (but it won't deploy)
```
eb init
```

If you are creating a new app then you also need to create a new environment which will automatically deploy it as well (**make sure you use application load balancer, as discussed [here](https://github.com/deepiksdev/node/issues/123#issuecomment-259516518)**):
```
eb create
```

If you already have a default environment and just want to deploy, then run:
```
eb deploy
```

This will open the url in your browser:
```
eb open
```

**NOTE: `eb deploy` [deploys git's HEAD commit](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-cli-git.html). You can use `eb deploy --staged` to deploy the staged changes (those that are `git add`'ed)**

### Notes for Production
Use CDN in production to serve static files. All you need to do is to create a distribution in AWS CloudFront, set its origin to your server's domain and set the `CDN` environment variable of your server to your CloudFront's distribution domain.

Once the `CDN` environment variable is set and you deploy the server, every static file will be served through the CDN. Files will be available in the CDN immediately without any delays caused by caching.

When deploying multiple Elastic Beanstalk environments, create a separate CloudFront distribution for each environment with its own origin. Please avoid mixing the origins of multiple environments within the same distribution since it requires extra configurations and when set incorrectly, the CDN may not work at all.

**NOTE: if your website is using HTTPS, so should the CDN. Otherwise browsers will block your CDN files for security reasons**


## Checking the Logs
If you are running the server on AWS Beanstalk, there are 2 ways to check the logs:
- through AWS Console
- through the command line

To check the logs through the console, go to the `AWS console -> Beanstalk -> [select node environment] -> Logs -> Request Logs -> Full Logs -> Download`.

After downloading and extracting it, you can find the logs in `log/nodejs/nodejs.log`. Older logs are compressed in the `log/nodejs/rotated/` directory.

If you use the command line, you can see the logs in real-time. But you do need SSH access to the EC2 instances. See [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-ssh.html) for more information on how to set up the credentials. Make sure `awsebcli` is installed and configured and then:
```bash
eb ssh

# after ssh connection is established:
less /var/log/nodejs/nodejs.log
```
this will show you the latest log. You could also use the following command to see a live and real-time version of the log:
```bash
eb ssh

# after ssh connection is established:
less +F /var/log/nodejs/nodejs.log
```

If `eb ssh` gives an error similar to:
```
Permission denied (publickey).
INFO: Closed port 22 on ec2 instance security group.
ERROR: An error occurred while running: ssh.
```
you can set up the ssh keys using the interactive command:
```bash
eb ssh --setup
```
