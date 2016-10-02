/* @flow */

import initAppState from './init-app-state.js';

export function lang(state = initAppState.lang, action) {
    if (action.type === 'lang/set') {
        return action.lang;
    }
    return state;
}

export function signIn(state = initAppState.signIn, action) {
    if (action.type === 'signIn/reset') {
        return initAppState.signIn;
    } else if (action.type === 'signIn/failed') {
        return {
            errorMessage: action.errorMessage,
        };
    }
    return state;
}

export function signUp(state = initAppState.signUp, action) {
    if (action.type === 'signUp/reset') {
        return initAppState.signUp;
    } else if (action.type === 'signUp/failed') {
        return {
            errorMessage: action.errorMessage,
        };
    }
    return state;
}

export function verifyRegistration(state = initAppState.verifyRegistration, action) {
    const init = initAppState.verifyRegistration;
    if (action.type === 'verifyRegistration/reset') {
        return init;
    } else if (action.type === 'verifyRegistration/set') {
        return {
            ...init,
            initEmail: action.initEmail,
            password: action.password,
        }
    } else if (action.type === 'verifyRegistration/failed') {
        return {
            ...init,
            errorMessage: action.errorMessage,
        };
    }
    return state;
}

export function currentUser(state = initAppState.currentUser, action) {
    const init = initAppState.currentUser;
    if (action.type === 'currentUser/signIn') {
        return {
            ...init,
            signedIn: true,
            attributes: action.attributes,
        };
    } else if (action.type === 'currentUser/signOut') {
        return init;
    }

    // the rest of these actions require an active user
    if (!state.signedIn) return state;

    if (action.type === 'currentUser/setUsersState') {
        return {
            ...state,
            usersState: {
                hasFetched:    true,
                users: action.users,
                errorMessage:  '',
            }
        };
    }

    if (action.type === 'currentUser/resetUsersState') {
        return {
            ...state,
            usersState: init.usersState,
        };
    }

    if (action.type === 'currentUser/fetchUsersFailed') {
        return {
            ...state,
            usersState: {
                hasFetched:   false,
                users:         [],
                errorMessage: action.errorMessage,
            },
        }
    }


    if (action.type === 'currentUser/resetBotsState') {
        return {
            ...state,
            botsState: init.botsState,
        };
    } else if (action.type === 'currentUser/fetchBotsFailed') {
        return {
            ...state,
            botsState: {
                hasFetched: false,
                bots: [],
                errorMessage: action.errorMessage,
            },
        }
    } else if (action.type === 'currentUser/setBotsAndUpdateSelectedBotId') {
        let { selectedBotId } = state;
        if (!selectedBotId || !action.bots.find(x => x.botId === selectedBotId)) {
            selectedBotId = action.bots[0] && action.bots[0].botId || '';
        }
        return {
            ...state,
            botsState: {
                hasFetched: true,
                bots: action.bots,
                errorMessage: '',
            },
            selectedBotId,
        };
    } else if (action.type === 'currentUser/selectBot') {
        return {
            ...state,
            selectedBotId: action.botId,
        };
    } else if (action.type === 'currentUser/resetConversationsState') {
        return {
            ...state,
            conversationsState: init.conversationsState,
        };
    } else if (action.type === 'currentUser/fetchConversationsFailed') {
        return {
            ...state,
            conversationsState: {
                hasFetched: false,
                conversations: [],
                errorMessage: action.errorMessage,
            }
        };
    } else if (action.type === 'currentUser/setConversationsState') {
        return {
            ...state,
            conversationsState: {
                hasFetched: true,
                conversations: action.conversations,
                errorMessage: '',
            }
        };
    } else if (action.type === 'currentUser/resetMessagesState') {
        return {
            ...state,
            messagesState: init.messagesState,
        };
    } else if (action.type === 'currentUser/fetchMessagesFailed') {
        return {
            ...state,
            conversationsState: {
                hasFetched: false,
                messages: [],
                errorMessage: action.errorMessage,
            }
        };
    } else if (action.type === 'currentUser/setMessagesState') {
        return {
            ...state,
            messagesState: {
                hasFetched: true,
                messages: action.messages,
                errorMessage: '',
            }
        };
    } else if (action.type === 'currentUser/updateAttrsAndPassSucceeded') {
        return {
            ...state,
            updateAttrsAndPassState: {
                successMessage: action.successMessage,
                errorMessage: '',
            },
        };
    } else if (action.type === 'currentUser/updateAttrsAndPassFailed') {
        return {
            ...state,
            updateAttrsAndPassState: {
                successMessage: '',
                errorMessage: action.errorMessage,
            },
        };
    }
    return state;
}

export function ui(state = initAppState.ui, action) {
    if (action.type === 'ui/toggleSideMenu') {
        return {
            ...state,
            sideMenu: !state.sideMenu,
        };
    } else if (action.type === 'ui/setModal') {
        return {
            ...state,
            modalComponent: action.modalComponent,
        };
    } else if (action.type === 'ui/closeModal') {
        return {
            ...state,
            modalComponent: null,
        };
    }
    return state;
}

export function contacts(state = initAppState.contacts, action) {
    if (action.type === 'contacts/reset') {
        return initAppState;
    } else if (action.type === 'contacts/succeeded') {
        return {
            errorMessage: '',
            successMessage: action.successMessage,
        };
    } else if (action.type === 'contacts/failed') {
        return {
            errorMessage: action.errorMessage,
            successMessage: '',
        };
    }
    return state;
}
