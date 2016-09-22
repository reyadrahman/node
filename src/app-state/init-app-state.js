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
        isSignedIn: false,
        attrs: {},
        botsState: {
            hasFetched: false,
            bots: [],
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