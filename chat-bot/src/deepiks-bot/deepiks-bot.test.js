import { assert } from 'chai';
import deepiksBot from './deepiks-bot.js';
import _ from 'lodash';
import http from 'http';
import { PassThrough } from 'stream';
import sinon from 'sinon';
const gm = require('gm').subClass({imageMagick: true});
import fs from 'fs';


const exampleMessage1 = {
    id: 'Y2lzY29zcGFyazovL3VzL01FU1NBR0UvZmNhMzQ4YzAtMzZlYy0xMWU2LWIzZmYtYmJlNzRhYjdiNjdk',
    roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vN2Y0MTdiZTAtMzUwNy0xMWU2LWEyOWYtNmY3NGNkNjMwM2Jm',
    text: 'Here\'s an example photo which should be automatically uploaded to S3 and recorded in DynamoDB',
    files: [
        'https://api.ciscospark.com/v1/contents/Y2lzY29zcGFyazovL3VzL0NPTlRFTlQvZmNhMzQ4YzAtMzZlYy0xMWU2LWIzZmYtYmJlNzRhYjdiNjdkLzA'
    ],
    personId: 'Y2lzY29zcGFyazovL3VzL1BFT1BMRS9kZGEyNDFhNC02YjAzLTQzY2YtYWUwMS01Y2Q2ZjEzNDNkYzc',
    personEmail: 'shahab.sh.70@gmail.com',
    created: '2016-06-20T13:43:36.012Z',
    sourceBot: 'ciscobot',
    filesDownloadAuth: 'Bearer NDlkMWE4MzMtOTJjYy00NDEzLWFjMWItODFiNWM1ZTViMzZhNjk2MzQ0OGEtODVi'
};

const exampleMessage2 = _.omit(exampleMessage1, 'files');

function rewireToNull(obj, bindings) {
    bindings.forEach(x => {
        obj.__Rewire__(x);
    });
}


describe('Deepiks Bot', function() {
    Object.assign(process.env, {
        AWS_REGION: 'us-east-1',
        DB_TABLE_NAME: 'deepiksbot',
        S3_BUCKET_NAME: 'deepiksbot',
        GOOGLE_CLOUD_VISION_API_KEY: 'AIzaSyDMwWSd6AEe73JogpLilkCp2PoY3xd8nfI',
        MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY: '29b97b4ae9824e5897000afa292306e5',
    });

    describe('main', function() {
        it('passes example message', function(done) {
            this.timeout(20000);
            deepiksBot(exampleMessage1)
                .then(res => {
                    console.log(res);
                    done();
                })
                .catch(err => {
                    console.error(err);
                });
        });
    });

    describe('gm', () => {
        // it('resizes', done => {
        //     const image = fs.readFileSync('/Users/sean/Desktop/bear.jpg');
        //     gm(image).resize(1000, 1000, '>').toBuffer('jpg', (err, buf) => {
        //         if (err) {
        //             console.error(err);
        //         } else {
        //             done();
        //         }
        //         fs.writeFileSync('booo.jpg', buf);
        //     })
        // });
    })

    describe('...', () => {
        let stubRequest;
        let spyRequest;

        beforeEach(() => {
            // rewireToNull(deepiksBot, ['textMessageRoute', 'fileRoute']);
            // stubRequest = sinon.stub(http, 'request');
            spyRequest = sinon.spy(http, 'request');

        });
        afterEach(() => {
            // deepiksBot.__reset__();
            http.request.restore();
        })
        it('simple text', () => {

            // deepiksBot(exampleMessage2)
            //     .then(res => {
            //         console.log('RES: ', res);
            //     })
            //     .catch(err => {
            //         console.error('a', spyRequest.firstCall.args);
            //     })


            // const ret = {};
            // deepiksBot
            // deepiksBot.__Rewire__('textMessageRoute', message => Promise.resolve(ret));
            // deepiksBot(exampleMessage2).then(res => {
            //     assert.equal(res, ret);
            //     done();
            // })
        });
    });
});
