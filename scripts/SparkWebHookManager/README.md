Cisco Spark webhooks are supposed to automatically register/unregister when updating a bot. However, if due to a bug or any other reason webhooks are not properly setup or old webhooks are not properly remove, then
- clear `ciscosparkAccessToken` in bot's settings
- use the `SparkWebHookManager` utility from [github.com/deepiksdev/bash/](https://github.com/deepiksdev/bash/) to unregister all webhooks
- update the bot again with the proper `ciscosparkAccessToken`

Make sure you use the same access token for `SparkWebHookManager` as you use in the bot's settings.

## Initial Settings
You need a `.env`file in this directory with the following contents:

```
CISCOSPARK_ACCESS_TOKEN=
```

In order to get this access token, use a command similar to this
```
curl -X POST -d "grant_type=authorization_code&client_id=Cd2018fc2972a41cccac504cde3afacd58008df994fdb4f37340b670fc60beb2b&client_secret=8439ed42df922a7ab0c0d8f2c9c512effcbc95fb4346fb40c5a5ed4659f68540&code=ZmQzMDdjZTQtNGU1MC00M2QxLWFjZjMtZTVjZjY1MmQ5YTQzZDVkYTE3MzItM2Iw&redirect_uri=http://deepiks.io" https://api.ciscospark.com/v1/access_token```
```

## Registration of new webhooks
```
npm install
node index.js help
```
