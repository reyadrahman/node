# Chat Bot AI Actions
The configs and the work flow is pretty much the same as "Chat Bot" with a few exceptions.

1. This does not initialize resources such as DynamoDB or S3
2. Different environment variables

## Config
### .env file or Environment variables in console
```
NODE_ENV=production
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DB_TABLE_BOTS=
DB_TABLE_CONVERSATIONS=
DB_TABLE_MESSAGES=
S3_BUCKET_NAME=
GOOGLE_CLOUD_VISION_API_KEY=
MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY=
FAKE_SIMILAR_IMAGES=1
```

`NODE_ENV` can be `production` (default) or `development`.

Setting `FAKE_SIMILAR_IMAGES` to `1`, is useful for development. It avoids connecting to 'find similar images' server and returns fake images instead.

## Build and Deploy
It is recommended that you deploy to the same Elastic Beanstalk app but a different environment. For example, assuming you have deployed the "Chat Bot" server to the "chat-bot" app in "chat-bot-env" environment:
```
npm install
npm run build
eb init
# select us-east-1
# select chat-bot
eb create chat-bot-ai-actions-env
eb use chat-bot-ai-actions-env
```

This will "chat-bot-ai-actions-env" environment for the "chat-bot" app and deploy it. The very last command sets this new environment as the default for this directory. Check out "Chat Bot"s `README.md` file for instruction on how to redeploy.

After deploying, to get the url of the server, run:
```
eb status | grep CNAME
# example output:
# CNAME chat-bot-ai-actions-env.xxxx.us-east-1.elasticbeanstalk.com
```
In the example output, the URL of the server would be [http://chat-bot-ai-actions-env.xxxx.us-east-1.elasticbeanstalk.com](http://chat-bot-ai-actions-env.xxxx.us-east-1.elasticbeanstalk.com).

Use this URL for the `AI_ACTIONS_SERVER` environment variable of the "Chat Bot" server.
