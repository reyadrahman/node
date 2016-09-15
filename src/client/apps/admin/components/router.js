/* @flow */

import Component from '../../../front-end-framework/component.js';
import * as actions from '../actions.js';
import Route from 'route-parser';

import type { AdminAppProps } from '../types.js';

export type StringRoutes = [[string, Class<Component<AdminAppProps>>]];
type Routes = [[Route, Class<Component<AdminAppProps>>]];

/**
 * The constructor takes 2 args: props and routes.
 * Each route, specifies the route path * (see 'route-parser' package
 * for details on syntax) and the component that will be drawn when the
 * route matches.

 * When instantiating the matched route, it passes props (received from
 * parent) and params (result of 'route-parser' match) to the constructor.
 * 
 * Its render method will call the render method of the matched route.
 *
 * It also sets up click handlers on <a> tags with '.dynamic-link' class,
 * to prevent them from refreshing the page and instead dynamically re-route
 * the components.
 */
export default class Router extends Component<AdminAppProps> {
    routes: Routes;
    historyUnlisten: ?any;

    constructor(props: AdminAppProps, routes: StringRoutes) {
        super(props);
        this.routes = routes.map(([r, c]) => [new Route(r), c]);
    }

    route(e: any) {
        this.props.history.push(e.target.pathname);
        e.preventDefault();
    }

    componentDidMount() {
        super.componentDidMount();
        console.log('router: installing click handler');
        $(document).on('click', '.dynamic-link', e => this.route(e));
        this.historyUnlisten =
            this.props.history.listen(location => this.rerender());
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $(document).off('click', '.dynamic-link');
        this.historyUnlisten && this.historyUnlisten();
    }

    matchRoute() {
        const { pathname } = this.props.history.location;
        const selectedRoute = this.routes.find(([route]) => route.match(pathname));
        if (!selectedRoute) {
            console.error(`Router: unknown route ${pathname}`);
            return null;
        }
        const params = selectedRoute[0].match(pathname);
        return { params, component: selectedRoute[1] };
    }

    rerender() {
        console.log('Router: rerender');
        const route = this.matchRoute();

        if (!route) {
            $('.router-selected-child').replaceWith(this.notFound());
            return;
        }

        const { params, component } = route;


        const oldChild = this.getChild('child');
        if (oldChild.constructor === component && oldChild.routeParamsChanged) {
            oldChild.routeParamsChanged(params);
        } else {
            const compStr = this.renderHelper(params, component);
            $('.router-selected-child').replaceWith(compStr);
            this.getChild('child').componentDidMount();
        }
    }

    notFound() {
        // TODO redirect somewhere else
        return '<div class="router-selected-child" id="page-wrapper"><h1>Page not found</h1></div>'
    }

    renderHelper(params: Object, component: Class<Component<AdminAppProps>>) {
        console.log('Router renderHelper: params: ', params, ', component: ', component);
        this.unmountChild('child');
        const child = this.addChild(new component(this.props, params), 'child');

        return child.render({ className: 'router-selected-child'});
    }

    render() {
        const route = this.matchRoute();
        if (!route) {
            return this.notFound();
        }
        return this.renderHelper(route.params, route.component);
    }
}
