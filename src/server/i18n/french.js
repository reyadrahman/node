export default {
    userVerification: {
        userNotAuthorized: `Désolé, vous n'êtes pas autorisé. Veuillez contacter l'administrateur de ce bot`,
        invalidEmail: `Désolé, cette adresse mail n'est pas valide`,
        verificationTokenEmailBodyFn: token => `Voici votre code de vérification: ${token}`,
        verificationTokenEmailSubjectFn: botName => `${botName} - Code de vérification`,
        verificationTokenSentFn: email => `Un nouveau code de vérification a été envoyé à ${email}`,
        enterEmail: `Veuillez entrer votre mail`,
        enterVerificationToken: `Veuillez entrer votre code de vérification`,
        successfullyVerified: `Merci, vous êtes autorisé à dialoguer avec ce bot`,
    },
    errors: {
        general: 'Désolé, il semble qu\'il y ait un problème...',
    },
};
