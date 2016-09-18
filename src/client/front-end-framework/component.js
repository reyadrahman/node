/* @flow */

import ice from 'icepick';

export default class Component<Context, Props> {
    context: Context;
    props: Props;
    children: Array<{ name: string, component: Component<Context, any> }>;

    constructor(context: Context, props: Props = {}) {
        this.context = context;
        this.props = props;
        this.children = [];
    }

    render() {
        throw new Error('Forgot to implement render method?');
    }

    // should be called manually
    componentDidMount() {
        this.children.forEach(x => {
            x.component.componentDidMount();
        });
    }

    // should be called manually
    componentWillUnmount() {
        this.children.forEach(x => {
            x.component.componentWillUnmount();
        })
    }

    addChild(component: Component<Context, any>, name?: string = '')
        : Component<Context, any>
    {
        console.log('Component addChild: this: ', this, ', component: ', component);
        this.children = ice.push(this.children, { name, component });
        // this.children = [{name, component}];
        return component;
    }

    unmountChildren() {
        this.children.forEach(x => {
            x.component.componentWillUnmount();
        });
        this.children = [];
    }

    unmountChild(name: string) {
        const index = this.children.findIndex(x => x.name === name);
        if (index !== -1) {
            this.children[index].component.componentWillUnmount();
            this.children = ice.splice(this.children, index, 1);
            return true;
        }
        return false;
    }

    getChild(name: string) {
        const child = this.children.find(x => x.name === name);
        return child && child.component;
    }
}