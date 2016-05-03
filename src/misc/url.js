import {languages} from '../i18n/translations.js';

export function splitLangUrl(url) {
    let match = url.match(/^(\/?)(\w+)(($|\/|\?|#).*)/);
    if (!match) return null;
    if (!languages.includes(match[2])) return null;

    return {before: match[1], lang: match[2], after: match[3]};
}

export function insertLangIntoUrl(url, lang) {
    let urlSplit = splitLangUrl(url);
    if (!urlSplit) {
        return joinPath(`/${lang}`, url);
    }
    return urlSplit.before + lang + urlSplit.after;
}

export function joinPath(a, b) {
    return b.startsWith('/') ? `${a}${b}` : `${a}/${b}`;
}

export function removeLangFromUrl(url) {
    throw new Error('NOT IMPLEMENTED');
}
