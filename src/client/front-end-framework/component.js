/* @flow */

export default class Component<Props> {
    props: Props;

    constructor(props: Props) {
        this.props = props;
    }

    render() {
        throw new Error('Forgot to implement render method?');
    }

    // should be called manually
    componentDidMount() { }

    // should be called manually
    componentWillUnmount() { }
}