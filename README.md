# Deepiks Open Source Chatbot Platform
## About
This repository contains the source code of Deepiks [Open Source](License.md) Chatbot Platform, which provides many advanced features such as:
- write once, run chatbot on (almost) any `channel`
- markdown support
- notifications
- roles
- HITL (human in the loop)
- and many more ...

## Concepts and vocabulary
In this project, we use the following terms
- `publisher` represents the owner of a bot. A `publisher`can have several bots.
- `person`is someone represented by one or several e-mail addresses
- `user`represents someone talking with a bot owned by a `publisher`. It is important to note that we need to segregate the data between `publishers`. So, basically, a `user`of a given bot is always different from a `user`of another bot, even if it is the same `person`.
- `reseller`is an organization which resells Deepiks services. At this time, we do not have any reseller, except Deepiks itself. We will probably have some in the future, and provide them a white label version of this `platform`. Technically speaking, a `publisher`working with a given `reseller`is always different from a `publisher`working with another `reseller`, there should be no link between the 2 accounts.
- `channel`represents the different types of bots implemented, for example Messenger, Skype, Spark ... We previously used the word `platform`that now use for our own service as a whole
- `environment` represents the environment from where the admin site is accessed. Examples of existing or upcoming `environments`are Browser, Wordpress Plugin, iOS App, Android App ...   
- `agent`represents a set of stories, intents, entities used by one or more `bots`. In wit.ai, an `agent`is called an "app".

## Installation
The platform needs to be installed on AWS. See instructions [here](INSTALLATION.md)

## Contributing
If you would like to contribute to this project, please read our [contributing instructions](CONTRIBUTING.md).

## Bot buidling
See instructions [here](bot_building/en/README.md).
