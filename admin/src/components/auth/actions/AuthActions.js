import Reflux from 'reflux'

let AuthActions = Reflux.createActions({
    login: {asyncResult: true}
});

export default AuthActions

