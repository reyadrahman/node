import React, { Component, PropTypes } from 'react';
import { ENV } from '../../misc/utils.js';

const { PUBLIC_URL } = ENV;

const Html = React.createClass({

    /*
    appStore() {
        log('appStoreSafeString: ', this.props.appStoreSafeString);
        return ({ __html: this.props.appStoreSafeString});
    }
    */

    getInitAppState() {
        return JSON.stringify(this.props.initAppState)
                   .replace(/<\/script/g, '<\\/script')
                   .replace(/<!--/g, '<\\!--');
    },

    render() {
        const styleURL = `${PUBLIC_URL}style.css`;
        const scriptURL = `${PUBLIC_URL}bundle.js`;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title>{this.props.title}</title>
                    <meta name="description" content={this.props.description} />
                    <link rel="stylesheet" type="text/css" href={styleURL} />
                </head>
                <body>
                    <div id="reactUI" dangerouslySetInnerHTML={{ __html: this.props.body }} />
                    <script type="application/json" id="initAppState"
                        dangerouslySetInnerHTML={{__html: this.getInitAppState()}} />
                    <script src={scriptURL} />
                </body>
            </html>
        );
    }

});

export default Html;
