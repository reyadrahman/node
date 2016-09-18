/* @flow */

import Component from '../../../front-end-framework/component.js';
import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';

export default class BlankPage extends Component<AdminAppContext, AdminAppSubPageProps> {
    render() {
        const { className } = this.props;
        // const state = this.props.stateCursor.get();

        return (`
            <div id="blank-page" class="${className} page-wrapper">
                <h1>BLANK</h1>
            </div>
        `);
    }
}
