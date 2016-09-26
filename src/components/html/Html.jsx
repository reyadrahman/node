import React, { Component, PropTypes } from 'react';
import { ENV } from '../../client/client-utils.js';


const { PUBLIC_URL } = ENV;

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
        const styleURL = `${PUBLIC_URL}main.css`;
        const scriptURL = `${PUBLIC_URL}main.js`;
        const { initAppState, envVars, systemLang } = this.props;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title>{this.props.title}</title>
                    <meta name="description" content={this.props.description} />
                    <link rel="stylesheet" type="text/css" href={styleURL} />
                    <!-- Begin Cookie Consent plugin by Silktide - http://silktide.com/cookieconsent -->
					<script type="text/javascript">
						window.cookieconsent_options = {"message":"This website uses cookies to ensure you get the best experience on our website","dismiss":"Got it!","learnMore":"More info","link":null,"theme":"dark-bottom"};
					</script>
					<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.10/cookieconsent.min.js"></script>
					<!-- End Cookie Consent plugin -->

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
