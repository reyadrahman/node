/* @flow */

import Component from './component.js';

export default class App<Context, Props> extends Component<Context, Props> {
    static getStyleSheets(): string[] {
        return [];
    }

    static getScripts(): string[] {
        return [];
    }

    static getTitle(): string {
        return 'Deepiks Bot Platform';
    }

    static getRoutes(route: string): boolean {

    }
}