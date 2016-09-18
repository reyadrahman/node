/* @flow */

import Component from '../../../front-end-framework/component.js';
import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';

export default class AccountPage extends Component<AdminAppContext, AdminAppSubPageProps> {
    render() {
        const { className } = this.props;
        // const state = this.props.stateCursor.get();

        return (`
            <div id="account-page" class="${className} page-wrapper">
                <div class="row">
                    <div class="col-lg-12">
                        <h1 class="page-header">Account</h1>
                    </div>
                    <!-- /.col-lg-12 -->
                </div>
                 <!-- /.row -->
                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-default">
                            <div class="panel-body">
                                <h3>Account management</h3>
                                <p>This page will contain account management settings, as specified on <a href="https://github.com/deepiksdev/node/issues/78">Github</a> </p>
 
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
