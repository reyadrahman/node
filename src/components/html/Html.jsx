import React, { Component, PropTypes } from 'react';
import { ENV } from '../../client/client-utils.js';

import CookieConsent from '../cookie-consent/CookieConsent.jsx'

const { PUBLIC_URL } = ENV;

const Html = React.createClass({

    sanitizeAndStringify(obj) {
        return JSON.stringify(obj)
                   .replace(/<\/script/g, '<\\/script')
                   .replace(/<!--/g, '<\\!--');
    },

    render() {
        const styleURL = `${PUBLIC_URL}style.css`;
        const scriptURL = `${PUBLIC_URL}bundle.js`;
        const { initAppState, envVars } = this.props;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title>{this.props.title}</title>
                    <meta name="description" content={this.props.description} />
                    <link rel="stylesheet" type="text/css" href={styleURL} />
                    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.10/cookieconsent.min.js"></script>
                </head>
                <body>
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
