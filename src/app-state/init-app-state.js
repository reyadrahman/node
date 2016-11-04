/* @flow */

const initAppState = {
    lang: '',
    signIn: {
        errorCode: '',
        signingIn: false,
    },
    signUp: {
        errorCode: '',
    },
    verifyRegistration: {
        initialEmail: '',
        password: '',
        errorCode: '',
        verifying: false,
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
        },
        addBotState: {
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
