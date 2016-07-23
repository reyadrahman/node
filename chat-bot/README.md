# Chat Bot
## Config
### .env file or Environment variables in console
```
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DB_TABLE_BOTS=bots
DB_TABLE_CONVERSATIONS=conversations
DB_TABLE_WIT_SESSIONS=witSessions
S3_BUCKET_NAME=deepiksbotdev
GOOGLE_CLOUD_VISION_API_KEY=
MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY=
WIT_ACCESS_TOKEN=
FAKE_SIMILAR_IMAGES=
```

Setting `FAKE_SIMILAR_IMAGES` to `1`, is useful for development. It avoids connecting to 'find similar images' server and returns fake images instead.

### .test.env file or environment variables in console
This is the same as `.env` but only used for running the tests (see below). Since tests are only run locally, `.ebextensions/*` files have no effect here.

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
  "publisherId": "somePublisherA",
  "settings": {
    "ciscosparkAccessToken": "XXX",
    "ciscosparkBotEmail": "XXX",
    "messengerPageAccessToken": "XXX",
    "microsoftAppId": "XXX",
    "microsoftAppPassword": "XXX"
  }
}
```

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
The webhook target url is https://SOME_DOMAIN/BOT_ID/webhooks/spark
Where `SOME_DOMAIN` and `BOT_ID` must be replaced with appropriate values.
Use SparkWebHookManager to set up webhooks.

### Messenger
The webhook target url is https://SOME_DOMAIN/BOT_ID/webhooks/messenger
Where `SOME_DOMAIN` and `BOT_ID` must be replaced with appropriate values.
Messenger requires a HTTPS webhook.

See the first 4 steps in [this page](https://developers.facebook.com/docs/messenger-platform/quickstart). In step 2 when setting up the webhook, select messages. Use the url above for the `Callback URL` and use `boohoo` for `Verify token`. Your server must be running before the webhook can be set up.

One thing that wasn't mentioned in the link above is that in order to change the webhook url or delete it, you must first use the menu on the right to select "Add Product" and add "Webhooks". That will create "Webhooks" item in the right menu which you can use to manage your webhooks.

Before your facebook app is published, only developers and testers can use it. You must go to your App's dashboard -> Roles -> Add developers.

Unfortunately facebook does not support adding bots to group chats.

### Microsoft Bot Framework
The webhook target url is https://SOME_DOMAIN/BOT_ID/webhooks/ms
Where `SOME_DOMAIN` and `BOT_ID` must be replaced with appropriate values.
Must be using the new Bot Framework V3.

Create an app in your [Microsoft account](https://apps.dev.microsoft.com) and create a bot in [Microsoft Bot Framework](https://dev.botframework.com/bots?id=botframework)

Then go to [my bots](https://dev.botframework.com/bots?id=botframework) and under "Channels" add the channel that you want (skype, slack etc) and follow the instructions.

Currently Skype and Slack are supported.

## Development
### Tests
Make sure you have `.test.env` file. The database table names and s3 bucket names are used for automated testing and therefore must be different from those in `.env` which are meant for real use.

```
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
