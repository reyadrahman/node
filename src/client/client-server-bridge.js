/* @flow */

export async function addBot(jwtIdToken, botName: string, settings) {
    console.log('client-server-bridge addBot:');
    console.log('\tjwtIdToken: ', jwtIdToken);
    console.log('\tbotName: ', botName);
    console.log('\tsettings: ', settings);

    fetch('/api/add-bot', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
            jwtIdToken,
            botName,
            settings,
        }),
    })
}
