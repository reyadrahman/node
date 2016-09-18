/* @flow */

import Component from './component.js';

export default class App<Context, Props> extends Component<Context, Props> {
    getStyleSheets(): string[] {
        return [];
    }

    getScripts(): string[] {
        return [];
    }

    getTitle(): string {
        return 'Title';
    }
}