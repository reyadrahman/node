/* @flow */

import { callbackToPromise, allEntityValues } from '../lib/util.js';
import type { ActionRequest, ActionResponse } from '../lib/types.js';
import grpc from 'grpc';

const hello_proto = grpc.load('assets/hello.proto').helloworld;

export default async function applyEffect(req: ActionRequest): ActionResponse {
    const { sessionId, context, text, entities } = req;
    console.log('actions.applyEffect...');
    // console.log(`Session ${sessionId} received ${text}`);
    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);

    if (!context.imageAttachment) {
        console.error('ERROR: no imageAttachment')
        return { context };
    }

    let newImage: ?string;
    try {
        newImage = await _applyEffectHelper(context.imageAttachment);
    } catch(err) {
        return {
            msg: 'Sorry, I was unable to apply the effect',
            context,
        };
    }
    return {
        msg: { files: [newImage] },
        context: {},
    }
}

export async function _applyEffectHelper(url: string): Promise<string> {
    const client = new hello_proto.Greeter('chainer.deepiks.io:9000',
    grpc.credentials.createInsecure());

    const fn = callbackToPromise(client.sayHello, client);
    const res = await fn({
        model : 'models/composition.model',
        input : url
    });
    return res.message;
}
