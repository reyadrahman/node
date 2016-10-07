# Chat Bot
## Concepts and vocabulary
In this project, we use the following terms
- `publisher` represents the owner of a bot. A `publisher`can have several bots.
- `person`is someone represented by one or several e-mail addresses
- `user`represents someone talking with a bot owned by a `publisher`. It is important to note that we need to segregate the data between `publishers`. So, basically, a `user`of a given bot is always different from a `user`of another bot, even if it is the same `person`.
- `reseller`is an organization which resells Deepiks services. At this time, we do not have any reseller, except Deepiks itself. We will probably have some in the future, and provide them a white label version of this `platform`. Technically speaking, a `publisher`working with a given `reseller`is always different from a `publisher`working with another `reseller`, there should be no link between the 2 accounts.
- `channel`represents the different types of bots implemented, for example Messenger, Skype, Spark ... We previously used the word `platform`that now use for our own service as a whole
- `environment` represents the environment from where the admin site is accessed. Examples of exsting or upcoming `environments`are Browser, Wordpress Plugin, iOS App, Android App ...   
- `agent`represents a set of stories, intents, entities used by one or more `bots`. In wit.ai, an `agent`is called an "app".


## Config
### .env file or Environment variables in console
```
NODE_ENV=
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
CALL_SERVER_LAMBDA_SECRET=
CONTACT_EMAIL=
EMAIL_ACTION_FROM_ADDRESS=
OWN_BASE_URL=
CDN=
PORT=
```

`NODE_ENV`, `DB_TABLES_PREFIX`, `CDN` and `PORT` are **optional**.

`NODE_ENV` can be `production` (default) or `development`.

`CALL_SERVER_LAMBDA_SECRET` should be a random string that matches the same environment variable in the `CallServer` lambda (see "CallServer Lambda" section below).

`OWN_BASE_URL` is the full address of your server (e.g. https://deepiks.io) and is used to, for example, set up webhooks automatically.

### .test.env file or environment variables in console
This is mostly the same as `.env` but only used for running the tests (see below). So pick different names for the database tables and s3 buckets as they will be modified. `.test.env` needs the following variables in addition to those of `.env`:

```
WIT_ACCESS_TOKEN=
```

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

### `CallServer` Lambda
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

If you are creating a new app then you also need to create a new environment which will automatically deploy it as well:
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

## Setting Up Webhooks
### Spark
The add-bot page automatically sets up the webhook.

### Messenger
The webhook target url is https://SOME_DOMAIN/webhooks/PUBLISHER_ID/BOT_ID/messenger
Where `SOME_DOMAIN`, `PUBLISHER_ID` and `BOT_ID` must be replaced with appropriate values.
Messenger requires a HTTPS webhook.

See the first 4 steps in [this page](https://developers.facebook.com/docs/messenger-platform/quickstart). In step 2 when setting up the webhook, select "messages" and "messaging_postbacks". Use the url above for the `Callback URL` and use `boohoo` for `Verify token`. Your server must be running before the webhook can be set up.

One thing that wasn't mentioned in the link above is that in order to change the webhook url or delete it, you must first use the menu on the right to select "Add Product" and add "Webhooks". That will create "Webhooks" item in the right menu which you can use to manage your webhooks.

Before your facebook app is published, only developers and testers can use it. You must go to your App's dashboard -> Roles -> Add developers.

Unfortunately facebook does not support adding bots to group chats.

### Microsoft Bot Framework
The webhook target url is https://SOME_DOMAIN/webhooks/PUBLISHER_ID/BOT_ID/ms
Where `SOME_DOMAIN`, `PUBLISHER_ID` and `BOT_ID` must be replaced with appropriate values.
Must be using the new Bot Framework V3.

Create an app in your [Microsoft account](https://apps.dev.microsoft.com) and create a bot in [Microsoft Bot Framework](https://dev.botframework.com/bots?id=botframework)

Then go to [my bots](https://dev.botframework.com/bots?id=botframework) and under "Channels" add the channel that you want (skype, slack etc) and follow the instructions.

Currently Skype and Slack are supported.

## Development
### Git submodules
We are using [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js) as a git submodule. So after running `git clone` for this repository, you need to also populate the submodule using the following command:
```
git submodule update --init
```
You also need to run the above command after `git pull` if the submodule has been modified.

### Tests
Make sure you have `.test.env` file. The database table names and s3 bucket names are used for automated testing and therefore must be different from those in `.env` which are meant for real use.

```
npm install
npm test
```

### Workflow
After `npm install`, you can open 3 terminals and run the following commands in each:
Terminal A:
```
npm run build-server -- --watch
```
Terminal B:
```
npm run build-client -- --watch
```
Terminal C:
```
npm run run-server
```

The first 2 commands, will automatically rebuild on every change (except changes to `.env`). After a rebuild you must kill the server (terminal C) and run it again.

You can also use `npm test -- --watch` to automatically re-run all tests on every change.

### AWS-SDK
The server uses the aws-sdk package from npm. But the client uses a custom built library reduced to only the services we need on the client. Here is how you can build the custom library:
``` sh
git clone https://github.com/aws/aws-sdk-js.git
git checkout v2.4.14
npm install
MINIFY=1 node dist-tools/browser-builder.js cognitoidentity-2014-06-30,s3-2006-03-01 >aws-sdk.min.js
mv aws-sdk.min.js /DEEPIKS_ROOT/external_modules/aws-sdk.min.js

```
Where `DEEPIKS_ROOT` is the root directory of this repository.

For more information see [aws-sdk-js's docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-building.html).


### Development Notes

#### Static Files
The server serves the static files from `dist-client`. This directory is created by Webpack after a build. There are 3 ways for a file to end up in `dist-client`:

1. Webpack's output: these are the Javascript and CSS files that Webpack produces
2. Files that are `require`d **from the client code**. For example if in the client code you have `const logoURL = require('./resources/logo.png')`, then the file `./resources/logo.png` (relative to the source file) will be copied to `dist-client` under a **unique name**. You can then use the `logoURL` to refer to the file. The `logoURL` could be a relative path or prefixed with CDN's domain depending on the the configurations you set via the environment variables.
3. The contents of `resources/copy-to-dist/` will be copy **as-is** to the `dist-client`.


Please note that all `url`s inside CSS/SCSS/LESS files will be treated as if they were `require`d (second method above).

In the client code you can use the second method above (`require(...)`) to get the URL of a static file. However, in the server-only code (e.g. `src/components/html/Html.jsx`), you cannot do that. Instead use the 3rd method above. That is, put the file in `resources/copy-to-dist/` and then you can refer to it as in the following example from `Html.jsx` (assuming `resources/copy-to-dist/favicon.png` exists):

```js
import { CONSTANTS } from '../../client/client-utils.js';
const faviconURL = `${CONSTANTS.PUBLIC_URL}favicon.png`;
```

Now depending on your configurations, faviconURL could be a relative path to `dist-client` or the URL to the corresponding file in CDN.

**Please use CDN in production to serve static files.** See "Deploy" section for more details.

#### Front-End - Immutable Props
**The entire application state and all `props` of every component are immutable.** Please ensure that you do not ever modify them directly. Always use actions to update the application state and let Redux+React propagate the props down to each component.

Please see [Redux](http://redux.js.org/) for more details.

#### Promises and Async
Please remember that by default promises swallow errors and **silently fail**:

```js
async function f() {
    throw new Error('You will not see this message');
}

function bad() {
    f();
}

function good1() {
    f().catch(err => console.error(err));
}

async function good2() {
    try {
        await f();
    } catch(err) {
        console.error(err);
    }
}
```

#### Compose/Decompose keys for DynamoDB
As you can see in `src/misc/types.js`, some properties are composed of multiple keys, for example `publisherId_botId`. Please always use the functions `composeKeys` and `decomposeKeys` located at `src/misc/utils.js` to create or parse these keys. The reason is that the separator is subject to change and later we may need to use nested composition.

#### `dynamoCleanUpObj`

From DynamoDB's docs:

> When you add an item, [...] attribute values cannot be null. String and Binary type attributes must have lengths greater than zero. Set type attributes cannot be empty. **Requests with empty values will be rejected with a ValidationException exception.**

So when adding/updating an item, always wrap your values with `dynamoCleanUpObj` from `src/aws/aws.js` to ensure that empty values will be removed.

For example:

```js
const res = await aws.dynamoUpdate({
    TableName: /*...*/,
    Key: {
        /*...*/
    },
    UpdateExpression: /*...*/,
    ExpressionAttributeValues: {
        ':userLastMessage': aws.dynamoCleanUpObj(message),
    },
});

```