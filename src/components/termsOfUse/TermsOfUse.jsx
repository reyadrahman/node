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

let TermsOfUse = React.createClass({

    render() {
        console.log('Terms render');
        const { className, i18n, i18n: { strings: { terms: strings } } } = this.props;

        return (
        	<b>Hi</b>
        );
    }
});




export default TermsOfUse;