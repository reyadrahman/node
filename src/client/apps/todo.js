/* @flow */

import EventSystem from '../front-end-framework/event-system.js';
import { Cursor } from '../../misc/atom.js';
import Component from '../front-end-framework/component.js';

import type { AppProps, Action } from '../types.js';

export class Todo extends Component<AppProps> {
    constructor(props: AppProps) {
        super(props);
        console.log('app constructor');
    }

    render() {
        console.log('App render');
        const state = this.props.stateCursor.get();
        return `<h1 id="myapph1">${state.a.b.c}</h1>`;
    }

    rerender() {
        console.log('App rerender');
        const state = this.props.stateCursor.get();
        document.getElementById('myapph1').innerHTML = state.a.b.c;
    }

    componentDidMount() {
        console.log('app did mount');
        this.props.eventSystem.subscribe(e => this.rerender(), 'c/update');

        setTimeout(() => {
            this.props.dispatchAction({
                type: 'c/update',
                c: 'muhahhahahah!',
            });
            this.props.eventSystem.publish('c/update');
        }, 2000);
        // TODO call componentDidMount on children
    }

    componentWillUnmount() {
        console.log('app will unmount');
    }
}

export function dispatchAction(props: AppProps, action: Action) {
    if (action.type === 'c/update') {
        props.stateCursor.$assocIn(['a', 'b', 'c'], action.c);
    }
}

export default Todo;
