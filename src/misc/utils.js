function customEncodeURIComponent(comp) {
    // return encodeURIComponent(comp).replace(/\./g, '%2E').replace(/%20/g, '.');
    return encodeURIComponent(comp);
}

function customDecodeURIComponent(comp) {
    // return decodeURIComponent(comp.replace(/\./g, '%20'));
    return decodeURIComponent(comp);
}

export function searchQueryToPath(query) {
    const comps = ['search', query.type,
                   query.searchPhrase, query.filterPhotographer];
    const path = comps.filter(x => x).map(customEncodeURIComponent).join('/');
    return `/${path}`;
}

export function pathToSearchQuery(path) {
    if (!path) return null;
    const split = path.split('/').filter(x => x);
    if (split.length < 2) return null;
    return {
        type: customDecodeURIComponent(split[0] || ''),
        searchPhrase: customDecodeURIComponent(split[1] || ''),
        filterPhotographer: customDecodeURIComponent(split[2] || ''),
    };
}
