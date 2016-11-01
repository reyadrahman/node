/* @flow */

const initAppState = {
    lang: '',
    signIn: {
        errorCode: '',
    },
    signUp: {
        errorCode: '',
    },
    verifyRegistration: {
        initialEmail: '',
        password: '',
        errorCode: '',
    },
    currentUser: {
        signedIn: false,
        selectedBotId: '',
        attrs: {},
        botsState: {
            hasFetched: false,
            bots: [],
            errorCode: '',
        },
        usersState: {
            hasFetched: false,
            users: [],
            errorCode: '',
        },
        conversationsState: {
            hasFetched:    false,
            conversations: [],
            errorCode:  '',
            lastUpdated:   0
        },
        messagesState: {
            hasFetched:   false,
            messages:     [],
            errorCode: '',
            lastUpdated:  0
        },
        updateAttrsAndPassState: {
            successCode: '',
            errorCode: '',
        }
    },
    ui: {
        sideMenu: false,
        modalComponent: null,
    },
    contacts: {
        sendingInProgress: false,
        errorCode: '',
        successCode: '',
    },
};

export default initAppState;
