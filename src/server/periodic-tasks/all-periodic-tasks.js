/* @flow */

import updateFeedsPeriodicTask from './feeds-periodic-task.js';
import updateScheduledTasks from './scheduled-tasks.js';
import { ENV } from '../server-utils.js';

const { CALL_SERVER_LAMBDA_SECRET } = ENV;

export default function periodicTasksUpdate(req: Request, res: Response) {
    const reqSecret = req.header('CALL_SERVER_LAMBDA_SECRET');
    console.log(`periodicTasksUpdate: reqSecret: ${reqSecret}`);
    if (reqSecret !== CALL_SERVER_LAMBDA_SECRET) {
        console.log(`periodicTasksUpdate: secret header does not match. ` +
            `Expected ${CALL_SERVER_LAMBDA_SECRET} but instead got ` +
            `${reqSecret || '<NOTHING>'}`);
        return res.status(404).send();
    }
    res.send();

    const now = new Date();

    // once per hour
    if (now.getMinutes() === 1) {
        updateFeedsPeriodicTask()
            .catch(error => {
                console.error('ERROR updateFeedsPeriodicTask: ', error);
            });
    }

    updateScheduledTasks()
        .catch(error => {
            console.error('ERROR updateScheduledTasks: ', error);
        });
}
