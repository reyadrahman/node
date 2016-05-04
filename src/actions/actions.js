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
                   dispatch(signupSucceeded('Thanks for signing up'));
               })
               .catch(err => {
                   console.log('signupThunk FAIL. err: ', err.message);
                   dispatch(signupFailed(err.message));
               })
        );
    };
}
