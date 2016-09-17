/* @flow */

import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import App from '../../front-end-framework/app.js';
import { ENV as CLIENT_ENV } from '../../client-utils.js';
import * as actions from './actions.js';

// this will import ./landio.js on the server and ./landio.web.js on the client
import initLandio from './landio';

import type { LandingPageAppProps, Action } from './types.js';

import './scss/landing-page.scss';
import './scss/landio.scss';

const { PUBLIC_URL } = CLIENT_ENV;

export default class LandingPage extends App<LandingPageAppProps> {
    signInErrorMessageTimeout: any;

    getScripts(): string[] {
        return [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
            `${PUBLIC_URL}landingPage.js`,
        ];
    }

    getStyleSheets(): string[] {
        return [
            `${PUBLIC_URL}landingPage.css`,
        ];
    }

    componentDidMount() {
        initLandio();

        $('#signInButton').click(() => this.signIn());
        // on press enter
        $('#signInModal input').keypress(e => {
            if (e.which == 13) {
                this.signIn();
                return false;
            }
        });
        $('#signOutButton').click(() => this.signOut());
        this.props.eventSystem.subscribe(x => this.signInFailed(x), 'signInFailed');
        this.props.eventSystem.subscribe(x => this.signedOut(), 'signedOut');
    }

    signIn() {
        const email = $('#signInInputEmail').val().trim();
        const password = $('#signInInputPassword').val().trim();
        if (!email || !password) {
            this.signInFailed({ errorMessage: 'Please enter your email and password'});
            return;
        }

        this.props.dispatchAction(actions.signIn(email, password));
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
        this.props.dispatchAction(actions.signOut());
    }

    signedOut() {
        $('#signInMenuItem, #profileMenuItem').replaceWith(this.renderSignInOrProfile());
        $('#signInMenuItemMobile, #profileMenuItemMobile').replaceWith(this.renderSignInOrProfileMobile());
    }

    renderSignInOrProfile() {
        const {currentUser: { signedIn, attributes } } = this.props.stateCursor.get();

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
        const signInOrProfile = this.renderSignInOrProfile();
        const signInOrProfileMobile = this.renderSignInOrProfileMobile();
        const signInModal = this.renderSignInModal();


        return (
`
  <div id="landio">

    ${signInModal}

    <!-- Navigation
    ================================================== -->

    <nav class="navbar navbar-dark bg-inverse bg-inverse-custom navbar-fixed-top">
      <div class="container">
        <a class="navbar-brand" href="#">
          <span><img src="${require('./img/white-logo.png')}" height="45" alt="logo" class="img-responsive"/></span>
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
            <li class="navbar-divider hidden-sm-down"></li>
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

    <!-- Intro
    ================================================== -->

    <section class="section-intro bg-faded text-xs-center">
      <div class="container">
        <h3 class="wp wp-1">Build your beautiful UI, the way you want it, with Land.io</h3>
        <p class="lead wp wp-2">Craft memorable, emotive experiences with our range of beautiful UI elements.</p>
        <img src="${require('./img/mock.png')}" alt="iPad mock" class="img-fluid wp wp-3">
      </div>
    </section>

    <!-- Features
    ================================================== -->

    <section class="section-features text-xs-center">
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <div class="card">
              <div class="card-block">
                <span class="icon-pen display-1"></span>
                <h4 class="card-title">250</h4>
                <h6 class="card-subtitle text-muted">UI Elements</h6>
                <p class="card-text">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras eu adipiscing ac cras at sem cras per senectus eu parturient quam.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-block">
                <span class="icon-thunderbolt display-1"></span>
                <h4 class="card-title">Ultra</h4>
                <h6 class="card-subtitle text-muted">Modern design</h6>
                <p class="card-text">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras eu adipiscing ac cras at sem cras per senectus eu parturient quam.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card m-b-0">
              <div class="card-block">
                <span class="icon-heart display-1"></span>
                <h4 class="card-title">Free</h4>
                <h6 class="card-subtitle text-muted">Forever and ever</h6>
                <p class="card-text">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras eu adipiscing ac cras at sem cras per senectus eu parturient quam.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing
    ================================================== -->

    <section class="section-pricing bg-faded text-xs-center">
      <div class="container">
        <h3>Manage your subscriptions</h3>
        <div class="row p-y-3">
          <div class="col-md-4 p-t-md wp wp-5">
            <div class="card pricing-box">
              <div class="card-header text-uppercase">
                Personal
              </div>
              <div class="card-block">
                <p class="card-title">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras.</p>
                <h4 class="card-text">
                  <sup class="pricing-box-currency">$</sup>
                  <span class="pricing-box-price">19</span>
                  <small class="text-muted text-uppercase">/month</small>
                </h4>
              </div>
              <ul class="list-group list-group-flush p-x">
                <li class="list-group-item">Sed risus feugiat</li>
                <li class="list-group-item">Sed risus feugiat fusce eu sit</li>
                <li class="list-group-item">Sed risus feugiat fusce</li>
              </ul>
              <a href="#" class="btn btn-primary-outline">Get Started</a>
            </div>
          </div>
          <div class="col-md-4 stacking-top">
            <div class="card pricing-box pricing-best p-x-0">
              <div class="card-header text-uppercase">
                Professional
              </div>
              <div class="card-block">
                <p class="card-title">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras.</p>
                <h4 class="card-text">
                  <sup class="pricing-box-currency">$</sup>
                  <span class="pricing-box-price">49</span>
                  <small class="text-muted text-uppercase">/month</small>
                </h4>
              </div>
              <ul class="list-group list-group-flush p-x">
                <li class="list-group-item">Sed risus feugiat</li>
                <li class="list-group-item">Sed risus feugiat fusce eu sit</li>
                <li class="list-group-item">Sed risus feugiat fusce</li>
                <li class="list-group-item">Sed risus feugiat</li>
              </ul>
              <a href="#" class="btn btn-primary">Get Started</a>
            </div>
          </div>
          <div class="col-md-4 p-t-md wp wp-6">
            <div class="card pricing-box">
              <div class="card-header text-uppercase">
                Enterprise
              </div>
              <div class="card-block">
                <p class="card-title">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras.</p>
                <h4 class="card-text">
                  <sup class="pricing-box-currency">$</sup>
                  <span class="pricing-box-price">99</span>
                  <small class="text-muted text-uppercase">/month</small>
                </h4>
              </div>
              <ul class="list-group list-group-flush p-x">
                <li class="list-group-item">Sed risus feugiat</li>
                <li class="list-group-item">Sed risus feugiat fusce eu sit</li>
                <li class="list-group-item">Sed risus feugiat fusce</li>
              </ul>
              <a href="#" class="btn btn-primary-outline">Get Started</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials
    ================================================== -->

    <section class="section-testimonials text-xs-center bg-inverse">
      <div class="container">
        <h3 class="sr-only">Testimonials</h3>
        <div id="carousel-testimonials" class="carousel slide" data-ride="carousel" data-interval="0">
          <div class="carousel-inner" role="listbox">
            <div class="carousel-item active">
              <blockquote class="blockquote">
                <img src="${require('./img/face1.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                <p class="h3">Good design at the front-end suggests that everything is in order at the back-end, whether or not that is the case.</p>
                <footer>Dmitry Fadeyev</footer>
              </blockquote>
            </div>
            <div class="carousel-item">
              <blockquote class="blockquote">
                <img src="${require('./img/face2.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                <p class="h3">It’s not about knowing all the gimmicks and photo tricks. If you haven’t got the eye, no program will give it to you.</p>
                <footer>David Carson</footer>
              </blockquote>
            </div>
            <div class="carousel-item">
              <blockquote class="blockquote">
                <img src="${require('./img/face3.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                <p class="h3">There’s a point when you’re done simplifying. Otherwise, things get really complicated.</p>
                <footer>Frank Chimero</footer>
              </blockquote>
            </div>
            <div class="carousel-item">
              <blockquote class="blockquote">
                <img src="${require('./img/face4.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                <p class="h3">Designing for clients that don’t appreciate the value of design is like buying new tires for a rental car.</p>
                <footer>Joel Fisher</footer>
              </blockquote>
            </div>
            <div class="carousel-item">
              <blockquote class="blockquote">
                <img src="${require('./img/face5.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                <p class="h3">Every picture owes more to other pictures painted before than it owes to nature.</p>
                <footer>E.H. Gombrich</footer>
              </blockquote>
            </div>
          </div>
          <ol class="carousel-indicators">
            <li class="active"><img src="${require('./img/face1.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="0" class="img-fluid img-circle"></li>
            <li><img src="${require('./img/face2.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="1" class="img-fluid img-circle"></li>
            <li><img src="${require('./img/face3.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="2" class="img-fluid img-circle"></li>
            <li><img src="${require('./img/face4.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="3" class="img-fluid img-circle"></li>
            <li><img src="${require('./img/face5.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="4" class="img-fluid img-circle"></li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Text Content
    ================================================== -->

    <section class="section-text">
      <div class="container">
        <h3 class="text-xs-center">Make your mark on the product industry</h3>
        <div class="row p-y-3">
          <div class="col-md-5">
            <p class="wp wp-7">A posuere donec senectus suspendisse bibendum magna ridiculus a justo orci parturient suspendisse ad rhoncus cursus ut parturient viverra elit aliquam ultrices est sem. Tellus nam ad fermentum ac enim est duis facilisis congue a lacus adipiscing consequat risus consectetur scelerisque integer suspendisse a mus integer elit massa ut.</p>
          </div>
          <div class="col-md-5 col-md-offset-2 separator-x">
            <p class="wp wp-8">A posuere donec senectus suspendisse bibendum magna ridiculus a justo orci parturient suspendisse ad rhoncus cursus ut parturient viverra elit aliquam ultrices est sem. Tellus nam ad fermentum ac enim est duis facilisis congue a lacus adipiscing consequat risus consectetur scelerisque integer suspendisse a mus integer elit massa ut.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sign Up
    ================================================== -->

    <section class="section-signup bg-faded">
      <div class="container">
        <h3 class="text-xs-center m-b-3">Sign up to receive free updates as soon as they hit!</h3>
        <form>
          <div class="row">
            <div class="col-md-6 col-xl-3">
              <div class="form-group has-icon-left form-control-name">
                <label class="sr-only" for="inputName">Your name</label>
                <input type="text" class="form-control form-control-lg" id="inputName" placeholder="Your name">
              </div>
            </div>
            <div class="col-md-6 col-xl-3">
              <div class="form-group has-icon-left form-control-email">
                <label class="sr-only" for="inputEmail">Email address</label>
                <input type="email" class="form-control form-control-lg" id="inputEmail" placeholder="Email address" autocomplete="off">
              </div>
            </div>
            <div class="col-md-6 col-xl-3">
              <div class="form-group has-icon-left form-control-password">
                <label class="sr-only" for="inputPassword">Enter a password</label>
                <input type="password" class="form-control form-control-lg" id="inputPassword" placeholder="Enter a password" autocomplete="off">
              </div>
            </div>
            <div class="col-md-6 col-xl-3">
              <div class="form-group">
                <button type="submit" class="btn btn-primary btn-block">Sign up for free!</button>
              </div>
            </div>
          </div>
          <label class="c-input c-checkbox">
            <input type="checkbox" checked>
            <span class="c-indicator"></span> I agree to Land.io’s <a href="#">terms of service</a>
          </label>
        </form>
      </div>
    </section>

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
              <li class="nav-item active">
                <a class="nav-link" href="./index-carousel.html"><small>NEW</small> Slides<span class="sr-only">(current)</span></a>
              </li>
              <li class="nav-item"><a class="nav-link" href="ui-elements.html">UI Kit</a></li>
              <li class="nav-item"><a class="nav-link" href="https://github.com/tatygrassini/landio-html" target="_blank">GitHub</a></li>
              <li class="nav-item"><a class="nav-link scroll-top" href="#totop">Back to top <span class="icon-caret-up"></span></a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
`
        );
    }
}
