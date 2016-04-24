import Reflux from 'reflux'

let AuthActions = Reflux.createActions({
    login: {asyncResult: true},
    signup: {asyncResult: true}
});

export default AuthActions

