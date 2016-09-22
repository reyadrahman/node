
export function test(state = false, action) {
    switch (action.type) {
        case 'TEST':
            return action.test;
        default:
            return state;
    }
}
export function lang(state = '', action) {
    switch (action.type) {
        case 'CHANGE_LANG':
            return action.lang;
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
// export function locationRedux(state = {pathname: '/'}, action) {
//     switch (action.type) {
//         case 'LOCATION':
//             return Object.assign({}, state, action.location);
//         default:
//             return state;
//     }
// }
export function signUp(state =
    {
        errorMessage: '',
        successMessage: '',
    }, action)
{
    switch (action.type) {
        case 'SIGNUP':
            return Object.assign({}, state, action.state);
        default:
            return state;
    }
}
export function verifyRegistration(state =
    {
        initialEmail: '',
        password: '',
        errorMessage: '',
        successMessage: '',
    }, action)
{
    switch (action.type) {
        case 'VERIFY_REGISTRATION':
            return Object.assign({}, state, action.state);
        default:
            return state;
    }
}

export function signIn(state =
    {
        errorMessage: '',
        successMessage: '',
    }, action)
{
    switch (action.type) {
        case 'SIGNIN':
            return Object.assign({}, state, action.state);
        default:
            return state;
    }
}

export function currentUser(state = null, action) {
    if (action.type === 'CURRENT_USER') {
        return !action.state ? null : { ...state, ...action.state };
    } else if (action.type === 'CURRENT_USER/BOTS_STATE') {
        if (!state) return null;
        return !action.state
            ? { ...state, botsState: null }
            : { ...state, botsState: { ...state.botsState, ...action.state } };

    } else if (action.type === 'CURRENT_USER/CONVERSATIONS_STATE') {
        if (!state) return null;
        return !action.state
            ? { ...state, conversationsState: null }
            : {
                ...state,
                conversationsState: {
                    ...(state && state.conversationsState),
                    ...action.state
                },
            };
    } else if (action.type === 'CURRENT_USER/MESSAGES_CACHE_STATE') {
        if (!state) return null;
        return !action.state
            ? { ...state, messagesCacheState: null }
            : {
                ...state,
                messagesCacheState: {
                    ...(state && state.messagesCacheState),
                    ...action.state
                },
            };
    }
    return state;
}

export function search(state =
    {
        query: {
            searchPhrase: '',
            filterPhotographer: '',
        },
        results: null,
        isSearching: false,
    }, action)
{
    if (action.type === 'SEARCH') {
        return Object.assign({}, state, action.state);
    }
    return state;
}

export function ui(state =
    {
        fullscreen: false,
        sideMenu: false,
        modalComponent: null,
    }, action)
{
    if (action.type === 'UI') {
        return Object.assign({}, state, action.state);
    } else if (action.type === 'UI/TOGGLE_SIDE_MENU') {
        return Object.assign({}, state, { sideMenu: !state.sideMenu });
    }
    return state;
}

export function contacts(state =
    {
        errorMessage: '',
        successMessage: '',
    }, action)
{
    if (action.type === 'CONTACTS') {
        return Object.assign({}, state, action.state);
    }
    return state;
}

export function webChat(state =
    {
        sessionToken: '',
    }, action)
{
    if (action.type === 'WEB_CHAT') {
        return { ...state, ...action.state };
    }
    return state;
}
