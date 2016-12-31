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

`CALL_SERVER_LAMBDA_SECRET` should be a random string that matches the same environment variable in the `CallServer` lambda (see "CallServer Lambda" section below).

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

## Setting Up Webhooks
### Cisco Spark
The add-bot page automatically sets up the webhook.

Also see the "Cisco Spark Webhooks" section under "Development Notes".

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
For **server-side** tests, make sure you have `.test.env` file. The database table names and s3 bucket names are used for automated testing and therefore must be different from those in `.env` which are meant for production use.

The tests are located in `src/server/tests/`. Any file in that directory that has the `.test.js` suffix will be executed.

```
npm install
npm test
```

For **client-side** tests, build and run the server as usual, with `NODE_ENV=development`. Then go to `localhost:XXX/dev/tests` in your browser.

The tests are located at `src/client/tests/` and the entry point which is supposed to run all tests is at `src/client/tests/tests.js`.

**Please note that the client-side tests use `.env`, whereas server-side tests use `.test.env`. This is currently not a problem as client-side tests aren't supposed to manipulate the database. However in the future, it's best to use `.test.env` in both cases for consistency.**

Another point worth remembering is that the code at `src/client/tests/tests.js` and all of its dependencies will be excluded from the bundle when in production mode. So you don't have to worry about how heavy a library you'd like to use there.

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


## Contribution
If you'd like to contribute to this project, please read the "Development" section above fist to learn about the workflow.

In the following sections, we'll see some notes explaining the architecture and any possible topic that deserves more explanation than merely the code.


#### Reading the Code
The javascript code uses [Facebook Flow](https://github.com/facebook/flow/). The file `src/misc/types.js` includes most types used in the code. This is an indispensable resource for understanding the code and the data structures.

Please use an editor/IDE with Flow support while developing as it really helps catch errors before run-time and ensures that the type definitions will stay up-to-date.

As of writing this, Webstorm's EAP builds are very stable and have great support for Flow.

Moreover, studying the unit tests is also a great way to understand the source code.

#### Coding Style
It would be very nice to keep the coding style consistent across the project. Here are some notes and examples to demonstrate the coding style. ES7 features are used extensively. 

- Use 4 spaces for indentation
- End every statement with a semicolon
- Avoid using var. Instead use const wherever possible, otherwise let

    ```js
    const a = {
        x: 1,
        y: 2,
    };
    ```
    
- Prefer a more functional style of programming. For example instead of this:

    ```js
    let arr = [];
    for (let i=0; i<data.length; i++) {
        if (data[i]) {
            arr.push(f(data[i]))
        }
    }
    ```
    
  we can write:
  
    ```js
    const arr = data.filter(Boolean).map(f);
    ```
  
- Use `camelCase` for naming variables and functions
- Use `CamelCase` for Classes and Components (even stateless functional components)
- Use `ALL_CAPS` for constants.
- Breaking functions with many long parameters

    ```js
    funcWithLongParams(argument1, argument2, argument3,
                       argument4, argument5, argument6);
  
    ```
    
  or
  
    ```js
    funcWithLongParams(
        argument1, argument2, argument3,
        argument4, argument5, argument6
    );
    ```
    
- Breaking long JSX components

  ```js
    <div
        className="field"
        onClick={e => f(e, 'name')}
        style={style}
    >
        abc
    </div>
    ```
    
- Use `React.createClass` for creating React components (see [here](https://github.com/deepiksdev/node/issues/217) for a discussion regarding ES6 classes)
- When returning a React element using JSX, either the whole statement must fit in 1 line or use parenthesis to wrap it

    ```js
    return <h1>abc</h1>;
    ```
    
  or
  
    ```js
    return (
        <h1>
            abc
        </h1>
    );
    ```
    
  **The following is wrong and will return undefined**
  
    ```js
    return 
        <h1>abc</h1>;
    ```
    
- Array and object destructuring is used extensively

    ```js
    const SomeComponent = React.createClass({
        render() {
            const { propA, propB, ...rest } = this.props;
            const { stateA, stateB } = this.state;
            // ...
        }
    });
    ```

- Prefer stateless functional components wherever possible

    ```js
    const AnotherComponent = ({ propA }) => <h1>{propA}</h1>;
    ```
    
- Do not use decorators. Instead use higher order components as normal functions

    ```js
    MyComponent = connect(
        state => ({
            currentUser: state.currentUser,
        }),
        {
            setModal: actions.setModal,
        }
    )(MyComponent);
  
    MyComponent = withRouter(MyComponent);
    ```
    
- Prefer using `import` and `export` instead of `require` and `module.exports` (see [here](https://github.com/deepiksdev/node/issues/222#issuecomment-257305794) for a couple of exceptions)

    ```js
    import { connect } from 'react-redux';
    
    ```

#### Pull Requests
Please develop your changes in a separate branch and then make a pull request.

#### Cisco Spark Webhooks
Cisco Spark webhooks are supposed to automatically register/unregister when updating a bot. However, if due to a bug or any other reason webhooks are not properly setup or old webhooks are not properly remove, then
- clear `ciscosparkAccessToken` in bot's settings
- use the `SparkWebHookManager` utility from [github.com/deepiksdev/bash/](https://github.com/deepiksdev/bash/) to unregister all webhooks
- update the bot again with the proper `ciscosparkAccessToken`

Make sure you use the same access token for `SparkWebHookManager` as you use in the bot's settings.

#### Checking the Logs
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

#### Internationalization (i18n)
Translations for client-side code are stored in `src/i18n/` whereas the translations for the server-side code, such as messages coming from the bot are stored in `src/server/i18n/`.


#### Constants and Environment Variables
Regardless of what method you use to define your env variables, `webpack-config-server.js` checks to make sure mandatory variables are provided and the default values for optional variables are set. Then these env variables will be bound to the `__ENV_VARS__` global variable which is hard-coded in the server code using webpack's [DefinePlugin](https://webpack.github.io/docs/list-of-plugins.html#defineplugin).

The first file that runs in the server is `src/server/preamble.js` which reads `__ENV_VARS__` and updates `process.env`, but does not override variables that already existed in `process.env`.

Some of these env variables are meant to be used as they are, some need to be changed and some new constants need to be added. `src/server/server-utils.js` defines all constants as `CONSTANTS` using `process.env` as its base.

Not every constant should be sent to the client. Some may be secrets and some just not useful. In `src/server/server-side-rendering.js`, the server injects the relevant constants into the client. The client will then use `CONSTANTS` defined in `src/client/client-utils.js` to access them.

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

Now depending on your configurations, faviconURL could be a relative path to `dist-client` or the URL to the corresponding file in CDN. The constant `PUBLIC_URL` will be explained in the next section.

**Please use CDN in production to serve static files.** See "Deploy" section for more details.

#### CDN, PUBLIC_URL and How They Are Configured
As mentioned above, if you set the CDN environment variable, the URL of all static resources will be changed to use the CDN. Here we explain how it works.

In `src/server/server.js` static files from the `dist-client` directory will be served at the public path `CONSTANTS.PUBLIC_PATH`.

The constants `PUBLIC_PATH` and `PUBLIC_URL` are created at build time in `webpack-config-base.js`:
```js
PUBLIC_PATH = (cdn ? `/dist_${timestamp}/`        : '/dist/')
PUBLIC_URL =  (cdn ? `${cdn}/dist_${timestamp}/`  : '/dist/')
```
where `cdn` is just the `CDN` env variable and `timestamp` is the epoch timestamp at build time. So for example if somewhere in your code you used any one of the 3 methods to use a static file (see the "Static Files" section above):
```js
import { CONSTANTS } from '../../client/client-utils.js';
const faviconURL = `${CONSTANTS.PUBLIC_URL}favicon.png`;
```

and have `CDN` set to `https://XXX.cloudfront.net` and the build timestamp is `1480987650714`, then `faviconURL` will be: `https://XXX.cloudfront.net/dist_1480987650714/favicon.png`.

Now when a browser makes a request to `https://XXX.cloudfront.net/dist_1480987650714/favicon.png` for the first time, cloudfront cannot find the file in its cache because the **timestamp has made the url unique to this build**. So cloudfront will make a request to the node server at path `/dist_1480987650714/favicon.png`. The node server will serve the file to cloudfront only once and from then on, the file will stay in cloudfront's cache for days.

The next time you deploy the server, a new timestamp will be created at build time, `PUBLIC_URL` will be different and cloudfront must contact the server again. This way, we don't have to manually empty the CDN cache or wait until the cache expires. The CDN just works immediately after each build.

Since we want the timestamp, and therefore `PUBLIC_URL`, to be the same for the client and the server builds, we use a script `scripts/build.sh` which will create a timestamp and pass it to build the server and the client. This is the script that is called when you run: `npm run build`.


#### Creating a New Channel
In order to create a new channel, the first thing we need is to set up a webhook, that is an end-point through which the channel's servers can communicate with our server.

Webhook routes are defined in `src/server/server-router.js`
```js
routes.use('/webhooks/:publisherId/:botId/:channel', (req, res, next) => {
    /*...*/
});
```

which uses the list of all available webhooks and their handlers defined in `src/server/channels/all-channel.js` to handle each request. For example the Messenger channel is implemented in `src/server/channels/messenger.js` and its webhook handler is the `webhook` function.

The job of a webhook handler is to:
- take a request
- extract the message(s) inside it (as an object of type `WebhookMessage`)
- pass it on to `deepiksBot` (will be explained shortly)
- send the responses (of type `ResponseMessage`) coming from `deepiksBot` back to the user
- call dashbot to collect statistics

The `deepiksBot` function defined in `src/server/deepiks-bot/deepiks-bot.js` is independent of any channel. It updates the database, store images in S3, handles user authorization, calls the conversational engine, etc. One of its parameters is a callback function of type `RespondFn`. It calls this function when a message must be sent back to the user.

Some features such as sending news feeds, notifications and transfer to human involve sending a message which is not a direct response to a message from users. So every channel also implements a `send` function which will be used from the `send` function in `all-channels.js`.

Make sure you update `all-channels.js`'s `send` function when creating a new channel.

Please see [issue #266](https://github.com/deepiksdev/node/issues/266) for a more complete explanation of `RespondFn` and the `send` functions.

#### Front-End - Immutable Props
**The entire application state and all `props` of every component are immutable. Please ensure that you do not ever modify them directly. Always use actions to update the application state and let Redux+React propagate the props down to each component.**

Please see [Redux](http://redux.js.org/) for more details.

#### Promises and Async
Please remember that by default promises swallow errors and **silently fail**:

```js
async function f() {
    throw new Error('Can you see this message?');
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

#### Use `debug.js` instead of `console.log`, `console.error` etc.
Please pick a meaningful name when creating the report functions. The name of the file is a good choice.

```js
const reportDebug = require('debug')('deepiks:this-file-name');
const reportError = require('debug')('deepiks:this-file-name:error');

reportDebug('here is a message');
reportError('here is an error');
```
