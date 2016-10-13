export default {
    userVerification: {
        userNotAuthorized: `FR I'm afraid you are not authorized. Please contact the publisher.`,
        invalidEmail: `FR Sorry, this email address is invalid`,
        verificationTokenEmailBodyFn: token => `FR Here's your verification code: ${token}`,
        verificationTokenEmailSubjectFn: botName => `FR ${botName} - Verification Code`,
        verificationTokenSentFn: email => `FR A new verification token has been sent to your inbox at ${email}`,
        enterEmail: `FR Please enter your email address`,
        enterVerificationToken: `FR Please enter your verification code`,
        successfullyVerified: `FR Thanks, your email address has been verified`,
    },
    errors: {
        general: 'FR Sorry, there seems to be a problem...',
    },
};
