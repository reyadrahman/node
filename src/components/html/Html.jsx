import React, { Component, PropTypes } from 'react';
import { CONSTANTS } from '../../client/client-utils.js';

const faviconURL = `${CONSTANTS.PUBLIC_URL}favicon.png`;

const Html = React.createClass({

    sanitizeAndStringify(obj) {
        return JSON.stringify(obj)
                   .replace(/<\/script/g, '<\\/script')
                   .replace(/<!--/g, '<\\!--');
    },

    getSystemLang() {
        const l = this.props.systemLang || '';
        return l.match(/(\w*)/)[1];
    },

    render() {
        const styleURL = `${CONSTANTS.PUBLIC_URL}main.css`;
        const scriptURL = `${CONSTANTS.PUBLIC_URL}main.js`;
        const { initAppState, envVars, systemLang } = this.props;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title>{this.props.title}</title>
                    <meta name="description" content={this.props.description} />
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <link rel="stylesheet" type="text/css" href={styleURL} />
                    <link rel="shortcut icon" href={faviconURL} />
               </head>
                <body data-system-lang={this.getSystemLang()}>
                    <div id="reactUI" dangerouslySetInnerHTML={{ __html: this.props.body }} />
                    <script type="application/json" id="initAppState"
                        dangerouslySetInnerHTML={{
                            __html: this.sanitizeAndStringify(initAppState)
                        }}
                    />
                    <script type="application/json" id="envVars"
                        dangerouslySetInnerHTML={{
                            __html: this.sanitizeAndStringify(envVars)
                        }}
                    />
                    <script src={scriptURL} />
                </body>
            </html>
        );
    }

});

export default Html;
