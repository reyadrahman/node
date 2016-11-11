/* @flow */

import type { AIActionRequest } from '../../../../misc/types.js';
import _ from 'lodash';
const reportDebug = require('debug')('deepiks:store-preferences');
const reportError = require('debug')('deepiks:store-preferences:error');

export default async function storePreferences(actionRequest: AIActionRequest) {
    reportDebug('actionRequest: ', actionRequest);
    const entities = actionRequest.entities;
    if (_.isEmpty(entities)) {
        return {
            context: actionRequest.context,
        };
    }

    const prefEntities = _.pickBy(entities,
        (v, k) => k.toLowerCase().startsWith('pref_') && Array.isArray(v) && v.length > 0
    );
    const extractedUserPrefs = _.mapValues(prefEntities,
        (v, k) => typeof v[0].value === 'object' ? v[0].value.value : v[0].value
    );
    const userPrefs = Object.assign({}, actionRequest.userPrefs, extractedUserPrefs);

    return {
        context: actionRequest.context,
        userPrefs: userPrefs,
    };
}

