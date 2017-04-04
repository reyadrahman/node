# Contributing to Deepiks

:+1: First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to the Deepiks Chatbot Open Source Platform, which is hosted  on [GitHub](https://github.com/deepiksdev/node).
These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

#### Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
  * [Code of Conduct](#code-of-conduct)
  * [Installation of the platform](#installation_of_the_platform)

[How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs)
  * [Suggesting Enhancements](#suggesting-enhancements)
  * [Your First Code Contribution](#your-first-code-contribution)
  * [Pull Requests](#pull-requests)

[Styleguides](#styleguides)
  * [Reading the Code](reading_the_code)
  * [Coding Style](coding_style)
  * [Git Commit Messages](#git-commit-messages)

[Additional Notes](#additional_notes)
 * [Tests](#tests)




## What should I know before I get started?

### Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.
Please report unacceptable behavior to [legal@deepiks.io](mailto:legal@deepiks.io).

### Installation of the platform
In order to run the platform locally, you can either [configure your own AWS environment](INSTALLATION.md), or [request an access](mailto:contact@deepiks.io) to the Deepiks AWS environment.

1- Clone this repository

We are using [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js) as a git submodule. So after running `git clone` for this repository, you need to also populate the submodule using the following command:
```
git submodule update --init
```
You also need to run the above command after `git pull` if the submodule has been modified.


2- Run `npm install`.


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

3- Add a `.env`file in the root directory, as described the AWS [installation instructions](INSTALLATION.md).

4- Open 3 terminals and run the following commands in each:

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


## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for Deepiks. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.


#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). Create an issue on this repository , explain the problem and include additional details to help maintainers reproduce the problem:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible. When listing steps, **don't just say what you did, but explain how you did it**.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples. If you're providing snippets in the issue, use [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem. If you use the keyboard while following the steps, **record the GIF with the [Keybinding Resolver](https://github.com/Deepiks/keybinding-resolver) shown**. You can use [this tool](http://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
* **If you're reporting that Deepiks crashed**, include a crash report with a stack trace from the operating system. On macOS, the crash report will be available in `Console.app` under "Diagnostic and usage information" > "User diagnostic reports". Include the crash report in the issue in a [code block](https://help.github.com/articles/markdown-basics/#multiple-lines), a [file attachment](https://help.github.com/articles/file-attachments-on-issues-and-pull-requests/), or put it in a [gist](https://gist.github.com/) and provide link to that gist.
* **If the problem is related to performance**, include a [CPU profile capture and a screenshot](http://flight-manual.Deepiks.io/hacking-Deepiks/sections/debugging/#diagnose-performance-problems-with-the-dev-tools-cpu-profiler) with your report.
* **If the Chrome's developer tools pane is shown without you triggering it**, that normally means that an exception was thrown. The Console tab will include an entry for the exception. Expand the exception so that the stack trace is visible, and provide the full exception and stack trace in a [code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines) and as a screenshot.
* **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened and share more information using the guidelines below.

Provide more context by answering these questions:

* **Did the problem start happening recently**  or was this always a problem?
* **Can you reliably reproduce the issue?** If not, provide details about how often the problem happens and under which conditions it normally happens.

Include details about your configuration and environment:

* **What's the name and version of the OS you're using**?
* **Are you running Deepiks in a virtual machine?** If so, which VM software are you using and which operating systems and versions are used for the host and the guest?

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Deepiks, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion and find related suggestions.



#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://guides.github.com/features/issues/). Create an issue on this repository and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include copy/pasteable snippets which you use in those examples, as [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part of Deepiks which the suggestion is related to. You can use [this tool](http://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
* **Explain why this enhancement would be useful** to most Deepiks users and isn't something that can or should be implemented as a [community package](#Deepiks-and-packages).
* **List some other text editors or applications where this enhancement exists.**
* **Specify which version of Deepiks you're using.** You can get the exact version by running `Deepiks -v` in your terminal, or by starting Deepiks and running the `Application: About` command from the [Command Palette](https://github.com/Deepiks/command-palette).
* **Specify the name and version of the OS you're using.**

### Your First Code Contribution

Unsure where to begin contributing to Deepiks? You can start by looking at issues labeled as  `beginner` and `help-wanted` issues:

* Beginner issues - issues which should only require a few lines of code, and a test or two.
* Help wanted issues - issues which should be a bit more involved than `beginner` issues.


### Pull Requests

* Include screenshots and animated GIFs in your pull request whenever possible.
* Document new code
* End files with a newline.
* Using a plain `return` when returning explicitly at the end of a function.
    * Not `return null`, `return undefined`, `null`, or `undefined`

## Styleguides

### Reading the Code
The javascript code uses [Facebook Flow](https://github.com/facebook/flow/). The file `src/misc/types.js` includes most types used in the code. This is an indispensable resource for understanding the code and the data structures.

Please use an editor/IDE with Flow support while developing as it really helps catch errors before run-time and ensures that the type definitions will stay up-to-date.

As of writing this, Webstorm's EAP builds are very stable and have great support for Flow.

Moreover, studying the unit tests is also a great way to understand the source code.

### Coding Style
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


### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally
* Consider starting the commit message with an applicable emoji:
    * :art: `:art:` when improving the format/structure of the code
    * :racehorse: `:racehorse:` when improving performance
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks
    * :memo: `:memo:` when writing docs
    * :bug: `:bug:` when fixing a bug
    * :fire: `:fire:` when removing code or files
    * :green_heart: `:green_heart:` when fixing the CI build
    * :white_check_mark: `:white_check_mark:` when adding tests
    * :lock: `:lock:` when dealing with security
    * :arrow_up: `:arrow_up:` when upgrading dependencies
    * :arrow_down: `:arrow_down:` when downgrading dependencies



## Tests and debugging
### Running tests
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


### Internationalization (i18n)
Translations for client-side code are stored in `src/i18n/` whereas the translations for the server-side code, such as messages coming from the bot are stored in `src/server/i18n/`.


### Constants and Environment Variables
Regardless of what method you use to define your env variables, `webpack-config-server.js` checks to make sure mandatory variables are provided and the default values for optional variables are set. Then these env variables will be bound to the `__ENV_VARS__` global variable which is hard-coded in the server code using webpack's [DefinePlugin](https://webpack.github.io/docs/list-of-plugins.html#defineplugin).

The first file that runs in the server is `src/server/preamble.js` which reads `__ENV_VARS__` and updates `process.env`, but does not override variables that already existed in `process.env`.

Some of these env variables are meant to be used as they are, some need to be changed and some new constants need to be added. `src/server/server-utils.js` defines all constants as `CONSTANTS` using `process.env` as its base.

Not every constant should be sent to the client. Some may be secrets and some just not useful. In `src/server/server-side-rendering.js`, the server injects the relevant constants into the client. The client will then use `CONSTANTS` defined in `src/client/client-utils.js` to access them.

### Static Files
The server serves the static files from `dist-client`. This directory is created by Webpack after a build. There are 3 ways for a file to end up in `dist-client`:

1. Webpack's output: these are the Javascript and CSS files that Webpack produces
2. Files that are `required` **from the client code**. For example if in the client code you have `const logoURL = require('./resources/logo.png')`, then the file `./resources/logo.png` (relative to the source file) will be copied to `dist-client` under a **unique name**. You can then use the `logoURL` to refer to the file. The `logoURL` could be a relative path or prefixed with CDN's domain depending on the the configurations you set via the environment variables.
3. The contents of `resources/copy-to-dist/` will be copy **as-is** to the `dist-client`.


Please note that all `url`s inside CSS/SCSS/LESS files will be treated as if they were `require`d (second method above).

In the client code you can use the second method above (`require(...)`) to get the URL of a static file. However, in the server-only code (e.g. `src/components/html/Html.jsx`), you cannot do that. Instead use the 3rd method above. That is, put the file in `resources/copy-to-dist/` and then you can refer to it as in the following example from `Html.jsx` (assuming `resources/copy-to-dist/favicon.png` exists):

```js
import { CONSTANTS } from '../../client/client-utils.js';
const faviconURL = `${CONSTANTS.PUBLIC_URL}favicon.png`;
```

Now depending on your configurations, faviconURL could be a relative path to `dist-client` or the URL to the corresponding file in CDN. The constant `PUBLIC_URL` will be explained in the next section.

**Please use CDN in production to serve static files.** See "Deploy" section for more details.

### CDN, PUBLIC_URL and How They Are Configured
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


### Creating a New Channel
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

### Front-End - Immutable Props
**The entire application state and all `props` of every component are immutable. Please ensure that you do not ever modify them directly. Always use actions to update the application state and let Redux+React propagate the props down to each component.**

Please see [Redux](http://redux.js.org/) for more details.

### Promises and Async
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

### Compose/Decompose keys for DynamoDB
As you can see in `src/misc/types.js`, some properties are composed of multiple keys, for example `publisherId_botId`. Please always use the functions `composeKeys` and `decomposeKeys` located at `src/misc/utils.js` to create or parse these keys. The reason is that the separator is subject to change and later we may need to use nested composition.

### `dynamoCleanUpObj`

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

### Use `debug.js` instead of `console.log`, `console.error` etc.
Please pick a meaningful name when creating the report functions. The name of the file is a good choice.

```js
const reportDebug = require('debug')('deepiks:this-file-name');
const reportError = require('debug')('deepiks:this-file-name:error');

reportDebug('here is a message');
reportError('here is an error');
```
