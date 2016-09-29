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
            hasFetched: false,
            conversations: [],
            errorMessage: '',
        },
        messagesState: {
            hasFetched: false,
            messages: [],
            errorMessage: '',
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
        errorMessage: '',
        successMessage: '',
    },
};

export default initAppState;
