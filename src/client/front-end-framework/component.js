/* @flow */

import ice from 'icepick';

export default class Component<Props> {
    props: Props;
    children: Array<{ name: string, component: Component<Props> }>;

    constructor(props: Props) {
        this.props = props;
        this.children = [];
    }

    render(options?: Object) {
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

    addChild(component: Component<Props>, name?: string = '') {
        this.children.push({ name, component });
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