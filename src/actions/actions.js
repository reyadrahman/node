export function changeLang(lang) {
    return {
        type: 'CHANGE_LANG',
        lang,
    };
}

export function test(v) {
    return {
        type: 'TEST',
        test: v,
    };
}
export function changeIsLangInUrl(isLangInUrl) {
    return {
        type: 'IS_LANG_IN_URL',
        isLangInUrl,
    };
}
export function changeLocation(location) {
    return {
        type: 'LOCATION',
        location,
    };
}
