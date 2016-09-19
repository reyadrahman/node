/* @flow */

import Component from '../../../front-end-framework/component.js';
import type { LandingPageAppContext, LandingPageAppSubPageProps } from '../types.js';

export default class FrontPage extends Component<LandingPageAppContext, LandingPageAppSubPageProps> {
    componentDidMount() {
        super.componentDidMount();

        // input placeholders
        $('input, textarea').placeholder();

        // waypoints
        $('.wp-1').waypoint(function() {
          $('.wp-1').addClass('animated fadeInUp');
        }, {
          offset: '75%'
        });
        $('.wp-2').waypoint(function() {
          $('.wp-2').addClass('animated fadeInUp');
        }, {
          offset: '75%'
        });
        $('.wp-3').waypoint(function() {
          $('.wp-3').addClass('animated fadeInUp');
        }, {
          offset: '75%'
        });
        $('.wp-4').waypoint(function() {
          $('.wp-4').addClass('animated fadeIn');
        }, {
          offset: '75%'
        });
        $('.wp-5').waypoint(function() {
          $('.wp-5').addClass('animated fadeInRight');
        }, {
          offset: '50%'
        });
        $('.wp-6').waypoint(function() {
          $('.wp-6').addClass('animated fadeInLeft');
        }, {
          offset: '50%'
        });
        $('.wp-7').waypoint(function() {
          $('.wp-7').addClass('animated fadeInUp');
        }, {
          offset: '60%'
        });
        $('.wp-8').waypoint(function() {
          $('.wp-8').addClass('animated fadeInUp');
        }, {
          offset: '60%'
        });
    }

    render() {
        const { className } = this.props;
        // const state = this.props.stateCursor.get();

        return (`
            <div id="front-page" class="${className} page-wrapper">
                <!-- Intro
                ================================================== -->

                <section class="section-intro bg-faded text-xs-center">
                  <div class="container">
                    <h3 class="wp wp-1">Build your beautiful UI, the way you want it, with Land.io</h3>
                    <p class="lead wp wp-2">Craft memorable, emotive experiences with our range of beautiful UI elements.</p>
                    <img src="${require('../img/mock.jpg')}" alt="iPad mock" class="img-fluid wp wp-3">
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
                            <img src="${require('../img/face1.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                            <p class="h3">Good design at the front-end suggests that everything is in order at the back-end, whether or not that is the case.</p>
                            <footer>Dmitry Fadeyev</footer>
                          </blockquote>
                        </div>
                        <div class="carousel-item">
                          <blockquote class="blockquote">
                            <img src="${require('../img/face2.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                            <p class="h3">It’s not about knowing all the gimmicks and photo tricks. If you haven’t got the eye, no program will give it to you.</p>
                            <footer>David Carson</footer>
                          </blockquote>
                        </div>
                        <div class="carousel-item">
                          <blockquote class="blockquote">
                            <img src="${require('../img/face3.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                            <p class="h3">There’s a point when you’re done simplifying. Otherwise, things get really complicated.</p>
                            <footer>Frank Chimero</footer>
                          </blockquote>
                        </div>
                        <div class="carousel-item">
                          <blockquote class="blockquote">
                            <img src="${require('../img/face4.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                            <p class="h3">Designing for clients that don’t appreciate the value of design is like buying new tires for a rental car.</p>
                            <footer>Joel Fisher</footer>
                          </blockquote>
                        </div>
                        <div class="carousel-item">
                          <blockquote class="blockquote">
                            <img src="${require('../img/face5.jpg')}" height="80" width="80" alt="Avatar" class="img-circle">
                            <p class="h3">Every picture owes more to other pictures painted before than it owes to nature.</p>
                            <footer>E.H. Gombrich</footer>
                          </blockquote>
                        </div>
                      </div>
                      <ol class="carousel-indicators">
                        <li class="active"><img src="${require('../img/face1.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="0" class="img-fluid img-circle"></li>
                        <li><img src="${require('../img/face2.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="1" class="img-fluid img-circle"></li>
                        <li><img src="${require('../img/face3.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="2" class="img-fluid img-circle"></li>
                        <li><img src="${require('../img/face4.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="3" class="img-fluid img-circle"></li>
                        <li><img src="${require('../img/face5.jpg')}" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="4" class="img-fluid img-circle"></li>
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
              </div>
            </div>
        `);
    }
}
