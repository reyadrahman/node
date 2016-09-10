/* @flow */

import Component from './component.js';

export default class App<Props> extends Component<Props> {
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