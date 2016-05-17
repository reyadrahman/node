# Install and run
Install, build and run in production mode:
```
npm install
npm start
```
If you want to get useful logs for debugging, pass `DEBUG=app:*` to `npm start`:
```
DEBUG=app:* npm start
```
Now server will be running at http://localhost:3000/
The configurations are located in env/production-emmanuel.js

If you want to deploy to Elastic Beanstalk, run:
```
eb deploy
```

# Configurations

Configurations are set using environment variables. The following configurations are available (shown with their default values):

```
NODE_ENV=development
VERBOSE=false
SERVER_PORT=3000
CDN=
DEBUG=app:*
```

For Elastic Beanstalk powered server, you can use .ebextensions to set the environment variables (also known as `environment properties`).

For a local server, you can either use the standard way of setting environment variables in your shell or *optionally*, you can pass a file that includes the environment variables.

For example if you want to have a `production` build running on port `4000` using CDN `http://d2lwos3jzc4ewy.cloudfront.net`:
```
NODE_ENV=production  SERVER_PORT=4000  CDN=http://d2lwos3jzc4ewy.cloudfront.net  npm start
```

another option is to export the environment variables before calling `npm start` (good for shell scripts):
```
export NODE_ENV=production
export SERVER_PORT=4000
export CDN=http://d2lwos3jzc4ewy.cloudfront.net
npm start
```

or you can store the configurations in a JSON file anywhere on your system and pass it to `npm start`:
```
// content of my-config.json:
{
    "NODE_ENV": "production",
    "SERVER_PORT": 4000,
    "CDN": "http://d2lwos3jzc4ewy.cloudfront.net"
}

// now in your console
npm start -- --env path/to/config/my-config.json
```

# Notes
Customize icons using Fontello to include only the used icons.
Customize flag icons using www.flag-sprites.com
