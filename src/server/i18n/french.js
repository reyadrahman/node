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
        didNotUnderstand: `Désolé, je n'ai pas compris`,
        transferMessage: `Un petit instant SVP. Je suis encore en phase d'apprentissage. Je demande l'aide d'un humain...`,
        askForResponseWithHistory: `Que faut-il répondre au message ci-dessus?`,
        askForResponseWithoutHistory: `Que faut-il répondre aux messages ci-dessus?`,
        imagePlaceholder: `[Image]`,
        sentMessage: name => `Le message a bien été envoyé à "${name}"`,
    },
    errors: {
        general: 'Désolé, il semble qu\'il y ait un problème...',
    },
};
