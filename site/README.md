First install modules
```
npm install
```

then build dist/bundle.js
```
npm run build-client-watch
```

then start the server in a separate shell,
```
npm start
```

The client code (bundle.js) automatically gets rebuilt. But the server doesn't have React Hot Reloading yet. So just refresh the browser after making a change to the client code and restart the server after making a change to the server code.