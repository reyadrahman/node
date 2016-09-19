/* @flow */

import Component from '../../../front-end-framework/app.js';
import * as actions from '../actions';
import type { LandingPageAppContext, LandingPageAppSubPageProps } from '../types.js';

import isEmpty from 'lodash/isEmpty';

type Props = {
    contentComponent: Component<LandingPageAppContext, *>;
};

export default class Layout extends Component<LandingPageAppContext, LandingPageAppSubPageProps> {
    signInErrorMessageTimeout: any;

    componentDidMount() {
        $(document).on('click', '#signInButton', () => this.signIn());
        // on press enter
        $(document).on('keypress', '#signInModal input', e => {
            if (e.which == 13) {
                this.signIn();
                return false;
            }
        });
        $(document).on('click', '#signOutButton', () => this.signOut());
        this.context.eventSystem.subscribe(x => this.signInFailed(x), 'signInFailed');
        this.context.eventSystem.subscribe(x => this.signedOut(), 'signedOut');
    }

    signIn() {
        const email = $('#signInInputEmail').val().trim();
        const password = $('#signInInputPassword').val().trim();
        if (!email || !password) {
            this.signInFailed({ errorMessage: 'Please enter your email and password'});
            return;
        }

        this.context.dispatchAction(actions.signIn(email, password));
    }

    signInFailed({ errorMessage }) {
        clearTimeout(this.signInErrorMessageTimeout);
        $('#signInErrorMessage').html(`Error: ${errorMessage}`).removeClass('hidden-xs-up');
        this.signInErrorMessageTimeout = setTimeout(() => {
            $('#signInErrorMessage').addClass('hidden-xs-up').html(``);
        }, 5000);
        // TODO timeout
    }

    signOut() {
        this.context.dispatchAction(actions.signOut());
    }

    signedOut() {
        $('#signInMenuItem, #profileMenuItem').replaceWith(this.renderSignInOrProfile());
        $('#signInMenuItemMobile, #profileMenuItemMobile').replaceWith(this.renderSignInOrProfileMobile());
    }

    renderSignInOrProfile() {
        const {currentUser: { signedIn, attributes } } = this.context.stateCursor.get();

        if (signedIn) {
            const { given_name, family_name, email } = attributes;
            const name = `${given_name || ''} ${family_name || ''}`.trim();
            return `
                <li class="nav-item dropdown hidden-sm-down textselect-off" id="profileMenuItem">
                  <a class="nav-link dropdown-toggle" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${name}
                    <span class="icon-caret-down"></span>
                  </a>
                  <div class="dropdown-menu dropdown-menu-right dropdown-menu-user dropdown-menu-animated" aria-labelledby="dropdownMenu2">
                    <div class="media">
                      ${
                          ''
                          // <div class="media-left">
                          //   <img src="${require('./img/face5.jpg')}" height="60" width="60" alt="Avatar" class="img-circle">
                          // </div>
                      }
                      <div class="media-body media-middle">
                        <h5 class="media-heading">${name}</h5>
                        <h6>${email}</h6>
                      </div>
                    </div>
                    <a href="/admin" class="dropdown-item text-uppercase">Admin</a>
                    <a href="javascript:void(0)" class="dropdown-item text-uppercase" id="signOutButton">Sign out</a>
                  </div>
                </li>
            `;
        } else {
            return `
                <li class="nav-item nav-item-toggable" id="signInMenuItem">
                  <a class="nav-link" href="javascript:void(0)" data-toggle="modal" data-target="#signInModal">Sign in</a>
                </li>
            `;
        }

    }

    renderSignInOrProfileMobile() {
        // TODO
        return ``;

    }

    renderSignInModal() {
        return `
            <div class="modal fade" id="signInModal" tabindex="-1" role="dialog" aria-labelledby="signInModalTitle" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title" id="signInModalTitle">Sign in</h4>
                  </div>
                  <div class="modal-body">
                    <form>
                      <div class="form-group has-icon-left form-control-email">
                        <label class="sr-only" for="signInInputEmail">Email address</label>
                        <input type="email" class="form-control form-control-lg" id="signInInputEmail" placeholder="Email address" autocomplete="off">
                      </div>
                      <div class="form-group has-icon-left form-control-password">
                        <label class="sr-only" for="signInInputPassword">Password</label>
                        <input type="password" class="form-control form-control-lg" id="signInInputPassword" placeholder="Enter your password" autocomplete="off">
                      </div>
                      <div class="alert alert-danger hidden-xs-up" id="signInErrorMessage"></div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button id="signInButton" type="button" class="btn btn-primary">Sign in</button>
                  </div>
                </div>
              </div>
            </div>
        `;
    }

    render() {
        console.log('Layout render');
        const { contentComponent } = this.props;

        const signInOrProfile = this.renderSignInOrProfile();
        const signInOrProfileMobile = this.renderSignInOrProfileMobile();
        const signInModal = this.renderSignInModal();

        return `
            <div id="landio">
                ${signInModal}
                <div id="layout-root">
                    <!-- Navigation
                    ================================================== -->

                    <nav class="navbar navbar-dark bg-inverse bg-inverse-custom navbar-fixed-top">
                      <div class="container">
                        <a class="navbar-brand dynamic-link" href="/">
                          <span><img src="${require('../img/white-logo.png')}" height="45" alt="logo" class="img-responsive"/></span>
                          <span class="sr-only">Land.io</span>
                        </a>
                        <a class="navbar-toggler hidden-md-up pull-xs-right" data-toggle="collapse" href="#collapsingNavbar" aria-expanded="false" aria-controls="collapsingNavbar">
                        &#9776;
                      </a>
                        <a class="navbar-toggler navbar-toggler-custom hidden-md-up pull-xs-right" data-toggle="collapse" href="#collapsingMobileUser" aria-expanded="false" aria-controls="collapsingMobileUser">
                          <span class="icon-user"></span>
                        </a>
                        <div id="collapsingNavbar" class="collapse navbar-toggleable-custom" role="tabpanel" aria-labelledby="collapsingNavbar">
                          <ul class="nav navbar-nav pull-xs-right">
                            ${
                            ''/*
                                <li class="nav-item nav-item-toggable">
                                  <a class="nav-link" href="/admin">Admin</a>
                                </li>
                            */
                            }
                            ${signInOrProfile}
                          </ul>
                        </div>
                        ${signInOrProfileMobile}
                      </div>
                    </nav>

                    <!-- Hero Section
                    ================================================== -->

                    <header class="jumbotron bg-inverse text-xs-center center-vertically" role="banner">
                      <div class="container">
                        <h1 class="display-3">Deepiks</h1>
                        <h2 class="m-b-3">Subtitle where you can <em>emphasize</em> words.</h2>
                      </div>
                    </header>

                    ${ contentComponent.render() }
                    
                    <!-- Footer
                    ================================================== -->

                    <footer class="section-footer bg-inverse" role="contentinfo">
                      <div class="container">
                        <div class="row">
                          <div class="col-md-6 col-lg-5">
                            <div class="media">
                              <div class="media-left">
                                <span class="media-object icon-logo display-1"></span>
                              </div>
                              <small class="media-body media-bottom">
                                &copy; Land.io 2015. <br>
                                Designed by Peter Finlan, developed by Taty Grassini, exclusively for Codrops.
                                </small>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-7">
                            <ul class="nav nav-inline">
                              <li class="nav-item"><a class="nav-link dynamic-link" href="/privacy">Privacy</a></li>
                              <li class="nav-item"><a class="nav-link dynamic-link" href="/terms">Terms and Conditions</a></li>
                              <li class="nav-item"><a class="nav-link scroll-top" href="#totop">Back to top <span class="icon-caret-up"></span></a></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </footer>
                </div>
            </div>
        `;
    }
}

