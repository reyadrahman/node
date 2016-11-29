import request from 'request-promise';
import MessageValidator from 'sns-validator';

const validator = new MessageValidator();

const reportDebug = require('debug')('deepiks:email');
const reportError = require('debug')('deepiks:email:error');

export async function webhook(req: Request, res: Response) {
    reportDebug('Mail webhook triggered', req.headers, req.body);

    let body = JSON.parse(req.body);

    return new Promise((resolve, reject) => {
        if (process.env.DISABLE_SNS_VALIDATION) {
            return resolve(true);
        }

        try {
            validator.validate(body, err => {
                if (err) { return reject(err);}
                resolve(true);
            });
        } catch (e) {
            reject(e);
        }
    })
    .then(() => {
        if (body['Type'] === 'SubscriptionConfirmation') {
            reportDebug(`Confirming subscription: ${body['SigningCertURL']}`);

            return request({uri: body['SubscribeURL']})
            .then(response => {
                reportDebug(response)
            })
            .catch(error => {
                reportError(error);
            })
        }
    });
}
