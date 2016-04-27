import initialStore from '../initialStore.js';

export function test(state = initialStore.test, action) {
    console.log('reducer test: action: ', action);
    switch (action.type) {
        case 'TEST':
            return true;
        default:
            return state;
    }
}
export function lang(state = initialStore.lang, action) {
    switch (action.type) {
        case 'CHANGE_LANG':
            return action.lang;
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
