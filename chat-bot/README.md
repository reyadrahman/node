# Chat Bot
## Config
### .env file or Environment variables in console
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
MICROSOFT_APP_ID=
MICROSOFT_APP_PASSWORD=
MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY=
FAKE_SIMILAR_IMAGES=
```

Setting `FAKE_SIMILAR_IMAGES` to `1`, is useful for development. It avoids connecting to 'find similar images' server and returns fake images instead.

### .ebextensions
Leave `.ebextensions/00.config` as is. Add your configs in separate files (e.g. `.ebextensions/01.config`). Everything in `.ebextensions/` is git-ignored except `00.config`.

Environment variables defined in these config files will overwrite those in `.env` file.

## Chat Bot's DynamoDB Database
The table must have the primary key `roomId` of type `String` and sort key `timestamp` of type `Number`.

## S3 Bucket
Add the following policy to your bucket (replace `XXXXX` with your bucket's name):
```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "AddPerm",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::XXXXX/*"
		}
	]
}
```
Make sure the bucket has "View Permissions" for "Everyone" so that it can be accessed by external services for image keyword detection and find similar images.

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
The webhook target url is https://SOME_DOMAIN/webhooks/spark
Use SparkWebHookManager to set up webhooks.

### Messenger
The webhook target url is https://SOME_DOMAIN/webhooks/messenger
Messenger requires a HTTPS webhook.

See the first 4 steps in [this page](https://developers.facebook.com/docs/messenger-platform/quickstart). In step 2 when setting up the webhook, select messages. Use the url above for the `Callback URL` and use `boohoo` for `Verify token`. Your server must be running before the webhook can be set up.

One thing that wasn't mentioned in the link above is that in order to change the webhook url or delete it, you must first use the menu on the right to select "Add Product" and add "Webhooks". That will create "Webhooks" item in the right menu which you can use to manage your webhooks.

Before your facebook app is published, only developers and testers can use it. You must go to your App's dashboard -> Roles -> Add developers.

Unfortunately facebook does not support adding bots to group chats.

### Microsoft Bot Framework
The webhook target url is https://SOME_DOMAIN/webhooks/ms
Must be using the new Bot Framework V3.

Create an app in your [Microsoft account](https://apps.dev.microsoft.com) and create a bot in [Microsoft Bot Framework](https://dev.botframework.com/bots?id=botframework)

Then go to [my bots](https://dev.botframework.com/bots?id=botframework) and under "Channels" add the channel that you want (skype, slack etc) and follow the instructions.

Currently Skype and Slack are supported.

## Development
During development, instead of `npm run build` or `npm run redeploy`, you can use `npm run build -- --watch` to tell webpack to automatically re-build when something changes. Then after each re-build, you can run `eb deploy` in another terminal to re-deploy.
