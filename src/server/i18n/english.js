export default {
    userVerification: {
        userNotAuthorized: `I'm afraid you are not authorized. Please contact the publisher.`,
        invalidEmail: `Sorry, this email address is invalid`,
        verificationTokenEmailBodyFn: token => `Here's your verification code: ${token}`,
        verificationTokenEmailSubjectFn: botName => `${botName} - Verification Code`,
        verificationTokenSentFn: email => `A new verification token has been sent to your inbox at ${email}`,
        enterEmail: `Please enter your email address`,
        enterVerificationToken: `Please enter your verification code`,
        successfullyVerified: `Thanks, your email address has been verified`,
    },
    ai: {
        didNotUnderstand: `Sorry, didn't get that`,
        transferMessage: `One moment please. I am still a trainee. Let me get some help...`,
        askForResponseWithHistory: `Whats your response to the above messages?`,
        askForResponseWithoutHistory: `Whats your response to the above message?`,
        imagePlaceholder: `[image]`,
        sentMessage: name => `Message was successfully sent to "${name}"`,
    },
    errors: {
        general: 'Sorry, there seems to be a problem...',
    },
};
