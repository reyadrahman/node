/* @flow */

import { allEntityValues } from '../lib/util.js';
import type { ActionRequest, ActionResponse } from '../lib/types.js';

export default async function getForecast(req: ActionRequest): ActionResponse {
    const { sessionId, context, text, entities } = req;
    console.log('actions.getForecast...');
    console.log(`Session ${sessionId} received ${text}`);
    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);
    const entityValues = allEntityValues(entities, 'location');
    if (entityValues.length === 0) {
        return { context: { missingLocation: true } };
    } else {
        return { context: { forecast: 'rainy as always' } };
    }
};
