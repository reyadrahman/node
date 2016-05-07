import * as aws from '../aws/aws.js';
import Cookies from 'js-cookie';

export function test(v) {
    return {
        type: 'TEST',
        test: v,
    };
}
export function changeLocation(location) {
    return {
        type: 'LOCATION',
        location,
    };
}
export function openSignup() {
    return {
        type: 'SIGNUP',
        signup: {
            isOpen: true,
            errorMessage: '',
            successMessage: '',
        },
    };
}
export function closeSignup() {
    return {
        type: 'SIGNUP',
        signup: {isOpen: false},
    };
}
export function signupSucceeded(message) {
    return {
        type: 'SIGNUP',
        signup: {
            errorMessage: '',
            successMessage: message,
        }
    }
}
export function signupFailed(message) {
    return {
        type: 'SIGNUP',
        signup: {
            errorMessage: message,
            successMessage: '',
        }
    }
}


export function openVerifyRegistration(data = {}) {
    return {
        type: 'VERIFY_REGISTRATION',
        state: {
            isOpen: true,
            initialEmail: data.email || '',
            password: data.password || '',
            errorMessage: '',
            successMessage: '',
        },
    };
}
export function closeVerifyRegistration() {
    return {
        type: 'VERIFY_REGISTRATION',
        state: {isOpen: false, password: ''},
    };
}
export function verifyRegistrationSucceeded(message) {
    return {
        type: 'VERIFY_REGISTRATION',
        state: {
            errorMessage: '',
            successMessage: message,
        }
    }
}
export function verifyRegistrationFailed(message) {
    return {
        type: 'VERIFY_REGISTRATION',
        state: {
            errorMessage: message,
            successMessage: '',
        }
    }
}

export function openSignin() {
    return {
        type: 'SIGNIN',
        state: {
            isOpen: true,
            errorMessage: '',
            successMessage: '',
        },
    };
}
export function closeSignin() {
    return {
        type: 'SIGNIN',
        state: {isOpen: false},
    };
}
export function signinSucceeded(message) {
    return {
        type: 'SIGNIN',
        state: {
            errorMessage: '',
            successMessage: message,
        }
    }
}
export function signinFailed(message) {
    return {
        type: 'SIGNIN',
        state: {
            errorMessage: message,
            successMessage: '',
        }
    }
}
export function setCurrentUserAttributes(attributes) {
    return {
        type: 'CURRENT_USER',
        state: attributes,
    }
}
export function clearCurrentUserAttributes() {
    return {
        type: 'CURRENT_USER',
        state: null,
    }
}



// ==================================================
// Thunks
// ==================================================

export function changeLang(lang) {
    return dispatch => {
        dispatch({
            type: 'CHANGE_LANG',
            lang,
        });

        // TODO if logged in, if in browser etc.

        if (process.env.PLATFORM === 'browser') {
            Cookies.set('language', lang,
                        {expires: 1000, path: '/'});
            console.log('cookies: ', document.cookie);
        }
        return Promise.resolve();
    }
}
export function signup(data_) {
    let data = {...data_, sdf: 'asdf'};
    return dispatch => {
        return (
            aws.signup(data)
               .then(res => {
                   console.log('signupThunk SUCCESS. res: ', res);
                   dispatch(signupSucceeded(''));
                   if (!data.userConfirmed) {
                       dispatch(closeSignup());
                       dispatch(openVerifyRegistration(data));
                   }
               })
               .catch(err => {
                   console.log('signupThunk FAIL. err: ', err.message);
                   dispatch(signupFailed(err.message));
               })
        );
    };
}

export function verifyRegistration(data) {
    return (dispatch, getState) => {
        return (
            aws.verifyRegistration(data.email, data.code)
               .then(res => {
                   console.log('verifyRegistration SUCCESS. res: ', res);
                   let password = getState().verifyRegistration.password;
                   if (password) {
                       dispatch(signin({email: data.email, password})).then(() => {
                           dispatch(closeVerifyRegistration());
                       });
                   } else {
                       dispatch(closeVerifyRegistration());
                   }
               })
               .catch(err => {
                   console.log('verifyRegistration FAILED. err: ', err);
                   dispatch(verifyRegistrationFailed(err.message));
               })
        );
    };
}

export function signin(data) {
    return dispatch => {
        return (
            aws.signin(data)
               .then(res => {
                   console.log('signinThunk SUCCESS. res: ', res,
                               ', res.getAccessToken(): ', res.getAccessToken(),
                               ', res.getIdToken(): ', res.getIdToken());
                   return aws.getCurrentUserAttributes();
               })
               .then(attrs => {
                   console.log('user attributes: ', attrs);
                   dispatch(closeSignin());
                   dispatch(setCurrentUserAttributes(attrs));

                   Cookies.set('loggedIn', 'yes',
                               {expires: 1000, path: '/'});
               })
               .catch(err => {
                   console.log('signinThunk FAIL. err: ', err.message);
                   dispatch(signinFailed(err.message));
               })
        );
    };
}

export function signout() {
    return dispatch => {
        return (
            aws.signout()
               .then(() => {
                   dispatch(clearCurrentUserAttributes());
                   // TODO navigate out of private pages


                   Cookies.set('loggedIn', '',
                               {expires: 1000, path: '/'});
               })
        );
    };
}
