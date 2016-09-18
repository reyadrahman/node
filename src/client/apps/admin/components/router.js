/* @flow */

import Component from '../../../front-end-framework/component.js';
import * as actions from '../actions.js';
import Route from 'route-parser';

import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';


export type StringRoutes = [[string, Class<Component<AdminAppContext, *>>]];
type Routes = [[Route, Class<Component<AdminAppContext, *>>]];

type Props = {
    routes: StringRoutes,
};

/**
 * The props of the constructor expects a route item.
 * Each route, specifies the route path * (see 'route-parser' package
 * for details on syntax) and the component that will be drawn when the
 * route matches.

 * When instantiating the matched route, it passes context and props (received from
 * parent) and params (result of 'route-parser' match) to the constructor.
 * 
 * Its render method will call the render method of the matched route.
 *
 * It also sets up click handlers on <a> tags with '.dynamic-link' class,
 * to prevent them from refreshing the page and instead dynamically re-route
 * the components.
 */
export default class Router extends Component<AdminAppContext, Props> {
    routes: Routes;
    historyUnlisten: ?any;

    constructor(context: AdminAppContext, props: Props) {
        super(context, props);
        this.routes = props.routes.map(([r, c]) => [new Route(r), c]);
    }

    route(e: any) {
        this.context.history.push(e.target.pathname);
        e.preventDefault();
    }

    componentDidMount() {
        super.componentDidMount();
        console.log('router: installing click handler');
        $(document).on('click', '.dynamic-link', e => this.route(e));
        this.historyUnlisten =
            this.context.history.listen(location => this.rerender());
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $(document).off('click', '.dynamic-link');
        this.historyUnlisten && this.historyUnlisten();
    }

    matchRoute() {
        const { pathname } = this.context.history.location;
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
        const { params, component } = route;
        const oldChild = this.getChild('child');

        if (route && oldChild && oldChild.constructor === component && oldChild.routeParamsChanged) {
            oldChild.routeParamsChanged(params);
            return;
        }

        const compStr = this.render();
        $('.router-selected-child').replaceWith(compStr);
        this.getChild('child').componentDidMount();
    }

    notFound() {
        // TODO redirect somewhere else
        return '<div class="router-selected-child page-wrapper"><h1>Page not found</h1></div>'
    }

    render() {
        this.unmountChild('child');
        const route = this.matchRoute();
        if (!route) {
            return this.notFound();
        }
        const { params, component } = route;
        const props = {
            params,
            className: 'router-selected-child',
        };
        const child = this.addChild(new component(this.context, props), 'child');
        return child.render();
    }
}
