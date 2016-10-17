/* @flow */

const initAppState = {
    lang: '',
    signIn: {
        errorMessage: '',
    },
    signUp: {
        errorMessage: '',
    },
    verifyRegistration: {
        initialEmail: '',
        password: '',
        errorMessage: '',
    },
    currentUser: {
        signedIn: false,
        selectedBotId: '',
        attrs: {},
        botsState: {
            hasFetched: false,
            bots: [],
            errorMessage: '',
        },
        usersState: {
            hasFetched: false,
            users: [],
            errorMessage: '',
        },
        conversationsState: {
            hasFetched:    false,
            conversations: [],
            errorMessage:  '',
            lastUpdated:   0
        },
        messagesState: {
            hasFetched:   false,
            messages:     [],
            errorMessage: '',
            lastUpdated:  0
        },
        updateAttrsAndPassState: {
            successMessage: '',
            errorMessage: '',
        }
    },
    ui: {
        sideMenu: false,
        modalComponent: null,
    },
    contacts: {
        sendingInProgress: false,
        errorMessage: '',
        successMessage: '',
    },
};

export default initAppState;
