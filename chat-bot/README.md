# Chat Bot
## Config
### .env file or Environment variables in console
```
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DB_TABLE_BOTS=bots
DB_TABLE_CONVERSATIONS=
DB_TABLE_MESSAGES=
DB_TABLE_AI_ACTIONS=
S3_BUCKET_NAME=
```

`NODE_ENV` can be `production` (default) or `development`.

Check out "chat-bot-ai-actions"s `README.md` for instructions on how to get the `AI_ACTIONS_SERVER` value.

### .test.env file or environment variables in console
This is mostly the same as `.env` but only used for running the tests (see below). So pick different names for the database tables and s3 buckets as they will be modified. `.test.env` needs the following variables in addition to those of `.env`:

```
WIT_ACCESS_TOKEN=
```

Since tests are only run locally, `.ebextensions/*` files have no effect here.

### .ebextensions
Leave `.ebextensions/00.config` as is. Add your configs in separate files (e.g. `.ebextensions/01.config`). Everything in `.ebextensions/` is git-ignored except `00.config`.

Environment variables defined in these config files will overwrite those in `.env` file.

### Resources (Database and S3)
No need to configure the database or s3 buckets. They are created automatically if none exists.

NOTE: Existing database tables and s3 buckets are never overwritten.

Temporarily, until we have a UI for registering publishers and creating bots, we can enter bots' information directly into the DynamoDB table named by `DB_TABLE_BOTS`. For example an item in the table would look like this:
```
{
  "botId": "someBotId",
  "publisherId": "somePublisherId",
  "settings": {
    "ciscosparkAccessToken": "XXX",
    "ciscosparkBotEmail": "XXX",
    "messengerPageAccessToken": "XXX",
    "microsoftAppId": "XXX",
    "microsoftAppPassword": "XXX"
  }
}
```

Also you can enter AI actions directly into `DB_TABLE_AI_ACTIONS`. See "AI Actions" section for more details.

### AI Actions (Config)
Each item in the `DB_TABLE_AI_ACTIONS` table represents 1 action, its name and target. The target could be a lambda function (mentioned by its name) or a URL. For example:
```
{
    "action": "getForecast",
    "lambda": "get-forecast-development"
}
```
This item sets the action named "getForecast" to the lambda function named "get-forecast-development".

**NOTE: When using node-lambda to deploy, it may add a suffix like "-development" to the name of your lambda**

An example of a URL action:
```
{
    "action": "getForecast",
    "url": "http://xxx.com/get-forecast"
}
```

You can add/remove/modify actions at run-time and the changes will take effect within at most 10s. That's because in order to avoid a DB call for every action, chat-bot caches the table for 10s.

## AI Actions (API)
Actions receive JSON data in the following form:
```
{
    "sessionId": "abcdefghi123",
    "context": { },
    "publisherId": "abcdefg",
    "botId": "abcdefghijkl",
    "entities": {
        "location": [
            {
                "confidence": 0.959803566093133,
                "type": "value",
                "value": "London",
                "suggested":true
            }
        ]
    }
}
```
- `sessionId`, `context` and `entities` are all values the chat-bot has received from Wit.ai. You can check Wit.ai's docs for more details on that
- Lambda actions receive the data in their `event` argument.
- URL actions receive it in the body of a **POST** request.

Each action is supposed to return JSON data in the following form:
``` json
{
    "msg": {
        "text": "some text message for user",
        "files": [
            "http://xxx.com/a.jpg",
            "http://xxx.com/b.jpg",
        ],
        "quickReplies": [
            "option A",
            "option B"
        ]
    },
    "context": {
        "forecast": "raining"
    }
}
```
- `context` will be sent directly to Wit.ai.
- `msg` is **optional**. It's just a message that will be sent to the user.
- `msg` must have **at least one** of `text`, `files` or `quickReplies`.

## Build and Deploy
You should have awsebcli installed and configured. See [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) and [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html?shortFooter=true).
```
npm install
npm run build
eb init
```

The last command (`eb init`) will let you create a new app or choose an old one (but it won't deploy)

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

After changing the source (or `git pull`) run the following to re-deploy:
```
npm run redeploy
```

## Setting Up Webhooks
### Spark
The webhook target url is https://SOME_DOMAIN/webhooks/PUBLISHER_ID/BOT_ID/spark
Where `SOME_DOMAIN`, `PUBLISHER_ID` and `BOT_ID` must be replaced with appropriate values.
Use SparkWebHookManager to set up webhooks.

### Messenger
The webhook target url is https://SOME_DOMAIN/webhooks/PUBLISHER_ID/BOT_ID/messenger
Where `SOME_DOMAIN`, `PUBLISHER_ID` and `BOT_ID` must be replaced with appropriate values.
Messenger requires a HTTPS webhook.

See the first 4 steps in [this page](https://developers.facebook.com/docs/messenger-platform/quickstart). In step 2 when setting up the webhook, select messages. Use the url above for the `Callback URL` and use `boohoo` for `Verify token`. Your server must be running before the webhook can be set up.

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
### Tests
Make sure you have `.test.env` file. The database table names and s3 bucket names are used for automated testing and therefore must be different from those in `.env` which are meant for real use.

```
npm install
npm test
```

### Faster workflow
During development, instead of `npm run build` or `npm run redeploy`, you can use `npm run build -- --watch` to tell webpack to automatically re-build when something changes. Then after each re-build, you can run `eb deploy` in another terminal to re-deploy.

In the same way you could use `npm test -- --watch` instead of `npm test`.


## TODO
Webhooks must verify request signatures. For messenger, something like this could work:
```
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', FB_APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

```
