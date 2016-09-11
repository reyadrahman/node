/* @flow */

// import EventSystem from '../../front-end-framework/event-system.js';
// import { Cursor } from '../../../misc/atom.js';
import Component from '../../../front-end-framework/component.js';
// import { ENV as CLIENT_ENV } from '../../../client-utils.js';
import * as actions from '../actions.js';

import type { AdminAppProps } from '../types.js';

// const { PUBLIC_URL } = CLIENT_ENV;

export type Routes = [[string, Class<Component<AdminAppProps>>]];

export default class Router extends Component<AdminAppProps> {
    routes: Routes;

    constructor(props: AdminAppProps, routes: Routes) {
        super(props);
        this.routes = routes;
    }

    route(e) {
        const pathname = e.target.pathname;
        this.props.dispatchAction(actions.changeLocation(pathname));
        e.preventDefault();
    }

    componentDidMount() {
        super.componentDidMount();
        console.log('router: installing click handler');
        $(document).on('click', '.dynamic-link', e => this.route(e));
        this.props.eventSystem.subscribe(() => this.rerender(), 'locationChanged');
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $(document).off('click', '.dynamic-link');
    }


    rerender() {
        console.log('Router: rerender');
        $('.router-selected-child').replaceWith(this.render());
        super.componentDidMount();
    }

    render() {
        const state = this.props.stateCursor.get();
        this.unmountChildren();

        const selectedRoute = this.routes.find(x => {
            if (x[0] instanceof RegExp) {
                return state.path.match(x[0]);
            } else {
                return state.path === x[0];
            }
        });
        if (!selectedRoute) {
            throw new Error(`Router: unknown route ${state.path}`);
        }
        console.log('this.routes', this.routes);
        const child = this.addChild(new selectedRoute[1](this.props));

        return child.render({ className: 'router-selected-child'});
    }
}
