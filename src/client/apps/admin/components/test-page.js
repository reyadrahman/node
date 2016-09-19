/* @flow */

import Component from '../../../front-end-framework/component.js';
import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';

export default class TestPage extends Component<AdminAppContext, AdminAppSubPageProps> {
    render() {
        const { className } = this.props;
        // const state = this.props.stateCursor.get();

        return (`
            <div id="account-page" class="${className} page-wrapper">
                <div class="row">
                    <div class="col-lg-12">
                        <h1 class="page-header">Test</h1>
                    </div>
                    <!-- /.col-lg-12 -->
                </div>
                 <!-- /.row -->
                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-default">
                            <div class="panel-body">
                                <h3>Testing the bot</h3>
                                <p>This page will contain a web version of the bot, as specified on <a href="https://github.com/deepiksdev/node/issues/45">Github</a> </p>
                                <p>Below is an example using the Microsoft bot framework which we consider not satisfactory </p>
                                <iframe src="https://webchat.botframework.com/embed/deepiks?s=B3lvwUz4p0Q.cwA.-YA.toIk9HIRPR2aBTvrdCb5YYX9xcoHd18ibusSV29lyeg" style="height: 502px; max-height: 502px; width:100%"></iframe>
 
                            </div>
                        </div>
                    </div>
                    <!-- /.col-lg-12 -->
                </div>
                <!-- /.row -->
            </div>
        `);
    }
}
