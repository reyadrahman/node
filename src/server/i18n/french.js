export default {
    userVerification: {
        userNotAuthorized: `Désolé, vous n'êtes pas autorisé. Veuillez contacter l'administrateur de ce bot`,
        invalidEmail: `Désolé, cette adresse mail n'est pas valide ou autorisée`,
        verificationTokenEmailBodyFn: token => `Voici votre code de vérification: ${token}`,
        verificationTokenEmailSubjectFn: botName => `${botName} - Code de vérification`,
        verificationTokenSentFn: email => `Un nouveau code de vérification a été envoyé à ${email}, veuillez le copier ici`,
        enterEmail: `Veuillez entrer votre mail`,
        enterVerificationToken: `Veuillez entrer votre code de vérification`,
        successfullyVerified: `Merci, vous êtes autorisé à dialoguer avec ce bot`,
    },
    ai: {
        didNotUnderstand: `FR Sorry, didn't get that`,
        transferMessage: `FR One moment please. I am still a trainee. Let me get some help...`,
        askForResponseWithHistory: `FR Whats your response to the above messages?`,
        askForResponseWithoutHistory: `FR Whats your response to the above message?`,
        imagePlaceholder: `[FR image]`,
    },
    errors: {
        general: 'Désolé, il semble qu\'il y ait un problème...',
    },
};
