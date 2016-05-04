import * as aws from '../aws/aws.js';

export function changeLang(lang) {
    return {
        type: 'CHANGE_LANG',
        lang,
    };
}

export function test(v) {
    return {
        type: 'TEST',
        test: v,
    };
}
export function changeIsLangInUrl(isLangInUrl) {
    return {
        type: 'IS_LANG_IN_URL',
        isLangInUrl,
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


export function signup(data) {
    return dispatch => {
        aws.signup(data)
           .then(res => {
               console.log('signupThunk SUCCESS. res: ', res);
               dispatch(signupSucceeded('Thanks for signing up'));
           })
           .catch(err => {
               console.log('signupThunk FAIL. err: ', err.message);
               dispatch(signupFailed(err.message));
           });
    };
}
