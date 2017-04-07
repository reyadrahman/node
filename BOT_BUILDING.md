# Building a bot
## Creating a `publisher`account on the Deepiks platform
In order to create a bot, you need to sign up on the platform. Currently, you can sign up for free on http://deepiks.botplatform.cloud and create a bot for testing. There is no guaranty that this free service will be maintained in the future, so don't use it for bots in production, and contact contact@deepiks.io if you are looking for a permanent hosting solution.

## Creating an app on wit.ai
The Deepiks platform uses the wit.ai free conversational engine. Sign up on the site, and create an app. Copy the "Server Access Token" that you will find in the settings tab.

## Creating a new bot
In the [admin menu](http://deepiks.botplatform.cloud/settings), select "Create new bot" in the upper left menu.
Enter a name for the bot, the "Wit access token", and leave the other settings empty at this step.

## Setting Up `channels`
### Messenger
See the first 4 steps in [this page](https://developers.facebook.com/docs/messenger-platform/quickstart). In step 2 when setting up the webhook, select "messages" and "messaging_postbacks". Use the url above for the `Callback URL` and use `boohoo` for `Verify token`.

Before your Facebook app is published, only developers and testers can use it. You must go to your App's dashboard -> Roles -> Add developers.


### Microsoft Bot Framework
The webhook target url is https://SOME_DOMAIN/webhooks/PUBLISHER_ID/BOT_ID/ms
Where `SOME_DOMAIN`, `PUBLISHER_ID` and `BOT_ID` must be replaced with appropriate values.
Must be using the new Bot Framework V3.

Create an app in your [Microsoft account](https://apps.dev.microsoft.com) and create a bot in [Microsoft Bot Framework](https://dev.botframework.com/bots?id=botframework)

Then go to [my bots](https://dev.botframework.com/bots?id=botframework) and under "Channels" add the channel that you want (skype, slack etc) and follow the instructions.

Currently Skype and Slack are supported.

### Cisco Spark
The add-bot page automatically sets up the webhook.

Also see the "Cisco Spark Webhooks" section under "Development Notes".

### WeChat
Once you created an official account, login at https://admin.wechat.com

Enter the information required in the wechat section of the bot settings, and the enter the bot url on the wechat admin site.


## Implementing  conversation scripts on wit.ai
### Using stories
Stories are the top level element of the conversation. Dozens of stories are required if you want you chat bot to look smart. We recommend  including standard stories such as:
- "What is your name"
- "Can you help"
- "How are you ?"
- "Tell me a joke"
- ...

In case you are using written sources or documents, we recommend tracking the source of each story for easy maintenance. For example, you can give a title to the story starting with the document code and a page number.

### Using quick replies
Quick replies are a good way to help the `user`, although they are not supported on all `channels`. When not supported, fallback options are implemented in the platform.


### Styling answers
It is possible to use standard [markdown syntax](https://daringfireball.net/projects/markdown/basics) to style answers, especially long ones.

We recommend defining one single answer instead of splitting answers, as splitting answers will not be appropriate on certain `channels`, for example the e-mail `channel`. In order to keep the answer readable, you can use paragraphs (separated by a blank line). Certain `channels`do not support long answers, notably Messenger, but then long answers are split automatically by the platform.

We also recommend using images and emojis to improve the `user` experience.

### Using built in actions
Wit.ai makes it possible to include actions ("Bot executes") inside stories. The platform contains the following built in actions.

#### Store uploaded file
Use the `gotAttachment`action after the `user` uploaded a file, for example an image.
It stores the uploaded file in the `user` directory on the S3 server, and returns the following items:
```
{
  context:
    {
      imageAttachment: [url of the image on the S3 server]

    }
}  
```
#### Store preferences
Entities starting with a `_`sign can be stored in the `user`profile. In order to do so, use the `storePreferences`action, which will return the following items
```
{
  context: [Initial context],
  userPrefs: [Previously stored user prefs + Entities starting with _],
}
```


### Using custom actions
Custom actions can be defined [using AWS Lambda](CUSTOMIZING.md#creating_custom_actions_in_aws_lambda).

### Using Deepiks tags
In addition to using functions, it is possible to include tags specific to Deepiks in order to trigger some actions which require variable inputs. This was implemented in [#145](https://github.com/deepiksdev/node/issues/145) and later, and called "internal function".

Deepiks tags are always under the form `<[function_name : variable_value]>`

#### Sending an e-mail
Use `<[email : email_address]>`, where email_address represents the e-mail address of the recipient

#### Implementing Human In The Loop
Use `<[transfer : channel_id : human_id]>` where channel id represents the channel used to reach the human, and human_id the `user`ID of the human, for example `<[transfer : email : support@deepiks.io]>`. Please note that the "human" must be registered as an "Admin" in the User menu.

#### Creating polls
Use `<[poll : poll_title : question_title ]>` for example `<[poll : Satisfaction_survey : Are_you_happy_with_this_bot_? ]>`

#### Delaying answers
Use `<[delay : number_of_seconds]>` for example `<[delay : 5]>`
