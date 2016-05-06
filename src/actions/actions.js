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
        signup: {isOpen: true},
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


export function openVerifyRegistration(username) {
    return {
        type: 'VERIFY_REGISTRATION',
        state: {
            isOpen: true,
            username
        },
    };
}
export function closeVerifyRegistration() {
    return {
        type: 'VERIFY_REGISTRATION',
        state: {isOpen: false},
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
            errorMessage: '',
            successMessage: message,
        }
    }
}

export function openSignin() {
    return {
        type: 'SIGNIN',
        state: {isOpen: true},
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

        if (PLATFORM === 'browser') {
            Cookies.set('language', lang,
                        {expires: 1000, path: '/'});
            console.log('cookies: ', document.cookie);
        }
        return Promise.resolve();
    }
}
export function signup(data) {
    return dispatch => {
        return (
            aws.signup(data)
               .then(res => {
                   console.log('signupThunk SUCCESS. res: ', res);
                   dispatch(signupSucceeded(''));
                   if (!data.userConfirmed) {
                       dispatch(closeSignup());
                       dispatch(openVerifyRegistration(res.user.username));
                   }
               })
               .catch(err => {
                   console.log('signupThunk FAIL. err: ', err.message);
                   dispatch(signupFailed(err.message));
               })
        );
    };
}

export function verifyRegistration(code) {
    return (dispatch, getState) => {
        return (
            aws.verifyRegistration(getState().verifyRegistration.username, code)
               .then(res => {
                   console.log('verifyRegistration SUCCESS. res: ', res);
               })
               .catch(err => {
                   console.log('verifyRegistration FAILED. err: ', err);
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
               })
               .catch(err => {
                   console.log('signinThunk FAIL. err: ', err.message);
               })
        );
    };
}
