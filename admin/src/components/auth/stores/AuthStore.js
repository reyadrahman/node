import Reflux from 'reflux'
import amazon from 'amazon';
import AuthActions from '../actions/AuthActions';

let AuthStore = Reflux.createStore({
    listenables: AuthActions,

    init: function() {
        // State
        this.token = localStorage.getItem('token') || null;
        this.user = null;
        this.error = null;
    },

    onSignup: function(credentials) {
        console.log('onSignup: ', credentials);

        AWS.config.region = 'eu-west-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-1:53c6d014-5e9c-4795-9fdc-9c80ef75471c'
        });
        let lambda = new AWS.Lambda();

        lambda.invoke({
            FunctionName: 'LambdAuthCreateUser',
            Payload: JSON.stringify(credentials)
        }, function(err, data) {
            if (err) {
                console.log('ERROR: ', err, err.stack);
                window.location.href = '#/signup';
            }
            else {
                var output = JSON.parse(data.Payload);
                console.log(output.created ? 'created user' : 'could not create user', output);
                if (output.created) {
                    window.location.href = '#/login';
                } else {
                    window.location.href = '#/signup';
                }
            }
        });
    },

    /**
     * Login handler
     * @param credentials
     */
    onLogin: function(credentials) {
        AWS.config.region = 'eu-west-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-1:53c6d014-5e9c-4795-9fdc-9c80ef75471c'
        });
        let lambda = new AWS.Lambda();

        var self = this;

        lambda.invoke({
            FunctionName: 'LambdAuthLogin',
            Payload: JSON.stringify(credentials)
        }, function(err, data) {
            if (err) {
                self.loginError(err);
            } else {
                var output = JSON.parse(data.Payload);

                if (output.login) {
                    var creds = AWS.config.credentials;
                    creds.params.IdentityId = output.identityId;
                    creds.params.Logins = {
                        'cognito-identity.amazonaws.com': output.token
                    };
                    creds.expired = true;
                    self.saveToken(creds.token);
                    self.loginSuccess(output);
                }
            }
        });
    },

    /**
     * Process login success
     * @param user
     */
    loginSuccess: function(user) {
        localStorage.setItem('user', JSON.stringify(user));

        this.user = user;
        window.location.href= "#/";
    },

    /**
     * Handle login error
     * @param err
     */
    loginError: function(err) {
        this.token = null;
        this.error = err;
        this.user = null;
    },

    /**
     * Logout user
     */
    logout: function() {
        localStorage.clear();
        this.token = null;
        this.error = null;
        window.location.href= "#/login";
    },

    /**
     * Check if token exists
     */
    checkToken: function() {
        return this.token !== null;
    },

    /**
     * Save token in local storage and automatically add token within request
     * @param token
     */
    saveToken: function(token) {
        localStorage.setItem('token', token);
        this.token = token;
        this.error = null;
    }
});

export default AuthStore
