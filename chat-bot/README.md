# Chat Bot
## Config
### .env file
For example:
```
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DB_TABLE_NAME=
S3_BUCKET_NAME=
GOOGLE_CLOUD_VISION_API_KEY=
MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY=
CISCOSPARK_ACCESS_TOKEN=
CISCOSPARK_BOT_EMAIL=
MESSENGER_PAGE_ACCESS_TOKEN=
```

### .ebextensions
Leave `.ebextensions/00.config` as is. Add your configs in separate files (e.g. `.ebextensions/01.config`). Everything in `.ebextensions/` is git-ignored except `00.config`.

Environment variables defined in these config files will overwrite those in `.env` file.

## Chat Bot's DynamoDB Database
The table must have the primary key `roomId` of type `String` and sort key `timestamp` of type `Number`.

## Build and Deploy
You should have awsebcli installed and configured. See [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) and [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html?shortFooter=true).
```
npm install
npm run build
eb init
```

The last command (`eb init`) will let you create a new app or choose an old one. If you are creating a new app then you also need to create a new environment which will automatically deploy it as well:
```
eb create
```

This will open the url in your browser:
```
eb open
```

*NOTE: If you change anything and want to redeploy, don't forget to rebuild first:*

```
npm run build
eb deploy
```

## Development
During development, instead of `npm run build`, you can use `npm run build -- --watch` to tell webpack to automatically rebuild when something changes.

## Setting Up Webhooks
### Spark
The webhook target url is https://SOME_DOMAIN/webhooks/spark
Use SparkWebHookManager to set up webhooks.

### Messenger
The webhook target url is https://SOME_DOMAIN/webhooks/messenger
Messenger requires a HTTPS webhook.

See the first 4 steps in [this page](https://developers.facebook.com/docs/messenger-platform/quickstart). In step 2 when setting up the webhook, select messages. Use the url above for the `Callback URL` and use `boohoo` for `Verify token`.

Before your facebook app is published, only developers and testers can use it. You must go to your App's dashboard -> Roles -> Add developers.

Unfortunately facebook does not support adding bots to group chats.
