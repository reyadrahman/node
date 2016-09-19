/* @flow */

export type Location = {
    pathname: string,
    search: string,
    hash: string,
    state: any,
    key: string,
};

export type BrowserHistory = {
    listen: ((location: Location, action: any) => void) =>  (() => void),
    push: (path: string, state: any) => void,
};