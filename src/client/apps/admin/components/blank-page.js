/* @flow */

import Component from '../../../front-end-framework/component.js';
import type { AdminAppProps } from '../types.js';

type RenderProps = {
    className: string,
};

export default class BlankPage extends Component<AdminAppProps> {
    componentDidMount() {
        super.componentDidMount();
    }

    render(renderProps?: RenderProps) {
        if (!renderProps) {
            throw new Error('BlankPage: missing renderProps');
        }
        const { className } = renderProps;
        // const state = this.props.stateCursor.get();

        return (`
            <div id="page-wrapper" class="${className}">
                <h1>BLANK</h1>
            </div>
            <!-- /#page-wrapper -->
        `);
    }
}
