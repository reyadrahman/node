/* @flow */

import { callbackToPromise } from '../misc/utils.js';
import type { ServerConstants } from '../misc/types.js';
import request_ from 'request';

export const request = callbackToPromise(request_);

function prefixDBTable(x) {
    return process.env.DB_TABLES_PREFIX
        ? `${process.env.DB_TABLES_PREFIX}_${x}`
        : x;
}

export const CONSTANTS: ServerConstants = ({
    ...process.env,
    AI_ACTION_CACHE_VALID_TIME_S: 10,
    TYPING_INDICATOR_DELAY_S: 2,
    DB_TABLE_BOTS: prefixDBTable('bots'),
    DB_TABLE_CONVERSATIONS: prefixDBTable('conversations'),
    DB_TABLE_MESSAGES: prefixDBTable('messages'),
    DB_TABLE_AI_ACTIONS: prefixDBTable('actions'),
    DB_TABLE_USERS: prefixDBTable('users'),
    DB_TABLE_SCHEDULED_TASKS: prefixDBTable('schedules'),
    DB_TABLE_POLL_QUESTIONS: prefixDBTable('polls'),
    DB_TABLE_INVITATION_TOKENS: prefixDBTable('invitations'),
}: any);

