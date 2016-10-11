export default {
    authorization: {
        userNotAuthorized: `I'm afraid you are not authorized. Please contact the publisher.`,
        emailNotAuthorized: `Sorry, this email address is not authorized. Please enter another ` +
                            `email address or your authorization code.`,
        authorizationSentFn: email => `A new authorization token has been sent to your inbox at ${email}`,
        enterAuthorizationTokenOrEmail: `Please provide your authorization code. ` +
                                        `If you don't have one you can enter your email ` +
                                        `address instead and I will send you one.`,
        successfullyAuthorized: `Thanks, now we can chat`,
        authTokenEmailBodyFn: token => `Here's your authentication code: ${token}`,
        authTokenEmailSubjectFn: botName => `${botName} - Authorization Code`,
    },
    errors: {
        general: 'Sorry, there seems to be a problem...',
    },
};
