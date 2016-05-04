import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/actions.js';


function connectRouterRedux(Child) {

    let ReactRouterRedux = React.createClass({
        render() {
            return (
                <Child {...this.props} />
            );
        },

        componentWillMount() {
            this.updateStore(this.props);
        },

        componentWillReceiveProps(newProps) {
            this.updateStore(newProps);
        },

        updateStore(props) {
            let pathname = props.location.pathname;
            props.dispatch(actions.changeLocation({pathname}));
        }

    });

    ReactRouterRedux = connect(
        state => ({
            systemLang: state.systemLang,
        })
    )(ReactRouterRedux);

    return ReactRouterRedux;
}


export default connectRouterRedux;
