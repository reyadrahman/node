/* @flow */

import updateFeedsPeriodicTask from './feeds-periodic-task.js';
import updateScheduledTasks from './scheduled-tasks.js';
import { CONSTANTS } from '../server-utils.js';
import type { Request, Response } from 'express';
const reportDebug = require('debug')('deepiks:all-periodic-tasks');
const reportError = require('debug')('deepiks:all-periodic-tasks:error');

export default function periodicTasksUpdate(req: Request, res: Response) {
    const reqSecret = req.header('call-server-lambda-secret');
    // reportDebug(`periodicTasksUpdate: req.headers: `, req.headers);
    reportDebug(`periodicTasksUpdate: reqSecret: ${reqSecret || '<NOTHING>'}`);
    if (reqSecret !== CONSTANTS.CALL_SERVER_LAMBDA_SECRET) {
        reportDebug(`periodicTasksUpdate: secret header does not match. ` +
            `Expected ${CONSTANTS.CALL_SERVER_LAMBDA_SECRET} but instead got ` +
            `${reqSecret || '<NOTHING>'}`);
        return res.status(404).send();
    }
    res.send();

    const now = new Date();

    // once per hour
    if (now.getMinutes() === 1) {
        updateFeedsPeriodicTask()
            .catch(error => {
                reportError('ERROR updateFeedsPeriodicTask: ', error);
            });
    }

    updateScheduledTasks()
        .catch(error => {
            reportError('ERROR updateScheduledTasks: ', error);
        });
}
