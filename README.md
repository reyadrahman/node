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
If you want to deploy to Elastic Beanstalk, run:
```
eb deploy
```
