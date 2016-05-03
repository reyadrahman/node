
export function test(state = false, action) {
    switch (action.type) {
        case 'TEST':
            return action.test;
        default:
            return state;
    }
}
export function lang(state = 'en', action) {
    switch (action.type) {
        case 'CHANGE_LANG':
            return action.lang;
        default:
            return state;
    }
}
export function isLangInUrl(state = false, action) {
    switch (action.type) {
        case 'IS_LANG_IN_URL':
            return action.isLangInUrl;
        default:
            return state;
    }
}
export function systemLang(state = '', action) {
    switch (action.type) {
        case 'CHANGE_SYSTEM_LANG':
            return action.lang;
        default:
            return state;
    }
}
export function locationRedux(state = {pathname: '/'}, action) {
    switch (action.type) {
        case 'LOCATION':
            return Object.assign({}, state, action.location);
        default:
            return state;
    }
}

/*
export default function app(state = initialStore, action) {
    switch (action.type) {
        case 'TEST':
            return {
                test: true,
            }
        default:
            console.log('reducer: action: ', action);
            return state;
    }
}
*/
