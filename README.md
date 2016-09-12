# Chat Bot
## Concepts and vocabulary
In this project, we use the following terms
- `publisher` represents the owner of a bot. A `publisher`can have several bots.
- `person`is someone represented by one or several e-mail addresses
- `user`represents someone talking with a bot owned by a `publisher`. It is important to note that we need to segregate the data between `publishers`. So, basically, a `user`of a given bot is always different from a `user`of another bot, even if it is the same `person`.
- `channel`represents the different types of bots implemented, for example Messenger, Skype, Spark ... We previously used the word `platform`that now use for our own service as a whole
- `environment` represents the environment from where the admin site is accessed. Examples of existing or upcoming `environments`are Browser, Wordpress Plugin, iOS App, Android App ...   
- `agent`represents a set of stories, intents, entities used by one or more `bots`. In wit.ai, an `agent`is called an "app".


## Config
### .env file or Environment variables in console
```
NODE_ENV=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DB_TABLE_BOTS=
DB_TABLE_CONVERSATIONS=
DB_TABLE_MESSAGES=
DB_TABLE_AI_ACTIONS=
DB_TABLE_USER_PREFS=
S3_BUCKET_NAME=
IDENTITY_POOL_ID=
IDENTITY_POOL_UNAUTH_ROLE_ARN=
IDENTITY_POOL_AUTH_ROLE_ARN=
USER_POOL_ID=
USER_POOL_APP_CLIENT_ID=
WIZARD_BOT_WEB_CHAT_SECRET=
CONTACT_EMAIL=
OWN_BASE_URL=
CDN=
PORT=
```

`NODE_ENV`, `CDN` and `PORT` are **optional**.

`NODE_ENV` can be `production` (default) or `development`.

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

Temporarily, until we have a UI for adding AI actions, we can enter them directly into the DynamoDB table named by `DB_TABLE_AI_ACTIONS`. See "AI Actions" section for more details.

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

### AI Actions (Config)
Each item in the `DB_TABLE_AI_ACTIONS` table represents 1 action, its name and target. The target could be a lambda function (mentioned by its name) or a URL. For example:
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
We are using [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js) as a git submodule, because it is not available in npm. So after running `git clone` for this repository, you need to also populate the submodule using the following command:
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

## Setting Up Webhooks
### Spark
The webhook target url is https://SOME_DOMAIN/webhooks/PUBLISHER_ID/BOT_ID/spark
Where `SOME_DOMAIN`, `PUBLISHER_ID` and `BOT_ID` must be replaced with appropriate values.
Use SparkWebHookManager to set up webhooks.

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

### Front-End Architecture

**NOTE: "template"/"website template" shouldn't be confused with "template system/engine". The former is just a website that we use as a starting point, and the latter is a method of inserting some values inside a string (usually a HTML string)**
 
#### Goals and Challenges

Originally we were using React.js, but decided not to continue with it. The reason is that we are trying not to write everything from scratch and most of the templates we wanted to use were incompatible with React.js. For example most templates manipulate the DOM directly, which could conflict with React.js, since it assumes ownership of the DOM.

We need a solution with the following goals:

- very easy to learn
- easy to use with other templates and libraries including jQuery and Bootstrap; so no virtual DOM like React.js
- template system + component system; so we can reuse components as opposed to duplicating code in every page. Without this we would need to duplicate the entire website for each language we want to support and duplicating the common components (e.g. header, menu etc) for each page of those websites and keep all of that in sync manually. This is why we don't simply server `.html` files
- HTML sanitization; avoid cross-site scripting (XSS) attacks the template system should allow sanitization easily
- server-side rendering at least for public pages; necessary for search engine optimization (SEO)
- multi-lingual
- JS and CSS bundling and minification; it's best to avoid including 10s of script and style sheet tags in each page. This is particularly important for mobile
- CSS autoprefixer; support a range of browsers and their different versions
- SCSS or Less; these are what most templates use and therefore should be supported
- single-page app (SPA); it would be very nice to have a dynamic website where every action, including navigation to other pages, doesn't cause a browser refresh
- CDN; would be nice to be able to route all resources through CDN, in particular AWS CloudFront
- ES6 + js modules; would be nice to have

One problem that we face is that we may want to use 2 different templates for the website. For example the landing page is using a different template than the admin page. These templates are completely incompatible with each other and their dependencies clash. One of them is using jQuery 2 and Bootstrap 4 whereas the other jQuery 3 and Bootstrap 3. They both include their libraries as `<script>` tags inside HTML in global context, so there could be name clashes as well. The point is they cannot both be part of the same single-page app.

The solution is to separate them into 2 different single-page apps to make sure the isolation protects against any clashes. But at the same time we'd like to share as much code between them as possible to avoid unnecessary duplications (e.g. the front-end framework, AWS Cognito, client <-> node communication, utilities etc). As with a lot of the points above, Webpack is particularly useful here. So let's examine Webpack's configurations next.

#### Webpack

The command `npm run build-client` uses `webpack-config-client.js` and `npm run build-server` uses `webpack-config-server.js` as their Webpack config. They both share some config in `webpack-config-base.js`.

These config files, specify 2 single-page apps named `landingPage` and `admin`. The entry file of `landingPage` is `./src/client/apps/landing-page/landing-page-entry.js` and the entry file of `admin` is `./src/client/apps/admin/admin-entry.js`.

When you run `npm run build-client`, webpack bundles the entry files and everything imported inside them **recursively** and produces the following files:

- `dist-client/commons.js`: js code that is common between the two apps
- `dist-client/landingPage.js`: js code only used in `landingPage` app
- `dist-client/landingPage.css`: css code for `landingPage.css`
- `dist-client/landingPage/`: the content of `./src/client/apps/landing-page/public/` copied as it is
- `dist-client/admin.js`: js code only used in `admin` app
- `dist-client/admin.css`: css code for `admin.css`
- `dist-client/admin/`: the content of `./src/client/apps/admin/public/` copied as it is

The server serves all files in `dist-client` at `http://DOMAIN/dist/`. But in order to support CDN, if you want to add a url to your HTML, use `ENV.PUBLIC_URL` defined in `src/client/client-utils.js` instead of using `dist-client` directly in your URL. An example taken from `./src/client/apps/landing-page/landing-page.js`:
```js
import { ENV as CLIENT_ENV } from '../../client-utils.js';

import './landing-page.css';
import './extra.css';

export default class LandingPage extends App {
    getScripts(): string[] {
        return [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
            `${PUBLIC_URL}landingPage.js`,
        ];
    }
}
```
In the example above you can also see that we imported 2 CSS files `import './landing-page.css'` and `import './extra.css'`. Webpack will automatically bundle them up and put them inside `dist-client/landingPage.css`. Same goes for any other CSS files imported by any of the dependencies of this file. Moreover, Webpack will look inside all the imported CSS files and fixes all the URLs used inside them (image, fonts etc.) so that they can be routed through CDN as well.


#### Front-End Framework

The front-end framework is in `src/client/front-end-framework/`. This is not much of a framework really, more like a very small library.

As explained in "Goals and Challenges" section, we want:

1. a template system
2. to be able to have a modern dynamic website where every action including page navigation doesn't require a page refresh and connecting to the server. This means that the template system should work on the client as well as the server.
3. the template system should allow HTML sanitization to avoid XSS attacks

Using javascript's own [ES6 template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals), would satisfy all requirements. It's lightweight, fast, easy to use and runs on both the server and the client and using the [tagged template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) feature we can also support HTML sanitization easily.

OK, let examine `component.js` first:

##### Component

Each component receives some properties in its constructor, which is saved in `this.props`. Each app can define its own property type. Each component can pass properties down to its children.

Each component has a `render` method which returns a string. This is the HTML string of the component. It also has 2 other methods `componentDidMount` and `componentWillUnmount` (inspired by React.js). These 2 methods are called when the components are mounted to or unmounted from the DOM. This is a good opportunity to bind click handler to your DOM elements for example or clean up any handlers before being unmounted from DOM.

In order to add a child, use the `addChild` method. For example:
```js
class MyComponent extends Component {
    render() {
        const firstChild = this.addChild(new SomeComponent(/*...*/));
        const firstChild = this.addChild(new SomeComponent(/*...*/));

        return `
            <div>
                ${ firstChild }
                ${ secondChild }
            </div>
        `;
    }
}
```

the default `componentDidMount` and `componentWillUnmount` implementation will call the same method on the children recursively. If you want to re-render a component, call `unmountChildren` first.

Please see `src/client-front-end-framework/component.js` for the full API.

##### App
Let's look at `src/client-front-end-framework/app.js` next:
```js
class App<Props> extends Component<Props> {
    getStyleSheets(): string[]
    getScripts(): string[]
    getTitle(): string
}
```
`App` is just a `Component` with a few extra functions. It can return a title for the page, a list of scripts and a list of style sheets to be injected into the HTML. This is done on the server-side. For example if you have:
```js
class App<Props> extends Component<Props> {
    getStyleSheets(): string[] {
        return ['a.css', 'b.css'];
    }
    getScripts(): string[] {
        return ['a.js', 'b.js'];
    }
    getTitle(): string {
        return 'My Title'
    }
    render(): string {
        return '<h1>content</h1>'
    }
}
```
then then HTML will look something like:
```html
<!doctype html>
<html>
    <head>
        <meta charSet="utf-8" />
        <title>My Title</title>
        <link rel="stylesheet" type="text/css" href="/dist/a.css" />
        <link rel="stylesheet" type="text/css" href="/dist/b.css" />
    </head>
    <body>
        <div id="app-root">
            <h1>content</h1>
        </div>
        <script src="dist/commons.js"></script>
        <script src="dist/a.js"></script>
        <script src="dist/b.js"></script>
    </body>
</html>
```

Currently there are only 2 apps: `admin` and `landingPage`.

##### Event System
Let's look at `src/client-front-end-framework/event-system.js` next. It has 3 main methods:
```js
subscribe(fn: (eventData: any, events: string[]) => void,
          eventOrEvents?: string | string[] = '*'): string
unsubscribe(id: string)
publish(eventOrEvents: string | string[], eventData: any)
```
This is just a sub/pub system. You can [un]subscribe and publish events from components and/or actions. Components can easily talk to each other using this event system. It's best to create an `EventSystem` in the entry file (e.g. `src/client/apps/admin/admin-entry.js`) and pass it down to children.

An example of how to use the event system:

```js
class MyComponent extends Component {
    render() {
        return `<h1 id="myid">${this.props.someValue}</h1>`
    }

    rerender() {
        $('#myid').replaceWith(this.render());
    }

    componentDidMount() {
        this.props.eventSystem.subscribe(() => this.rerender(), 'someEvent');
    }
}
```

Now from anywhere inside your app, if you publish `someEvent` by calling`eventSystem.publish('someEvent')`, the component above will automatically re-render itself.

##### Multilingual (internationalization or i18n)
Using the tools above it's now pretty easy to create a multi-lingual website. Just pass down an object filled with translations down to every child. For example you could have something like this in the entry file:
```js
// entry file:

const translations = {
    fr: {
        myComponent: {
            title: 'title in French',
        }
    },
    en: {
        myComponent: {
            title: 'title in English',
        }
    }
};

function createI18n(lang) {
    return {
        lang, 
        strings: translations[lang],
    };
}

const props = {
    i18n: createI18n('en'),
    eventSystem: new EventSystem(),
};

const myApp = new MyApp(props);
renderAppIntoDOM(props);

props.eventSystem.subscribe(handleLanguageChange, 'languageChanged');

function handleLanguageChange(lang) {
    renderAppIntoDOM({
        ...props,
        i18n: createI18n(lang),
    });
}

function renderAppIntoDOM(props) {
    //...
}

```

later in some `Component` down the hierarchy:
```js
class MyComponent extends Component {
    render() {
        const title = this.props.i18n.strings.myComponent.title;
        return `<h1>${title}</h1>`
    }
}
```

Now if you publish 'languageChnaged' to the event system, the entire app will automatically re-render without having to refresh the page or anything else. 

Just like that we have a dynamic, multi-lingual website. No need to maintain a separate websites or redirecting users to different pages for each language.

Remembering user's choice requires a little help from the server.

##### HTML Sanitization
TODO

Will use [tagged template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) to implement this.

##### SASS/LESS
TODO

Webpack can take care of this, just need to add the config and test it.

## TODO
Customize icons using Fontello to include only the used icons.

Customize flag icons using www.flag-sprites.com
