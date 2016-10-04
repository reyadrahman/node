import React from 'react';
// import { Form, Input, Button, ButtonArea, TextArea, SuccessMessage,
//          ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../app-state/actions.js';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import { leftPad, splitOmitWhitespace } from '../../misc/utils.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import { Glyphicon, Button, Dropdown, MenuItem, Table, FormGroup, InputGroup,
         FormControl, DropdownButton, ControlLabel, HelpBlock } from 'react-bootstrap';
import _ from 'lodash';

let TestPage = React.createClass({

    render() {
       const { className, currentUser, i18n: { strings: { testPage: strings } } } = this.props;
        if (!currentUser.signedIn) {
            return null;
        }
        return (
        	<div className={`test-page-comp ${className || ''}`}>
            <div>An iframe should be added here</div>
            </div>
        );
    }
});

TestPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        selectBot:          actions.selectBot,
    }
)(TestPage);

TestPage = withRouter(TestPage);


export default TestPage;