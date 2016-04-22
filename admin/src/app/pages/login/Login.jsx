import React, {Component} from 'react';

import UiValidate from '../../../components/forms/validation/UiValidate.jsx';
import About from './About.jsx';
import Header from './Header.jsx';
import SocialGroup from './SocialGroup.jsx';

import Auth from '../../auth';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: ''};
        this.handleSubmit = this._handleSubmit.bind(this);
    }

    _handleSubmit(e) {
        e.preventDefault();

        if (this.form.checkValidity()) {
            Auth.login(this.state.email, this.state.password)
                .catch(err => {
                    this.setState({errors: {email: "Wrong email or password!"}});
                });
        }
    }

    render() {
        return (
            <div id="extr-page" >
                <Header>
                    <span id="extr-page-header-space">
                        <span className="hidden-mobile hiddex-xs">Need an account?</span>&nbsp;
                        <a href="#/register" className="btn btn-danger">Create account</a>
                    </span>
                </Header>
                <div id="main" role="main" className="animated fadeInDown">

                    <div id="content" className="container">
                        <div className="row">
                            <About className="col-xs-12 col-sm-12 col-md-7 col-lg-8 hidden-xs hidden-sm" />
                            <div className="col-xs-12 col-sm-12 col-md-5 col-lg-4">
                                <div className="well no-padding">
                                    <UiValidate errors={this.state.errors}>
                                    <form id="login-form" className="smart-form client-form" onSubmit={this.handleSubmit}
                                          ref={el => this.form = el}>
                                        <header>
                                            Sign In
                                        </header>
                                        <fieldset>
                                            <section>
                                                <label className="label">E-mail</label>
                                                <label className="input"> <i className="icon-append fa fa-user"/>
                                                    <input type="email" name="email" data-smart-validate-input=""
                                                           data-required="" data-email=""
                                                           data-message-required="Please enter your email address"
                                                           data-message-email="Please enter a VALID email address"
                                                           onChange={e => this.setState({email: e.target.value})}/>
                                                    <b className="tooltip tooltip-top-right"><i className="fa fa-user txt-color-teal"/>
                                                        Please enter email address/username</b></label>
                                            </section>
                                            <section>
                                                <label className="label">Password</label>
                                                <label className="input"> <i className="icon-append fa fa-lock"/>
                                                    <input type="password" name="password" data-smart-validate-input=""
                                                           data-required="" data-minlength="3" data-maxnlength="20"
                                                           data-message="Please enter your email password"
                                                           onChange={e => this.setState({password: e.target.value})}/>
                                                    <b className="tooltip tooltip-top-right"><i className="fa fa-lock txt-color-teal"/> Enter
                                                        your password</b> </label>

                                                <div className="note">
                                                    <a href="#/forgot">Forgot password?</a>
                                                </div>
                                            </section>
                                            <section>
                                                <label className="checkbox">
                                                    <input type="checkbox" name="remember" defaultChecked={true}/>
                                                    <i/>Stay signed in</label>
                                            </section>
                                        </fieldset>
                                        <footer>
                                            <button type="submit" className="btn btn-primary">
                                                Sign in
                                            </button>
                                        </footer>
                                    </form>
                                    </UiValidate>
                                </div>
                                <SocialGroup />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Login;
