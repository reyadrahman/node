/* @flow */

import initAppState from './init-app-state.js';
import _ from 'lodash';

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
            errorCode: action.errorCode,
        };
    }
    return state;
}

export function signUp(state = initAppState.signUp, action) {
    if (action.type === 'signUp/reset') {
        return initAppState.signUp;
    } else if (action.type === 'signUp/failed') {
        return {
            errorCode: action.errorCode,
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
            errorCode: action.errorCode,
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
                errorCode:  '',
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
                errorCode: action.errorCode,
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
                errorCode: action.errorCode,
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
                errorCode: '',
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
                errorCode: action.errorCode,
            }
        };
    } else if (action.type === 'currentUser/setConversationsState') {
        return {
            ...state,
            conversationsState: {
                hasFetched:    true,
                conversations: action.conversations,
                errorCode:  '',
                lastUpdated:   action.lastUpdated
            }
        };
    } else if (action.type === 'currentUser/updateConversationsState') {

        let conversations = _.cloneDeep(state.conversationsState.conversations);

        conversations = conversations.filter(conversation => {
            return _.findIndex(action.conversations, {
                    publisherId:          conversation.publisherId,
                    botId_conversationId: conversation.botId_conversationId
                }) === -1;
        });

        conversations = action.conversations.concat(conversations);

        return {
            ...state,
            conversationsState: {
                hasFetched:    true,
                conversations: conversations,
                errorCode:  '',
                lastUpdated:   action.lastUpdated
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
                errorCode: action.errorCode,
            }
        };
    } else if (action.type === 'currentUser/setMessagesState') {
        return {
            ...state,
            messagesState: {
                hasFetched:   true,
                messages:     action.messages,
                errorCode: '',
                lastUpdated:  action.lastUpdated
            }
        };
    } else if (action.type === 'currentUser/updateMessagesState') {

        let messages = _.cloneDeep(state.messagesState.messages);

        messages = messages.filter(message => {
            return _.findIndex(action.messages, {id: message.id}) === -1;
        });

        messages = messages.concat(action.messages);

        return {
            ...state,
            messagesState: {
                hasFetched:   true,
                messages:     messages,
                errorCode: '',
                lastUpdated:  action.lastUpdated
            }
        };
    } else if (action.type === 'currentUser/updateAttrsAndPassSucceeded') {
        return {
            ...state,
            updateAttrsAndPassState: {
                successCode: action.successCode,
                errorCode: '',
            },
        };
    } else if (action.type === 'currentUser/updateAttrsAndPassFailed') {
        return {
            ...state,
            updateAttrsAndPassState: {
                successCode: '',
                errorCode: action.errorCode,
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
    } else if (action.type === 'contacts/sending') {
        return {
            ...state,
            sendingInProgress: true,
        }
    } else if (action.type === 'contacts/succeded') {
        return {
            sendingInProgress: false,
            errorCode: '',
            successCode: action.successCode,
        };
    } else if (action.type === 'contacts/failed') {
        return {
            sendingInProgress: false,
            errorCode: action.errorCode,
            successCode: '',
        };
    }
    return state;
}
