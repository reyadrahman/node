import cookie from 'react-cookie';
import 'aws-sdk';
import History from '../../components/layout/navigation/classes/History.js';

const EXPIRE_TIME = 1000 * 60 * 15;

class Auth {
    constructor() {
        if (Auth.instance) return Auth.instance;
        else Auth.instance = this;

        this.token = cookie.load('deepiksdev');
    }

    getToken() {
        if (this.token && Date.now() >= this.expires) this.token = null;
        return this.token;
    }

    authenticate(email, password) {
        return new Promise((resolve, reject) => {
                AWS.config.update({
                "region": "eu-west-1",
                "credentials": new AWS.CognitoIdentityCredentials({IdentityPoolId: 'eu-west-1:53c6d014-5e9c-4795-9fdc-9c80ef75471c'})
            });

        var lambda = new AWS.Lambda();

        var params = {
            FunctionName: 'LambdAuthLogin',
            Payload: JSON.stringify({"email": email, "password": password})
        };

        lambda.invoke(params, (err, data) => {
            if (err) {
                reject(err);
            }

            if (data.Payload) {

            try {
                data.Payload = JSON.parse(data.Payload);
                if (data.Payload.login) {
                    this.expires = Date.now() + EXPIRE_TIME;
                    this.token = data.Payload.token;
                    cookie.save('deepiksdev', this.token, {
                        expires: new Date(this.expires)
                    });
                    resolve(this.token);
                }
                else resolve();
            } catch (err) {
                reject(err);
            }
        }
    else reject();
    });
    });
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    isLoggedInAsync(email, password) {
        return new Promise((resolve, reject) => {
                let token = this.getToken();
        if (token) {
            return resolve(token);
        }

        if (email && password) {
            this.authenticate(email, password)
                .then(data => resolve(data))
        .catch(err => reject(err));
        }
        else resolve();
    });
    }

    login(email, password) {
        return this.isLoggedInAsync(email, password)
                .then(data => {
                if (data) History.push('/');
    else throw new Error('Wrong credentials!');
    });
    }

    logout() {
        this.token = null;
        cookie.remove('deepiksdev');
        History.push('/login');
    }
}

export default (new Auth());
