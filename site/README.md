First install modules
```
npm install
```

then build dist/bundle.js and start the server
```
npm run build-client
npm start
```

Alternatively, for development you could build dist/bundle.js with the following command which will block waiting for changes and then rebuilds
```
npm run build-client-watch
```
if you use the above command you have to start the server in a separate shell using the following command
```
npm start
```

The client code (bundle.js) automatically gets rebuilt. But the server doesn't have React Hot Reloading yet. So just refresh the browser after making a change to the client code and restart the server after making a change to the server code.