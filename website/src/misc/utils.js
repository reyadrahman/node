function customEncodeURIComponent(comp) {
    // return encodeURIComponent(comp).replace(/\./g, '%2E').replace(/%20/g, '.');
    return encodeURIComponent(comp);
}

function customDecodeURIComponent(comp) {
    // return decodeURIComponent(comp.replace(/\./g, '%20'));
    return decodeURIComponent(comp);
}

export function searchQueryToPath(query) {
    const comps = ['search', query.searchPhrase, query.filterPhotographer];
    const path = comps.filter(x => x).map(customEncodeURIComponent).join('/');
    return `/${path}`;
}

export function pathToSearchQuery(path) {
    if (!path) return null;
    const split = path.split('/').filter(x => x);
    if (split.length < 1) return null;
    return {
        searchPhrase: customDecodeURIComponent(split[0] || ''),
        filterPhotographer: customDecodeURIComponent(split[1] || ''),
    };
}

export function isFullscreen() {
    return Boolean(document && (
                   document.fullscreenElement ||
                   document.mozFullScreenElement ||
                   document.webkitFullscreenElement ||
                   document.msFullscreenElement));
}

export function requestFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}

export function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
}
