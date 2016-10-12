export default {
    authorization: {
        userNotAuthorized: `FR I'm afraid you are not authorized. Please contact the publisher.`,
        emailNotAuthorized: `FR Sorry, this email address is not authorized. Please enter another ` +
                            `email address or your authorization code.`,
        authorizationSentFn: email => `FR A new authorization token has been sent to your inbox at ${email}`,
        enterAuthorizationTokenOrEmail: `FR Please provide your authorization code. ` +
                                        `If you don't have one you can enter your email ` +
                                        `address instead and I will send you one.`,
        successfullyAuthorized: `FR Thanks, now we can chat`,
        authTokenEmailBodyFn: token => `FR Here's your authentication code: ${token}`,
        authTokenEmailSubjectFn: botName => `FR ${botName} - Authorization Code`,
        emailAlreadyAuthorized: `FR Sorry, this email is already authorized. Please enter another ` +
                                `email address or your authorization code.`,
    },
    errors: {
        general: 'FR Sorry, there seems to be a problem...',
    },
};
