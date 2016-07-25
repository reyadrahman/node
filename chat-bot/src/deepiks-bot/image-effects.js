/* @flow */

import { callbackToPromise } from '../lib/util.js';
import grpc from 'grpc';

const hello_proto = grpc.load('assets/hello.proto').helloworld;

export default async function applyEffect(url: string) {
    const client = new hello_proto.Greeter('chainer.deepiks.io:9000',
    grpc.credentials.createInsecure());

    const fn = callbackToPromise(client.sayHello, client);
    const res = await fn({
        model : 'models/composition.model',
        input : url
    });
    return res.message;
}
