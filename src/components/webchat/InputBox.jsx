/* @flow */

import React from 'react';
import FileReaderInput from 'react-file-reader-input';

const reportDebug = require('debug')('deepiks:WebChat:input');
const reportError = require('debug')('deepiks:WebChat:input:error');

let InputBox = React.createClass({
    getInitialState: function () {
        return {text: ''};
    },
    textEntered:     function (e) {
        let text = e.target.value;
        this.setState({text});
    },
    onKeyUp:         function (e) {
        if (e.nativeEvent.keyCode == 13) {
            this.send();
        }
    },

    send: function (e = null) {
        e && e.preventDefault();

        if (this.state.text) {
            this.props.onMessageSubmit(this.state.text);
            this.setState(this.getInitialState());
        }
    },

    uploadImage: function (e, results) {
        e.preventDefault();

        if (results.length) {
            this.props.onAttachmentSubmit(results[0][0].target.result);
        }
    },

    render:          function () {
        return (
            <div className="inputBox">
                <div className="input-group">
                    <div className="input-group-addon action"
                         onClick={e => e.target.className.indexOf('action') > -1 && this.refs.uploadButton.click()}>
                        <FileReaderInput as="url" id="attachment"
                                         onChange={this.uploadImage}>
                            <i ref="uploadButton" className="icon-file-image"/>
                        </FileReaderInput>
                    </div>

                    <input className="form-control"

                           onChange={ this.textEntered }
                           onKeyUp={ this.onKeyUp }
                           value={this.state.text}
                           placeholder="Type your message..."/>

                    <div className="input-group-addon action" onClick={this.send}>
                        <i className="icon-paper-plane-empty"/>
                    </div>
                </div>


            </div>
        );
    }
});

export default InputBox;
